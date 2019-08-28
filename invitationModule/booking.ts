import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import { Person } from 'models/main/Person'
import { Party } from 'models/main/Party'
import { PartyGroup } from 'models/main/partyGroup'
import { Role } from 'models/main/Role'
import { GetPartyAndPersonFromStandardEntityResult } from 'utils/party'

export default async function entityCreateInvitaion(
  that: any,
  entity: any,
  tableName: string,
  user?: JwtPayload,
  transaction?: Transaction,
  getPartyAndPersonFromStandardEntity?: (entity: any) => Promise<GetPartyAndPersonFromStandardEntityResult>
) {
  const { frontendUrl } = await that.swivelConfigService.get()
  const entityData = entity.hasOwnProperty('dataValues')
    ? JSON.parse(JSON.stringify(entity.dataValues))
    : entity || {}
  const entityFlexData = entityData.flexData && entityData.flexData.data ? entityData.flexData.data : {}
  console.debug(`Create Invitation to ${tableName} [ID: ${entity.id}]`)
  const partyGroupCode = entityData.partyGroupCode
  const partyGroup: PartyGroup = await that.partyGroupService.findOne(
    { where: { code: partyGroupCode }, transaction },
    user
  )
  if (!partyGroup) {
    throw new Error('Party Group Not found')
  }
  const defaulConfiguration = partyGroup.configuration || {}
  const url = `${frontendUrl}${tableName}/${entity.id}`
  const roles = await that.roleService.find({ where: { roleName: { $in: ['USER', tableName.toLocaleUpperCase()] } } }, user)
  const basePerson = {
    configuration: {
      dateFomat: defaulConfiguration.defaultDateFormat || 'YYYY-MM-DD',
      dateTimeFormat: defaulConfiguration.defaultDateTimeFormat || 'YYYY-MM-DD HH:mm:ss',
      timeFormat: defaulConfiguration.defaultTimeFormat || 'HH:mm:ss',
      timezone: defaulConfiguration.defaultTimezone || 'Asia/Hong_Kong',
      locale: defaulConfiguration.defaultLocale || 'en'
    },
    roles: roles.map((role: any) => ({ id: role.id }))
  }
  console.log(basePerson, 'p')
  const parties = await getPartyAndPersonFromStandardEntity(entity)
  for (const partyType of Object.keys(parties)) {
    console.log(partyType, 'p')
    const content = parties[partyType]
    let party = content.party
    if (!party.id) {
      // create a new party in db
      if (party.name) {
        delete party.id // avoid update
        party = await that.partyService.save(party, user, transaction)
        if (content.fromFlexData) {
          entityFlexData[`${partyType}Party`] = party
          entityFlexData[`${partyType}Party`] = party.id
        } else {
          entityData[`${partyType}Party`] = party
          entityData[`${partyType}PartyId`] = party.id
        }
      }

    }
    for (const person of content.people) {
      let savedPerson = await that.personService.findOne(
        {
          where: { $or: [{ id: person.id }, { userName: { $regexp: person.userName } }] },
          transaction
        },
        user
      )
      if (savedPerson) {
        const savedPersonValue = savedPerson.hasOwnProperty('dataValues')
          ? JSON.parse(JSON.stringify(savedPerson.dataValues))
          : savedPerson
          // if (savedPerson) {
          //
          //   const personParty = savedPersonValue.parties
          //   if (!personParty.find(p => p.id === party.id)) {
          //     personParty.push({ id: party.id })
          //     await this.personService.save({ id: savedPersonValue.id, parties: personParty }, transaction, user)
          //   }
          // } else {
      } else {
        delete person.id
        const saveperson = { ...person, ...basePerson, flexData: { data: { test: 123 } } }
        if (saveperson.userName) {
          const invitation = await that.save({
            person: saveperson,
            partyGroupCode: partyGroup.code
          }, user, transaction)
          savedPerson = invitation.person
          if (content.fromFlexData) {
            if (entityFlexData[`${partyType}PartyContactPersonEmail`] === savedPerson.userName) {
              entityFlexData[`${partyType}PartyContactPersonId`] = savedPerson.id
            } else {
              entityFlexData[`${partyType}PartyContacts`] = (entityFlexData[`${partyType}PartyContacts`] || []).reduce((all: any, one: any) => {
                if (one['Email'] === savedPerson.userName) {
                  one['PersonId'] = savedPerson.id
                }
                return all
              }, entityFlexData[`${partyType}PartyContacts`])
            }
          } else {
            if (entityData[`${partyType}PartyContactPersonEmail`] === savedPerson.userName) {
              entityData[`${partyType}PartyContactPersonId`] = savedPerson.id
            } else {
              entityData[`${partyType}PartyContacts`] = (entityData[`${partyType}PartyContacts`] || []).reduce((all: any, one: any) => {
                if (one['Email'] === savedPerson.userName) {
                  one['PersonId'] = savedPerson.id
                }
                return all
              }, entityData[`${partyType}PartyContacts`])
            }
          }
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
