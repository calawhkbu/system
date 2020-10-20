import BaseEventHandler from 'modules/events/baseEventHandler'
import { EventService, EventConfig, EventData, EventHandlerConfig, EventAllService } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import _ = require('lodash')
import BluebirdPromise = require('bluebird')

interface NotifyObject {
  isUpdate: boolean
  name: string
  email: string
  entity: any
  partyGroupCode: string
  subject: string
  language: string
  template: string
}

export default class NotifyEntityEvent extends BaseEventHandler {
  constructor(
    protected eventDataList: EventData<any>[],
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
  private getPartyFromEntity(eventDataList: EventData<any>[]) {
    return eventDataList.reduce((
      dataList: NotifyObject[],
      {
        originalEntity,
        latestEntity,
        tableName,
        notifyKeys = {},
      }: EventData<any> & { tableName: string, primaryKey: string }
    ) => {
      const partyGroupCode = _.get(latestEntity, 'partyGroupCode', null)
      const finalKeys = notifyKeys[partyGroupCode] || []
      console.log(finalKeys, this.constructor.name)
      const picEmail = _.get(latestEntity, 'picEmail', null)
      if (picEmail && finalKeys.includes('pic')) {
        dataList.push({
          name: _.get(latestEntity, 'picId', null),
          email: _.get(latestEntity, 'picEmail', null),
          entity: originalEntity,
          isUpdate: originalEntity ? true : false,
          partyGroupCode,
          subject: originalEntity ? `${tableName}-preview` : `new-${tableName}-preview`,
          language: 'en',
          template: originalEntity ? `message/${tableName}-preview` : `message/new-${tableName}-preview`,
        })
      }
      const createdBy = _.get(latestEntity, 'createdBy', null)
      if (createdBy && finalKeys.includes('createdBy')) {
        dataList.push({
          name: createdBy, // TODO:: createdBy name
          email: createdBy,
          entity: originalEntity,
          isUpdate: originalEntity ? true : false,
          partyGroupCode,
          subject: originalEntity ? `${tableName}-preview` : `new-${tableName}-preview`,
          language: 'en',
          template: originalEntity ? `message/${tableName}-preview` : `message/new-${tableName}-preview`,
        })
      }
      const updatedBy = _.get(latestEntity, 'updatedBy', null)
      if (updatedBy && createdBy !== updatedBy && finalKeys.includes('updatedBy')) {
        dataList.push({
          name: updatedBy, // TODO:: updatedBy name
          email: updatedBy,
          entity: originalEntity,
          isUpdate: originalEntity ? true : false,
          partyGroupCode,
          subject: originalEntity ? `${tableName}-preview` : `new-${tableName}-preview`,
          language: 'en',
          template: originalEntity ? `message/${tableName}-preview` : `message/new-${tableName}-preview`,
        })
      }
      const partyTable = _.get(latestEntity, `${tableName}Party`, {})
      const partyTableFlexData = _.get(partyTable, `flexData`, {})
      for (const mainKey of this.getFixedKeyByTableName(tableName)) {
        if (finalKeys.includes(mainKey)) {
          const party = _.get(partyTable, `${mainKey}Party`, null)
          const sentEmail = _.get(partyTable, `${mainKey}PartyEmail`, null) ||
            _.get(partyTable, `${mainKey}Party.email`, null) ||
            null
          if (party && sentEmail) {
            dataList.push({
              name: _.get(partyTable, `${mainKey}PartyName`, null) || _.get(partyTable, `${mainKey}Party.name`, null),
              email: sentEmail,
              entity: originalEntity,
              isUpdate: originalEntity ? true : false,
              partyGroupCode,
              subject: originalEntity ? `${tableName}-preview` : `new-${tableName}-preview`,
              language: 'en',
              template: originalEntity ? `message/${tableName}-preview` : `message/new-${tableName}-preview`,
            })
          }
          const mainContactEmail = _.get(partyTable, `${mainKey}PartyContactEmail`, null)
          if (mainContactEmail) {
            dataList.push({
              name: _.get(partyTable, `${mainKey}PartyContactName`, null),
              email: mainContactEmail,
              entity: originalEntity,
              isUpdate: originalEntity ? true : false,
              partyGroupCode,
              subject: originalEntity ? `${tableName}-preview` : `new-${tableName}-preview`,
              language: 'en',
              template: originalEntity ? `message/${tableName}-preview` : `message/new-${tableName}-preview`,
            })
          }
          const otherContacts = _.get(partyTable, `${mainKey}PartyContacts`, [])
          if (otherContacts && otherContacts.length) {
            for (const { Name, Email } of otherContacts) {
              if (Email) {
                dataList.push({
                  name: Name,
                  email: Email,
                  entity: originalEntity,
                  isUpdate: originalEntity ? true : false,
                  partyGroupCode,
                  subject: originalEntity ? `${tableName}-preview` : `new-${tableName}-preview`,
                  language: 'en',
                  template: originalEntity ? `message/${tableName}-preview` : `message/new-${tableName}-preview`,
                })
              }
            }
          }
        }

      }
      if (partyTableFlexData && Object.keys(partyTableFlexData).length) {
        const morePartyKeys = _.get(partyTableFlexData, 'moreParty', [])
        if (morePartyKeys && morePartyKeys.length) {
          for (const morePartyKey of morePartyKeys) {
            if (finalKeys.includes(morePartyKey)) {
              const partyId = _.get(partyTableFlexData, `${morePartyKey}PartyId`, null)
              if (partyId) {
                const party = _.get(partyTableFlexData, `${morePartyKey}Party`, null)
                const sentEmail = _.get(partyTableFlexData, `${morePartyKey}PartyEmail`, null) ||
                  _.get(partyTableFlexData, `${morePartyKey}Party.email`, null) ||
                  null
                if (party && sentEmail) {
                  dataList.push({
                    name: _.get(partyTableFlexData, `${morePartyKey}PartyName`, null) || _.get(partyTableFlexData, `${morePartyKey}Party.name`, null),
                    email: sentEmail,
                    entity: originalEntity,
                    isUpdate: originalEntity ? true : false,
                    partyGroupCode,
                    subject: originalEntity ? `${tableName}-preview` : `new-${tableName}-preview`,
                    language: 'en',
                    template: originalEntity ? `message/${tableName}-preview` : `message/new-${tableName}-preview`,
                  })
                }
                const mainContactName = _.get(partyTableFlexData, `${morePartyKey}PartyContactName`, null)
                const mainContactEmail = _.get(partyTableFlexData, `${morePartyKey}PartyContactEmail`, null)
                if (mainContactEmail) {
                  dataList.push({
                    name: mainContactName,
                    email: mainContactEmail,
                    entity: originalEntity,
                    isUpdate: originalEntity ? true : false,
                    partyGroupCode,
                    subject: originalEntity ? `${tableName}-preview` : `new-${tableName}-preview`,
                    language: 'en',
                    template: originalEntity ? `message/${tableName}-preview` : `message/new-${tableName}-preview`,
                  })
                }
                const otherContacts = _.get(partyTableFlexData, `${morePartyKey}PartyContacts`, [])
                if (otherContacts && otherContacts.length) {
                  for (const { Name, Email } of otherContacts) {
                    if (Email) {
                      dataList.push({
                        name: Name,
                        email: Email,
                        entity: originalEntity,
                        isUpdate: originalEntity ? true : false,
                        partyGroupCode,
                        subject: originalEntity ? `${tableName}-preview` : `new-${tableName}-preview`,
                        language: 'en',
                        template: originalEntity ? `message/${tableName}-preview` : `message/new-${tableName}-preview`,
                      })
                    }
                  }
                }
              }
            }
          }

        }
      }
      return dataList
    }, [])
  }

  public async mainFunction(eventDataList: EventData<any>[]): Promise<any[]> {
    console.debug('Start Excecute [Notify Party]...', this.constructor.name)
    try {
      const lists = this.getPartyFromEntity(eventDataList)
      console.log(`Send out email size = ${lists.length}`, this.constructor.name)
      if (lists && lists.length) {
        await BluebirdPromise.map(lists, async ({ name, email, entity, isUpdate, partyGroupCode, language, template, subject }: NotifyObject) => {
          try {
            await this.allService.messagerService.send(
              'email',
              {
                to: [email],
                subject,
                html: { path: template, language, partyGroupCode }
              },
              entity,
              new Date(),
              'mailgun'
            )
            // await this.allService.messagerService.scheduleSend({
            //   type: 'email',
            //   option: {
            //     to: [email],
            //     subject,
            //     html: { path: template, language, partyGroupCode }
            //   },
            //   context: entity,
            //   handlerName: 'mailgun'
            // })
          } catch (e) {
            console.error(e, e.stack, this.constructor.name)
          }
        }, { concurrency: 30 })
      }
    } catch (e) {
      console.error(e, e.stack, this.constructor.name)
    }
    console.debug('End Excecute [Notify Party]...', this.constructor.name)
    return null
  }
}
