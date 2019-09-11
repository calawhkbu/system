import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import { PartyGroup } from 'models/main/partyGroup'
import { GetPartyAndPersonFromStandardEntityResult } from 'utils/party'

export default async function entityCreateInvitaion(
  that: any,
  entity: any,
  tableName: string,
  user?: JwtPayload,
  transaction?: Transaction,
  getPartyAndPersonFromStandardEntity?: (entity: any) => Promise<GetPartyAndPersonFromStandardEntityResult>
) {
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
  const roles = await that.roleService.find({ where: { roleName: { $in: ['USER', tableName.toLocaleUpperCase()] } } }, user)
  const basePerson = {
    configuration: {
      dateFomat: defaulConfiguration.defaultDateFormat || 'YYYY-MM-DD',
      dateTimeFormat: defaulConfiguration.defaultDateTimeFormat || 'YYYY-MM-DD HH:mm:ss',
      timeFormat: defaulConfiguration.defaultTimeFormat || 'HH:mm:ss',
      timezone: defaulConfiguration.defaultTimezone || 'Asia/Hong_Kong',
      locale: defaulConfiguration.defaultLocale || 'en',
      url: `/${tableName}/${entity.id}`
    },
    roles: roles.map((role: any) => ({ id: role.id }))
  }
  const parties = await getPartyAndPersonFromStandardEntity(entity)
  for (const partyType of Object.keys(parties)) {
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
    if (party.id) {
      for (const person of content.people) {
        let savedPerson = await that.personService.findOne(
          {
            where: { $or: [{ id: person.id }, { userName: person.userName }] },
            transaction
          },
          user
        )
        console.log(savedPerson, 'invitation')
        if (savedPerson) {
          const savedPersonValue = savedPerson.hasOwnProperty('dataValues')
            ? JSON.parse(JSON.stringify(savedPerson.dataValues))
            : savedPerson
          const personParty = savedPersonValue.parties
          if (!personParty.find((p: any) => (p.id === party.id))) {
             personParty.push({ id: party.id })
          }
          //     await this.personService.save({ id: savedPersonValue.id, parties: personParty }, transaction, user)
        } else {
          if (person.userName) {
            delete person.id
            console.log('=========', 'invitation')
            const invitation = await that.save({
              person: { ...person, ...basePerson, parties: [{ id: party.id }] },
              partyGroupCode: partyGroup.code
            }, user, transaction)
            console.log('=========', 'invitation')
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
  }
  return {
    ...entityData,
    flexData: {
      ...entityData.flexData,
      data: entityFlexData,
    },
  }
}
