import { EventService, EventHandlerConfig, EventData, EventAllService } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import _ = require('lodash')
import { RelatedParty } from 'models/main/relatedParty'
import BaseEventHandler from 'modules/events/baseEventHandler'
import { Shipment } from 'models/main/shipment'
import BluebirdPromise = require('bluebird')

export default class CreateRelatedPartyEvent extends BaseEventHandler {
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
  private getRelatedParty(eventDataList: EventData<any>[]) {
    return eventDataList.reduce((relatedParties: RelatedParty[], { latestEntity, tableName }) => {
      const partyTable = _.get(latestEntity, `${tableName}Party`, {})
      const partyTableFlexData = _.get(partyTable, `flexData`, {})
      for (const mainKey of this.getFixedKeyByTableName(tableName)) {
        const aId =  _.get(partyTable, `${mainKey}PartyId`, null)
        if (aId) {
          for (const keyB of this.getFixedKeyByTableName(tableName)) {
            const bId = _.get(partyTable, `${keyB}PartyId`, null)
            if (mainKey !== keyB && bId) {
              relatedParties.push({
                partyAId: aId,
                partyBId: bId,
                partyType: mainKey
              } as RelatedParty)
            }
          }
          if (partyTableFlexData && Object.keys(partyTableFlexData).length) {
            const morePartyKeys = _.get(partyTableFlexData, 'moreParty', [])
            if (morePartyKeys && morePartyKeys.length) {
              for (const keyB of morePartyKeys) {
                const bId = _.get(partyTable, `${keyB}PartyId`, null)
                if (mainKey !== keyB && bId) {
                  relatedParties.push({
                    partyAId: aId,
                    partyBId: bId,
                    partyType: mainKey
                  } as RelatedParty)
                }
              }
            }
          }
        }
      }
      if (partyTableFlexData && Object.keys(partyTableFlexData).length) {
        const morePartyKeys = _.get(partyTableFlexData, 'moreParty', [])
        if (morePartyKeys && morePartyKeys.length) {
          for (const mainKey of morePartyKeys) {
            const aId =  _.get(partyTable, `${mainKey}PartyId`, null)
            if (aId) {
              for (const keyB of this.getFixedKeyByTableName(tableName)) {
                const bId = _.get(partyTable, `${keyB}PartyId`, null)
                if (mainKey !== keyB && bId) {
                  relatedParties.push({
                    partyAId: aId,
                    partyBId: bId,
                    partyType: mainKey
                  } as RelatedParty)
                }
              }
              if (partyTableFlexData && Object.keys(partyTableFlexData).length) {
                const morePartyKeys = _.get(partyTableFlexData, 'moreParty', [])
                if (morePartyKeys && morePartyKeys.length) {
                  for (const keyB of morePartyKeys) {
                    const bId = _.get(partyTable, `${keyB}PartyId`, null)
                    if (mainKey !== keyB && bId) {
                      relatedParties.push({
                        partyAId: aId,
                        partyBId: bId,
                        partyType: mainKey
                      } as RelatedParty)
                    }
                  }
                }
              }
            }
          }
        }
      }
      return relatedParties
    }, [])
  }
  public async mainFunction(eventDataList: EventData<any>[]) {
    console.debug('Start Excecute [Create Related Party]...', this.constructor.name)

    try {
      const relatedParties: RelatedParty[] = this.getRelatedParty(eventDataList)
      if (relatedParties && relatedParties.length) {
        await BluebirdPromise.map(
          relatedParties,
          async (relatedParty) => {
            try {
              const found = await this.allService.relatedPartyTableService.findOne(
                {
                  where: {
                    partyAId: relatedParty.partyAId,
                    partyBId: relatedParty.partyBId,
                    partyType: relatedParty.partyType
                  }
                },
                this.user,
                this.transaction
              )
              if (found) {
                throw new Error(`${relatedParty.partyAId} => ${relatedParty.partyBId} for ${relatedParty.partyType} created`)
              }
              await this.allService.relatedPartyTableService.save(relatedParty, this.user) // no transaction as need to keep transaction
            } catch (e) {
              console.error(e, e.stack, this.constructor.name)
            }
          },
          { concurrency: 15 }
        )
      }
    } catch (e) {
      console.error(e, e.stack, this.constructor.name)
    }


    console.debug('End Excecute [Create Related Party]...', this.constructor.name)
    return null
  }
}
