import { BaseEvent } from 'modules/events/base-event'
import { EventService, EventConfig } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import _ = require('lodash')
import { RelatedPersonDatabaseService } from 'modules/sequelize/relatedPerson/service'
import { RelatedPerson } from 'models/main/relatedPerson'

class CreateRelatedPersonEvent extends BaseEvent {
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

  private async createRelatedPeople(relatedPeople: RelatedPerson[]) {
    const {
      RelatedPersonDatabaseService: service
    } = this.allService as {
      RelatedPersonDatabaseService: RelatedPersonDatabaseService
    }
    for (const relatedPerson of relatedPeople) {
      try {
        await service.save(relatedPerson, this.user, this.transaction)
      } catch (e) {
        console.error(e, e.stack, this.constructor.name)
      }
    }
  }

  public async mainFunction(
    {
      data,
      otherParameters
    }: {
      data: any,
      otherParameters: {
        partyLodash: string
        fixedParty: string[]
      }
    }
  ) {
    console.log('Start Excecute [Create Related Person]...', this.constructor.name)
    const party = _.get(data, otherParameters.partyLodash, {})
    if (party) {
      const relatedPeople: RelatedPerson[] = []
      const allParty = [
        ..._.get(otherParameters, 'fixedParty', []),
        ..._.get(party, 'flexData.moreParty', [])
      ]
      const partyId = {}
      for (const morePartyName of allParty) {
        partyId[morePartyName] = _.get(party, `${morePartyName}PartyId`, null) || _.get(party, `flexData.${morePartyName}PartyId`, null)
      }
      console.log(partyId)
      for (const partyA of allParty) {
        if (partyId[partyA]) {
          relatedPeople.push({
            partyId: partyId[partyA],
            email: _.get(party, `${partyA}PartyContactEmail`, null) || _.get(party, `flexData.${partyA}PartyContactEmail`, null),
            name: _.get(party, `${partyA}PartyContactName`, null) || _.get(party, `flexData.${partyA}PartyContactName`, null),
            phone: _.get(party, `${partyA}PartyContactPhone`, null) || _.get(party, `flexData.${partyA}PartyContactPhone`, null)
          } as RelatedPerson)
        }
      }
      if (relatedPeople.length) {
        await this.createRelatedPeople(relatedPeople)
      }
    }
    console.log('End Excecute [Create Related Person]...', this.constructor.name)
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
    const event = new CreateRelatedPersonEvent(
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
