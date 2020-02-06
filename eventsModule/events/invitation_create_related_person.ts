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
    console.log('Start Excecute...', this.constructor.name)

    const invitation = parameters.data as Invitation
    console.log(JSON.stringify(parameters), 'parameters')

    const {
      RelatedPersonDatabaseService: service
    } = this.allService

    const person = invitation.person

    const partyIdList = person.parties.map(x => x.id)

    const personPhoneContact = person.contacts.find(x => x.contactType === 'phone')
    const phone = personPhoneContact ? personPhoneContact.content : undefined
    const relatedPersonDataList = partyIdList.map(partyId => {

      return {
        personId : person.id,
        partyId,
        email : person.userName,
        // question : use what name?
        name : person.userName,
        phone

      } as RelatedPerson
    })

    const relatedPersonList = await (service as RelatedPersonDatabaseService).save(relatedPersonDataList, this.user, this.transaction)
    console.log('End Excecute...', this.constructor.name)
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
