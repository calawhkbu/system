import { BaseEvent } from 'modules/events/base-event'
import { EventService, EventConfig } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import _ = require('lodash')
import { RelatedPersonDatabaseService } from 'modules/sequelize/relatedPerson/service'
import { RelatedPerson } from 'models/main/relatedPerson'
import { getPartyAndPersonFromStandardEntity } from 'utils/party'

class UpdateOrCreateRelatedPersonEvent extends BaseEvent {
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

  private async checkExist(relatedPeople: RelatedPerson[])
  {
    const {
      RelatedPersonDatabaseService: service
    } = this.allService as {
      RelatedPersonDatabaseService: RelatedPersonDatabaseService
    }

    let emailList: string[] = []
    let partyIdList: number[] = []

    relatedPeople.map(x => {
      emailList.push(x.email)
      partyIdList.push(x.partyId)
    })

    emailList = [... new Set(emailList.filter(x => !!x))]
    partyIdList = [... new Set(partyIdList.filter(x => !!x))]

    const checkList = await service.find({
      where : {
        partyId : partyIdList,
        email : emailList
      }
    }, this.user, this.transaction)

    const result = relatedPeople.map(relatedPerson => {

      const existed = checkList.find(x => x.partyId === relatedPerson.partyId && x.email === relatedPerson.email)

      if (existed)
      {
        relatedPerson.id = existed.id
      }
      return relatedPerson
    })

    return result

  }

  private async createorUpdateRelatedPeople(relatedPeople: RelatedPerson[]) {
    const {
      RelatedPersonDatabaseService: service
    } = this.allService as {
      RelatedPersonDatabaseService: RelatedPersonDatabaseService
    }

    const resultList = await this.checkExist(relatedPeople)

    for (const relatedPerson of resultList) {
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
      partyLodash,
      fixedParty
    }: {
      data: any,
      partyLodash: string
      fixedParty: string[]
    }
  ) {
    console.log('Start Excecute [Create Related Person]...', this.constructor.name)

    // extract shipmentParty from shipment object
    const party = _.get(data, partyLodash, {})

    const partyResult = await getPartyAndPersonFromStandardEntity(party)

    if (Object.keys(partyResult).length)
    {
      const relatedPeople: RelatedPerson[] = []

      for (const partyType of Object.keys(partyResult)) {

        const peopleList = partyResult[partyType].people
        const partyId = partyResult[partyType].party.id

        peopleList.forEach(person => {

          const phoneContact = person.contacts.find(x => x.contactType === 'phone')
          const phone = phoneContact ? phoneContact.content : undefined

          const emailContact = person.contacts.find(x => x.contactType === 'email')
          const email = emailContact ? emailContact.content : undefined

          const name = person.displayName || undefined

          if (name || phone || email)
          {
            relatedPeople.push({
              partyId,
              email,
              name,
              phone
            } as RelatedPerson)

          }

        })

      }

      if (relatedPeople.length) {

        console.log(`debug_relatedPeople`)
        console.log(relatedPeople)

        await this.createorUpdateRelatedPeople(relatedPeople)
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
    const event = new UpdateOrCreateRelatedPersonEvent(
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
