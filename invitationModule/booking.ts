import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import { Person } from 'models/main/Person'
import { Party } from 'models/main/Party'
import { PartyGroup } from 'models/main/partyGroup'
import { Role } from 'models/main/Role'

export default async function entityCreateInvitaion(
  that: any,
  entity: any,
  tableName: string,
  user?: JwtPayload,
  transaction?: Transaction
) {
  const { frontendUrl } = await that.swivelConfigService.get()
  const entityData = entity.hasOwnProperty('dataValues')
    ? JSON.parse(JSON.stringify(entity.dataValues))
    : entity || {}
  const entityFlexData =
    entityData.flexData && entityData.flexData.data ? entityData.flexData.data : {}
  const url = `${frontendUrl}${tableName}/${entity.id}`
  const roles = await that.roleService.find({ where: { roleName: { $in: ['USER'] } } }, user)
  console.debug(`Create Invitation to ${tableName} [ID: ${entity.id}]`)
  const partyGroupCode = entityData.partyGroupCode
  const partyGroup: PartyGroup = await that.partyGroupService.findOne(
    { where: { code: partyGroupCode }, transaction },
    user
  )
  if (!partyGroup) {
    throw new Error('Party Group Not found')
  }
  const parties = Object.keys(entityFlexData).reduce(
    (partiesMap: any, key: string) => {
      if (key !== 'moreParty' && key.includes('Party')) {
        const type = key.substring(0, key.lastIndexOf('Party'))
        if (!Object.keys([partiesMap]).includes(type)) {
          return {
            ...partiesMap,
            [type]: handlePartyAndPerson(entityFlexData, type, partyGroup, url, roles, true),
          }
        }
      }
      return partiesMap
    },
    Object.keys(entityData).reduce((partiesMap: any, key: string) => {
      if (key.includes('Party')) {
        const type = key.substring(0, key.lastIndexOf('Party'))
        if (!Object.keys([partiesMap]).includes(type)) {
          return {
            ...partiesMap,
            [type]: handlePartyAndPerson(entityData, type, partyGroup, url, roles, false),
          }
        }
      }
      return partiesMap
    }, {})
  )
  for (const partyType of Object.keys(parties)) {
    const content = parties[partyType]
    const party = content.party
    // find party in database
    let savedParty: Party = party.id
      ? await that.partyService.findOne({ where: { id: party.id }, transaction }, user)
      : null
    if (!savedParty) {
      // create party if party not find
      delete party.id // avoid update
      if (party.name) {
        savedParty = await that.partyService.save(party, user, transaction)
      }
    }
    if (savedParty) {
      if (content.flexData) {
        entityFlexData[`${partyType}PartyId`] = savedParty.id
      } else {
        entityData[`${partyType}PartyId`] = savedParty.id
      }
    }

    for (const person of content.people) {
      let savedPerson: Person = person.id
        ? await that.personService.findOne({ where: { id: person.id }, transaction }, user)
        : null
      if (savedPerson) {
        savedPerson = savedPerson.hasOwnProperty('dataValues')
          ? JSON.parse(JSON.stringify(savedPerson.dataValues))
          : savedPerson
        if (!savedPerson.parties.find(party => party.id === savedParty.id)) {
          savedPerson.parties.push(savedParty)
        }
        await that.personService.save(savedPerson, user, transaction)
      } else {
        delete person.id
        person.parties.push(savedParty)
        // savedPerson = await that.personService.save(person, user, transaction)
        const invitation = await that.createInvitation(person, partyGroup.code, user, transaction)
        savedPerson = invitation.person
      }
      if (content.flexData) {
        if (entityFlexData[`${partyType}PartyContactPersonEmail`] === savedPerson.username) {
          entityFlexData[`${partyType}PartyContactPersonId`] = savedPerson.id
        } else {
          entityFlexData[`${partyType}PartyContacts`] = entityFlexData[
            `${partyType}PartyContacts`
          ].reduce((all: any, one: any) => {
            if (one['Email'] === savedPerson.username) {
              one['PersonId'] = savedPerson.id
            }
            return all
          }, entityFlexData[`${partyType}PartyContacts`])
        }
      } else {
        if (entityData[`${partyType}PartyContactPersonEmail`] === savedPerson.userName) {
          entityData[`${partyType}PartyContactPersonId`] = savedPerson.id
        } else {
          entityData[`${partyType}PartyContacts`] = entityData[`${partyType}PartyContacts`].reduce(
            (all: any, one: any) => {
              if (one['Email'] === savedPerson.userName) {
                one['PersonId'] = savedPerson.id
              }
              return all
            },
            entityData[`${partyType}PartyContacts`]
          )
        }
      }
    }
  }
  return {
    ...entityData,
    flexData: {
      ...entityData.flexData,
      data: entityFlexData,
    },
  }
}

const handlePartyAndPerson = (
  data: any,
  type: string,
  partyGroup: PartyGroup,
  url: string,
  roles: Role[],
  isFlexData: boolean = false
): {
  flexData: boolean
  party: any
  people: any[]
} => {
  const defaultConfiguration = partyGroup.configuration
  const configuration = {
    url,
    locale: defaultConfiguration.defaultLocale,
    timeFormat: defaultConfiguration.defaultTimeFormat,
    dateFormat: defaultConfiguration.defaultDateFormat,
    dateTimeFormat: defaultConfiguration.defaultDateTimeFormat,
    timezone: defaultConfiguration.defaultTimezone,
  }
  const people = []
  if (data[`${type}PartyContactPersonId`] || data[`${type}PartyContactEmail`]) {
    const displayName = data[`${type}PartyContactContactName`] || null
    const firstName =
      (displayName || '').indexOf(' ') >= 0
        ? data[`${type}PartyContactContactName`].split(' ')[0]
        : displayName
    const lastName =
      (displayName || '').indexOf(' ') >= 0
        ? data[`${type}PartyContactContactName`].split(' ')[1]
        : null
    const contacts = []
    if (data[`${type}PartyContactContactEmail`]) {
      contacts.push({ contactType: 'email', content: data[`${type}PartyContactEmail`] })
    }
    if (data[`${type}PartyContactContactPhone`]) {
      contacts.push({ contactType: 'phone', content: data[`${type}PartyContactPhone`] })
    }
    people.push({
      id: data[`${type}PartyContactPersonId`] || null,
      userName: data[`${type}PartyContactEmail`] || null,
      firstName,
      lastName,
      displayName,
      parties: [],
      roles,
      configuration,
      contacts,
    })
  }
  if (data[`${type}PartyContacts`] && data[`${type}PartyContacts`].length) {
    for (const contact of data[`${type}PartyContacts`]) {
      const contactDisplayName = contact['Name'] || null
      const contactFirstName =
        (contactDisplayName || '').indexOf(' ') >= 0
          ? contactDisplayName.split(' ')[0]
          : contactDisplayName
      const contactLastName =
        (contactDisplayName || '').indexOf(' ') >= 0 ? contactDisplayName.split(' ')[1] : null
      const contactContacts = []
      if (contact[`Email`]) {
        contactContacts.push({ contactType: 'email', content: contact[`Email`] })
      }
      if (data[`${type}PartyContactContactPhone`]) {
        contactContacts.push({ contactType: 'phone', content: contact[`Phone`] })
      }
      people.push({
        id: contact[`PersonId`] || null,
        userName: contact[`Email`] || null,
        firstName: contactFirstName,
        lastName: contactLastName,
        displayName: contactDisplayName,
        parties: [],
        roles,
        configuration,
        contacts: contactContacts,
      })
    }
  }
  return {
    flexData: true,
    party: {
      isBranch: false,
      types: [{ type }],
      thirdPartyCode: null,
      shortName: null,
      groupName: null,
      partyGroupCode: partyGroup.code,
      id: data[`${type}PartyId`] || null,
      name: data[`${type}PartyName`] || null,
      address: data[`${type}PartyAddress`] || null,
      countryCode: data[`${type}PartyCountryCode`] || null,
      stateCode: data[`${type}PartyStateCode`] || null,
      cityCode: data[`${type}PartyCityCode`] || null,
      zip: data[`${type}PartyZip`] || null,
    },
    people,
  }
}
