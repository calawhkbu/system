import { BaseEvent } from 'modules/events/base-event'
import { EventService, EventConfig } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import { Invitation } from 'models/main/invitation'
import { InvitationDbService } from 'modules/sequelize/invitation/service'
import { RelatedPerson } from 'models/main/relatedPerson'
import { RelatedPersonDatabaseService } from 'modules/sequelize/relatedPerson/service'

class InvitationCreateRelatedPersonEvent extends BaseEvent {
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

  public async mainFunction(parameters: any) {
    console.debug('Start Excecute...', this.constructor.name)

    const invitation = parameters.data as Invitation

    const {
      RelatedPersonDatabaseService: service
    } = this.allService

    const person = invitation.person

    const partyIdList = person.parties.map(x => x.id)

    const personPhoneContact = person.contacts.find(x => x.contactType === 'phone')
    const phone = personPhoneContact ? personPhoneContact.content : undefined

    const nameString = (person.firstName || '') + (person.lastName || '')

    const name = nameString.length ? nameString : undefined

    // find all existing relatedPerson in the db, update the existing, create the rest
    const existingRelatedPersonList = await (service as RelatedPersonDatabaseService).find({
      where : {
        email : person.userName,
        partyId : partyIdList
      }
    })

    let dataList = existingRelatedPersonList.map(x => {
      const data = x.dataValues
      // update the personId to existing record
      data.personId = person.id
      return data

    })

    const existingRelatedPersonPartyIdList = existingRelatedPersonList.map(x => x.partyId)
    const newRelatedPersonPartyIdList = partyIdList.filter(x => !existingRelatedPersonPartyIdList.includes(x))

    const relatedPersonDataList = newRelatedPersonPartyIdList.map(partyId => {

      return {
        personId : person.id,
        partyId,
        email : person.userName,
        name,
        phone

      } as RelatedPerson
    })

    dataList = dataList.concat(relatedPersonDataList)

    // console.debug(`dataList`)
    // console.debug(dataList)

    // debug
    return null

    const relatedPersonList = await (service as RelatedPersonDatabaseService).save(relatedPersonDataList, this.user, this.transaction)
    console.debug('End Excecute...', this.constructor.name)
    return relatedPersonList

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
    const event = new InvitationCreateRelatedPersonEvent(
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
