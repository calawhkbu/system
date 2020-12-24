import BaseEventHandler from 'modules/events/baseEventHandler'
import { EventService, EventConfig, EventData, EventHandlerConfig, EventAllService } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction, Op, QueryTypes } from 'sequelize'
import _ = require('lodash')
import * as qrcode from 'yaqrcode'
import BluebirdPromise = require('bluebird')
import { BookingTableService } from 'modules/sequelize/services/table/booking'

interface NotifyObject {
  isUpdate: boolean
  name: string
  email: string
  originalEntity: any
  entity: any
  partyGroupCode: string
  subject: string
  language: string
  template: string
  type: string
}

const noName = 'Sir / Madam'

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
        'controllingCustomer', 'linerAgent', 'agent', 'notifyParty', 'controllingParty'
      ]
      case 'booking': return [
        'shipper', 'consignee', 'forwarder', 'roAgent',
        'controllingCustomer', 'linerAgent', 'agent', 'notifyParty', 'controllingParty'
      ]
      default: return []
    }
  }
  private getPartyFromEntity(eventDataList: EventData<any>[]) {
    return eventDataList.reduce((
      dataList: NotifyObject[],
      {
        eventType,
        originalEntity,
        latestEntity,
        tableName,
        notifyKeys = {},
        extraEmail = {}
      }: EventData<any> & { tableName: string, primaryKey: string }
    ) => {
      const partyGroupCode = _.get(latestEntity, 'partyGroupCode', null)
      const finalKeys = notifyKeys[partyGroupCode] || []
      const extraEmailHandle = extraEmail[partyGroupCode] || []
      if (extraEmailHandle && extraEmailHandle.length) {
        for (const { func = 'return true', name, email } of extraEmailHandle) {
          const callFunc = typeof func === 'function' ? func : new Function('originalEntity', 'latestEntity', 'context', func)
          if (callFunc(originalEntity, latestEntity, this)) {
            dataList.push({
              type: 'extra',
              name,
              email,
              originalEntity: originalEntity,
              entity: latestEntity,
              isUpdate: eventType === 'update' ? true : false,
              partyGroupCode,
              subject: eventType === 'update' ? `${tableName}-preview` : `new-${tableName}-preview`,
              language: 'en',
              template: eventType === 'update' ? `message/${tableName}-preview` : `message/new-${tableName}-preview`,
            })
          }
        }
      }
      const picEmail = _.get(latestEntity, 'picEmail', null)
      if (picEmail && finalKeys.includes('pic')) {
        dataList.push({
          type: 'pic',
          name: _.get(latestEntity, 'picId', noName),
          email: picEmail,
          originalEntity: originalEntity,
          entity: latestEntity,
          isUpdate: eventType === 'update' ? true : false,
          partyGroupCode,
          subject: eventType === 'update' ? `${tableName}-preview` : `new-${tableName}-preview`,
          language: 'en',
          template: eventType === 'update' ? `message/${tableName}-preview` : `message/new-${tableName}-preview`,
        })
      }
      const createdBy = _.get(latestEntity, 'createdBy', null)
      const createdPerson = _.get(latestEntity, 'createdPerson', null)
      const createdIsAPI = _.get(latestEntity, 'createdIsAPI', null)
      const createdUserId = _.get(latestEntity, 'createdUserId', null)
      const createdUserEmail = _.get(latestEntity, 'createdUserEmail', null)
      if ((createdBy || createdUserEmail) && finalKeys.includes('createdBy')) {
        const finalName = createdIsAPI
          ? (createdUserId || createdUserEmail || (createdPerson ? createdPerson.displayName : null) || noName)
          : (createdPerson && (createdPerson.displayName || createdPerson.lastName || createdPerson.displayName)
            ? (createdPerson.displayName || `${createdPerson.firstName} ${createdPerson.lastName}`)
            : noName)
        const finalEmail = createdIsAPI ? createdUserEmail : createdBy
        dataList.push({
          type: 'createdBy',
          name: finalName,
          email: finalEmail,
          originalEntity: originalEntity,
          entity: latestEntity,
          isUpdate: eventType === 'update' ? true : false,
          partyGroupCode,
          subject: eventType === 'update' ? `${tableName}-preview` : `new-${tableName}-preview`,
          language: 'en',
          template: eventType === 'update' ? `message/${tableName}-preview` : `message/new-${tableName}-preview`,
        })
      }
      const updatedBy = _.get(latestEntity, 'updatedBy', null)
      const updatedPerson = _.get(latestEntity, 'updatedPerson', null)
      const updatedIsAPI = _.get(latestEntity, 'updatedIsAPI', null)
      const updatedUserId = _.get(latestEntity, 'updatedUserId', null)
      const updatedUserEmail = _.get(latestEntity, 'updatedUserEmail', null)
      if ((updatedBy || updatedUserEmail) && finalKeys.includes('updatedBy')) {
        const finalName = updatedIsAPI
          ? (updatedUserId || updatedUserEmail || (updatedPerson ? updatedPerson.displayName : null) || noName)
          : (updatedPerson && (updatedPerson.displayName || updatedPerson.lastName || updatedPerson.displayName)
            ? (updatedPerson.displayName || `${updatedPerson.firstName} ${updatedPerson.lastName}`)
            : noName)

        const finalEmail = updatedIsAPI ? updatedUserEmail : updatedBy
        dataList.push({
          type: 'updatedBy',
          name: finalName,
          email: finalEmail,
          entity: latestEntity,
          originalEntity: originalEntity,
          isUpdate: eventType === 'update' ? true : false,
          partyGroupCode,
          subject: eventType === 'update' ? `${tableName}-preview` : `new-${tableName}-preview`,
          language: 'en',
          template: eventType === 'update' ? `message/${tableName}-preview` : `message/new-${tableName}-preview`,
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
              type: 'party',
              name: _.get(partyTable, `${mainKey}PartyName`, null) || _.get(partyTable, `${mainKey}Party.name`, null) || noName,
              email: sentEmail,
              entity: latestEntity,
              originalEntity: originalEntity,
              isUpdate: eventType === 'update' ? true : false,
              partyGroupCode,
              subject: eventType === 'update' ? `${tableName}-preview` : `new-${tableName}-preview`,
              language: 'en',
              template: eventType === 'update' ? `message/${tableName}-preview` : `message/new-${tableName}-preview`,
            })
          }
          const mainContactEmail = _.get(partyTable, `${mainKey}PartyContactEmail`, null)
          if (mainContactEmail) {
            dataList.push({
              type: 'partyContact',
              name: _.get(partyTable, `${mainKey}PartyContactName`, noName),
              email: mainContactEmail,
              entity: latestEntity,
              originalEntity: originalEntity,
              isUpdate: eventType === 'update' ? true : false,
              partyGroupCode,
              subject: eventType === 'update' ? `${tableName}-preview` : `new-${tableName}-preview`,
              language: 'en',
              template: eventType === 'update' ? `message/${tableName}-preview` : `message/new-${tableName}-preview`,
            })
          }
          const otherContacts = _.get(partyTable, `${mainKey}PartyContacts`, [])
          if (otherContacts && otherContacts.length) {
            for (const { Name, Email } of otherContacts) {
              if (Email) {
                dataList.push({
                  type: 'partyContact',
                  name: Name || noName,
                  email: Email,
                  entity: latestEntity,
                  originalEntity: originalEntity,
                  isUpdate: eventType === 'update' ? true : false,
                  partyGroupCode,
                  subject: eventType === 'update' ? `${tableName}-preview` : `new-${tableName}-preview`,
                  language: 'en',
                  template: eventType === 'update' ? `message/${tableName}-preview` : `message/new-${tableName}-preview`,
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
                    type: 'party',
                    name: _.get(partyTableFlexData, `${morePartyKey}PartyName`, null) || _.get(partyTableFlexData, `${morePartyKey}Party.name`, null) || noName,
                    email: sentEmail,
                    entity: latestEntity,
                    originalEntity: originalEntity,
                    isUpdate: eventType === 'update' ? true : false,
                    partyGroupCode,
                    subject: eventType === 'update' ? `${tableName}-preview` : `new-${tableName}-preview`,
                    language: 'en',
                    template: eventType === 'update' ? `message/${tableName}-preview` : `message/new-${tableName}-preview`,
                  })
                }
                const mainContactName = _.get(partyTableFlexData, `${morePartyKey}PartyContactName`, null)
                const mainContactEmail = _.get(partyTableFlexData, `${morePartyKey}PartyContactEmail`, null)
                if (mainContactEmail) {
                  dataList.push({
                    type: 'partyContact',
                    name: mainContactName || noName,
                    email: mainContactEmail,
                    entity: latestEntity,
                    originalEntity: originalEntity,
                    isUpdate: eventType === 'update' ? true : false,
                    partyGroupCode,
                    subject: eventType === 'update' ? `${tableName}-preview` : `new-${tableName}-preview`,
                    language: 'en',
                    template: eventType === 'update' ? `message/${tableName}-preview` : `message/new-${tableName}-preview`,
                  })
                }
                const otherContacts = _.get(partyTableFlexData, `${morePartyKey}PartyContacts`, [])
                if (otherContacts && otherContacts.length) {
                  for (const { Name, Email } of otherContacts) {
                    if (Email) {
                      dataList.push({
                        type: 'partyContact',
                        name: Name || noName,
                        email: Email,
                        entity: latestEntity,
                        originalEntity: originalEntity,
                        isUpdate: eventType === 'update' ? true : false,
                        partyGroupCode,
                        subject: eventType === 'update' ? `${tableName}-preview` : `new-${tableName}-preview`,
                        language: 'en',
                        template: eventType === 'update' ? `message/${tableName}-preview` : `message/new-${tableName}-preview`,
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

  public async handleCreatedAtAndCreatedByName(eventDataList: EventData<any>[]) {
    const emails = eventDataList.reduce((emails: string[], { latestEntity }) => {
      if (latestEntity) {
        const createdBy = _.get(latestEntity, 'createdBy', null)
        if (createdBy && !emails.includes(createdBy)) {
          emails.push(createdBy)
        }
        const updatedBy = _.get(latestEntity, 'updatedBy', null)
        if (updatedBy && !emails.includes(updatedBy)) {
          emails.push(updatedBy)
        }
      }
      return emails
    }, [])
    const people = await this.allService.personTableService.findWithScope('user', { where: { userName: { [Op.in]: emails } } }, null, this.transaction)
    const apis = await this.allService.apiTableService.query(`
      SELECT CONCAT(api.partyGroupCode, '-', api.name) as userName, NULL as firstName, NULL as lastName, displayName
      FROM api
      WHERE CONCAT(api.partyGroupCode, '-', api.name) in (:emails)
    `, {
      type: QueryTypes.SELECT,
      transaction: this.transaction,
      replacements: { emails }
    })
    return eventDataList.map(eventData => {
      if (eventData.latestEntity) {
        const createdBy = _.get(eventData.latestEntity, 'createdBy', null)
        if (createdBy) {
          const foundPerson = people.find(person => person.userName === createdBy)
          const foundApi = apis.find(api => api.userName === createdBy)
          eventData.latestEntity.createdIsAPI = !!foundApi
          eventData.latestEntity.createdPerson = foundPerson || foundApi
        }
        const updatedBy = _.get(eventData.latestEntity, 'updatedBy', null)
        if (updatedBy) {
          const foundPerson = people.find(person => person.userName === updatedBy)
          const foundApi = apis.find(api => api.userName === updatedBy)
          eventData.latestEntity.updatedIsAPI = !!foundApi
          eventData.latestEntity.updatedPerson = foundPerson || foundApi
        }
      }
      return eventData
    })
  }

  public async mainFunction(eventDataList: EventData<any>[]): Promise<any[]> {
    console.debug('Start Excecute [Notify Party]...', this.constructor.name)
    try {
      const lists = this.getPartyFromEntity(await this.handleCreatedAtAndCreatedByName(eventDataList))
      console.log(`Send out email size = ${lists.length}`, this.constructor.name)
      if (lists && lists.length) {
        await BluebirdPromise.map(lists, async ({ name, type, email, entity, originalEntity, isUpdate, partyGroupCode, language, template, subject }: NotifyObject) => {
          try {
            const { frontendUrl } = await this.allService.swivelConfigService.get()
            const partyGroup = await this.allService.partyGroupTableService.findOne({ where: { code: partyGroupCode } }, this.user)
            const finalFrontendUrl = partyGroup && partyGroup.configuration && partyGroup.configuration.frontendUrl
              ? partyGroup.configuration.frontendUrl
              : frontendUrl
            await this.allService.messagerService.send(
              'email',
              {
                to: [email],
                subject: { path: subject, language, partyGroupCode },
                html: { path: template, language, partyGroupCode }
              },
              {
                name,
                type,
                entity,
                originalEntity,
                frontendUrl: finalFrontendUrl,
                partyGroup: partyGroup,
                bookingUrl: finalFrontendUrl + 'bookings/default/booking/' + entity.id,
                urlQrcodeBase64: qrcode(finalFrontendUrl + 'bookings/default/booking/' + entity.id),
                bookingQrCodeBase64: qrcode(entity.bookingNo)
              },
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
