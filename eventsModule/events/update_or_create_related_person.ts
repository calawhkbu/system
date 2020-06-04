import { EventService, EventConfig, EventData, EventHandlerConfig, EventAllService } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import _ = require('lodash')
import { RelatedPerson } from 'models/main/relatedPerson'
import { getPartyAndPersonFromStandardEntity } from 'utils/party'
import BaseEventHandler from 'modules/events/baseEventHandler'

export default class UpdateOrCreateRelatedPersonEvent extends BaseEventHandler {
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

  private async checkExist(relatedPeople: RelatedPerson[]) {

    const { relatedPersonTableService } = this.allService


    let emailList: string[] = []
    let partyIdList: number[] = []

    relatedPeople.map(x => {
      emailList.push(x.email)
      partyIdList.push(x.partyId)
    })

    emailList = [... new Set(emailList.filter(x => !!x))]
    partyIdList = [... new Set(partyIdList.filter(x => !!x))]

    const checkList = await relatedPersonTableService.find({
      where: {
        partyId: partyIdList,
        email: emailList
      }
    }, this.user, this.transaction)

    const result = relatedPeople.map(relatedPerson => {

      const existed = checkList.find(x => x.partyId === relatedPerson.partyId && x.email === relatedPerson.email)

      if (existed) {
        relatedPerson.id = existed.id
      }
      return relatedPerson
    })

    return result

  }

  private async createorUpdateRelatedPeople(relatedPeople: RelatedPerson[]) {

    const { relatedPersonTableService } = this.allService

    const resultList = await this.checkExist(relatedPeople)

    for (const relatedPerson of resultList) {
      try {
        await relatedPersonTableService.save(relatedPerson, this.user, this.transaction)
      } catch (e) {
        console.error(e, e.stack, this.constructor.name)
      }
    }
  }

  public async mainFunction(eventDataList: EventData<any>[]) {

    console.log('Start Excecute [Create Related Person]...', this.constructor.name)

    const relatedPeople: RelatedPerson[] = []

    eventDataList.map(async eventData => {

      const { latestEntity, partyLodash, fixedParty } = eventData as EventData<any>

      // extract shipmentParty from shipment object
      const party = _.get(latestEntity, partyLodash, {})

      const partyResult = await getPartyAndPersonFromStandardEntity(party)

      if (Object.keys(partyResult).length) {

        for (const partyType of Object.keys(partyResult)) {

          const peopleList = partyResult[partyType].people
          const partyId = partyResult[partyType].party.id

          peopleList.forEach(person => {

            const phoneContact = person.contacts.find(x => x.contactType === 'phone')
            const phone = phoneContact ? phoneContact.content : undefined

            const emailContact = person.contacts.find(x => x.contactType === 'email')
            const email = emailContact ? emailContact.content : undefined

            const name = person.displayName || undefined

            if (name || phone || email) {
              relatedPeople.push({
                partyId,
                email,
                name,
                phone
              } as RelatedPerson)

            }

          })

        }

      }

    })

    if (relatedPeople.length) {

      console.log(`debug_relatedPeople`)
      console.log(relatedPeople)

      await this.createorUpdateRelatedPeople(relatedPeople)
    }

    console.log('End Excecute [Create Related Person]...', this.constructor.name)
    return null
  }
}
