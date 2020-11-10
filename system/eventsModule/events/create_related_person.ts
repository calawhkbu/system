import { EventService, EventHandlerConfig, EventData, EventAllService } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction, Op } from 'sequelize'
import _ = require('lodash')
import BaseEventHandler from 'modules/events/baseEventHandler'

interface InviteForm {
  tableName: string
  entityId: string|number
  person: {
    userName: string
    firstName: string|null
    lastName: string|null
    displayName: string|null
  }
  partyId: (string|number)[]
  status: string
}

export default class CreateRelatedPersonEvent extends BaseEventHandler {
  constructor(
    protected  eventDataList: EventData<any>[],
    protected readonly eventHandlerConfig: EventHandlerConfig,
    protected readonly repo: string,
    protected readonly eventService: EventService,
    protected readonly allService: EventAllService,
    protected readonly user?: JwtPayload,
    protected readonly transaction?: Transaction
  ) {
    super(eventDataList, eventHandlerConfig, repo, eventService, allService, user, transaction)
  }

  private getFixedKeyByTableName(tableName: string): string[] {
    switch (tableName) {
      case 'shipment': return [
        'shipper', 'consignee', 'office', 'roAgent',
        'controllingCustomer', 'linerAgent', 'agent', 'notifyParty'
      ]
      case 'booking': return [
        'shipper', 'consignee', 'forwarder', 'roAgent',
        'controllingCustomer', 'linerAgent', 'agent', 'notifyParty'
      ]
      default: return []
    }
  }

  private updateInviteForm(
    inviteData: InviteForm[],
    email: string,
    name: string,
    partyId: string|number,
    tableName: string,
    id: string,
    status: string
  ): InviteForm[] {
    const index = inviteData.findIndex(i => i.person.userName === email)
    if (index > -1) {
      inviteData.splice(index, 1, {
        ...inviteData[index],
        partyId: [...inviteData[index].partyId, partyId],
      })
    } else {
      inviteData.push({
        tableName,
        entityId: id,
        person: {
          userName: email,
          firstName: null,
          lastName: null,
          displayName: name,
        },
        partyId: [partyId],
        status
      })
    }
    return inviteData
  }

  private getInvitationDataFromEntity(eventDataList: EventData<any>[]): InviteForm[] {
    return eventDataList.reduce((
      invitation: InviteForm[],
      { latestEntity, partyGroupCode, tableName, primaryKey, invitationStatus = {} }: EventData<any> & { tableName: string, primaryKey: string, invitationStatus: { [partyGroupCode: string]: string } }
    ) => {
      const finalInvitationStatus = invitationStatus[partyGroupCode] || 'pending'
      const partyTable = _.get(latestEntity, `${tableName}Party`, {})
      const forwarderPartyId = _.get(partyTable, 'forwarderPartyId', null)
      if (forwarderPartyId) {
        const picId = _.get(latestEntity, 'picId', null)
        const picEmail = _.get(latestEntity, 'picEmail', null)
        if (picEmail) {
          invitation = this.updateInviteForm(invitation, picEmail, picId, forwarderPartyId, tableName, primaryKey, finalInvitationStatus)
        }
        const createdUserId = _.get(latestEntity, 'createdUserId', null)
        const createdUserEmail = _.get(latestEntity, 'createdUserEmail', null)
        if (createdUserEmail) {
          invitation = this.updateInviteForm(invitation, createdUserEmail, createdUserId, forwarderPartyId, tableName, primaryKey, finalInvitationStatus)
        }
        const updatedUserId = _.get(latestEntity, 'updatedUserId', null)
        const updatedUserEmail = _.get(latestEntity, 'updatedUserEmail', null)
        if (updatedUserEmail) {
          invitation = this.updateInviteForm(invitation, updatedUserEmail, updatedUserId, forwarderPartyId, tableName, primaryKey, finalInvitationStatus)
        }
      }
      const partyTableFlexData = _.get(partyTable, `flexData`, {})
      for (const key of this.getFixedKeyByTableName(tableName)) {
        const partyId = _.get(partyTable, `${key}PartyId`, null)
        if (partyId) {
          const mainContactName = _.get(partyTable, `${key}PartyContactName`, null)
          const mainContactEmail = _.get(partyTable, `${key}PartyContactEmail`, null)
          if (mainContactEmail) {
            invitation = this.updateInviteForm(invitation, mainContactEmail, mainContactName, partyId, tableName, primaryKey, finalInvitationStatus)
          }
          const otherContacts = _.get(partyTable, `${key}PartyContacts`, [])
          if (otherContacts && otherContacts.length) {
            for (const { Name, Email } of otherContacts) {
              if (Email) {
                invitation = this.updateInviteForm(invitation, Email, Name, partyId, tableName, primaryKey, finalInvitationStatus)
              }
            }
          }
        }
      }
      if (partyTableFlexData && Object.keys(partyTableFlexData).length) {
        const morePartyKeys = _.get(partyTableFlexData, 'moreParty', [])
        if (morePartyKeys && morePartyKeys.length) {
          for (const morePartyKey of morePartyKeys) {
            const partyId = _.get(partyTable, `${morePartyKey}PartyId`, null)
            if (partyId) {
              const mainContactName = _.get(partyTableFlexData, `${morePartyKey}PartyContactName`, null)
              const mainContactEmail = _.get(partyTableFlexData, `${morePartyKey}PartyContactEmail`, null)
              if (mainContactEmail) {
                invitation = this.updateInviteForm(invitation, mainContactEmail, mainContactName, partyId, tableName, primaryKey, finalInvitationStatus)
              }
              const otherContacts = _.get(partyTableFlexData, `${morePartyKey}PartyContacts`, [])
              if (otherContacts && otherContacts.length) {
                for (const { Name, Email } of otherContacts) {
                  if (Email) {
                    invitation = this.updateInviteForm(invitation, Email, Name, partyId, tableName, primaryKey, finalInvitationStatus)
                  }
                }
              }
            }
          }
        }
      }
      return invitation
    }, [])
  }

  public async mainFunction(eventDataList: EventData<any>[]) {
    console.debug('Start Excecute [Create Related Person]...', this.constructor.name)
    try {
      const invitations: InviteForm[] = this.getInvitationDataFromEntity(eventDataList)
      console.log(`Create ${invitations.length}`, this.constructor.name)
      if (invitations && invitations.length) {
        const userNameList = invitations.map(i => i.person.userName)
        const people = await this.allService.personTableService.find({
          where: { userName: { [Op.in]: userNameList } }
        })
        const doit = invitations.reduce((selected: any[], invitation: InviteForm) => {
          if (!people.find(person => person.userName === invitation.person.userName)) {
            selected.push({
              tableName: invitation.tableName,
              entityId: invitation.entityId,
              person: invitation.person,
              partyId: invitation.partyId,
              partyType: [],
              status: invitation.status
            })
          }
          return selected
        }, [])
        await this.allService.invitationTableService.bulkEntityCreateInvitation(
          doit,
          null,
          this.user,
          this.transaction
        )
      }
    } catch (e) {
      console.error(e, e.stack, this.constructor.name)
    }
    console.debug('End Excecute [Create Related Person]...', this.constructor.name)
    return eventDataList
  }
}
