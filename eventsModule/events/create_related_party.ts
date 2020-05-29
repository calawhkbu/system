
import { EventService, EventConfig, EventHandlerConfig, EventData } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import _ = require('lodash')
import { RelatedPartyTableService } from 'modules/sequelize/services/table/relatedParty'
import { RelatedParty } from 'models/main/relatedParty'
import BaseEventHandler from 'modules/events/baseEventHandler'
import { Shipment } from 'models/main/shipment'
import { Booking } from 'models/main/booking'

export default class CreateRelatedPartyEvent extends BaseEventHandler {
  constructor(
    protected  eventDataList: EventData<any>[],
    protected readonly eventHandlerConfig: EventHandlerConfig,
    protected readonly repo: string,
    protected readonly eventService: EventService,
    protected readonly allService: any,

    protected readonly user?: JwtPayload,
    protected readonly transaction?: Transaction
  ) {
    super(eventDataList, eventHandlerConfig, repo, eventService, allService, user, transaction)
  }

  private async createRelatedParty(relatedParties: RelatedParty[]) {
    const {
      RelatedPartyDatabaseService: service
    } = this.allService as {
      RelatedPartyDatabaseService: RelatedPartyTableService
    }
    for (const relatedParty of relatedParties) {
      try {
        const found = await service.findOne(
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
        if (!found) {
          await service.save(relatedParty, this.user)
        }
      } catch (e) {
        console.error(e, e.stack, this.constructor.name)
      }
    }
  }

    // {
    //   data: any,
    //   partyLodash: string
    //   fixedParty: string[]
    // }
  public async mainFunction(eventDataList: EventData<any>[]) {
    console.debug('Start Excecute [Create Related Party]...', this.constructor.name)

    const createRelatedParties: RelatedParty[] = []

    eventDataList.map(eventData => {

      const { latestEntity, partyLodash, fixedParty } = eventData as EventData<Shipment>

      if (latestEntity.billStatus === null) {
        const party = _.get(latestEntity, partyLodash, {})
        if (party) {
          const allParty = [
            ...(fixedParty || []),
            ..._.get(party, 'flexData.moreParty', [])
          ]
          const partyId = {}
          for (const morePartyName of allParty) {
            partyId[morePartyName] = _.get(party, `${morePartyName}PartyId`, null) || _.get(party, `flexData.${morePartyName}PartyId`, null)
          }
          for (const partyA of allParty) {
            if (partyId[partyA]) {
              for (const partyB of allParty) {
                if (partyA !== partyB && partyId[partyB]) {
                  createRelatedParties.push({
                    partyAId: partyId[partyB],
                    partyBId: partyId[partyA],
                    partyType: partyA
                  } as RelatedParty)
                }
              }
            }
          }
        }
      }

    })

    if (createRelatedParties.length) {
      await this.createRelatedParty(createRelatedParties)
    }

    console.debug('End Excecute [Create Related Party]...', this.constructor.name)
    return null
  }
}
