import { BaseEvent } from 'modules/events/base-event'
import { EventService, EventConfig } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import _ = require('lodash')
import { RelatedPartyDatabaseService } from 'modules/sequelize/relatedParty/service'
import { RelatedParty } from 'models/main/relatedParty'

class CreateRelatedPartyEvent extends BaseEvent {
  constructor(
    protected readonly parameters: any,
    protected readonly eventConfig: EventConfig,
    protected readonly repo: string,
    protected readonly eventService: EventService,
    protected readonly allService: any,
    protected readonly user?: JwtPayload,
    protected readonly transaction?: Transaction
  ) {
    super(parameters, eventConfig, repo, eventService, allService, user, transaction)
  }

  private async createRelatedParty(relatedParties: RelatedParty[]) {
    const {
      RelatedPartyDatabaseService: service
    } = this.allService as {
      RelatedPartyDatabaseService: RelatedPartyDatabaseService
    }
    for (const relatedParty of relatedParties) {
      try {
        await service.save(relatedParty, this.user)
      } catch (e) {
        console.error(e, e.stack, this.constructor.name)
      }
    }
  }

  public async mainFunction(
    {
      data,
      partyLodash,
      fixedParty
    }: {
      data: any,
      partyLodash: string
      fixedParty: string[]
    }
  ) {
    console.debug('Start Excecute [Create Related Party]...', this.constructor.name)
    if (data.billStatus === null) {
      const party = _.get(data, partyLodash, {})
      if (party) {
        const relatedParties: RelatedParty[] = []
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
                relatedParties.push({
                  partyAId: partyId[partyB],
                  partyBId: partyId[partyA],
                  partyType: partyA
                } as RelatedParty)
              }
            }
          }
        }
        if (relatedParties.length) {
          await this.createRelatedParty(relatedParties)
        }
      }
    }
    console.debug('End Excecute [Create Related Party]...', this.constructor.name)
    return null
  }
}

export default {
  execute: async(
    parameters: any,
    eventConfig: EventConfig,
    repo: string,
    eventService: any,
    allService: any,
    user?: JwtPayload,
    transaction?: Transaction
  ) => {
    const event = new CreateRelatedPartyEvent(
      parameters,
      eventConfig,
      repo,
      eventService,
      allService,
      user,
      transaction
    )
    return await event.execute()
  },
}
