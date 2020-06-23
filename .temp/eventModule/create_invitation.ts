import { BaseEvent } from 'modules/events/base-event'
import { EventService, EventConfig } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import { Booking } from 'models/main/booking'

class CreateInvitationEvent extends BaseEvent {
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
    console.log('Create Invitation Event Start', this.constructor.name)
    const {
      BookingService: entityService,
      InvitationDbService: invitationDbService
    } = this.allService
    const {
      data
    } = parameters
    let entity = data

    const invitationUpdatedEntity = (await invitationDbService.entityCreateInvitation(
      entity,
      'booking',
      this.user,
      this.transaction
    )) as Booking

    if (invitationUpdatedEntity) {
      // warning: autoSave = true
      return await entityService.save(
        { ...entity, ...invitationUpdatedEntity },
        this.user,
        this.transaction,
        true
      )
    }
    console.log('Create Invitation Event End', this.constructor.name)
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
    const event = new CreateInvitationEvent(
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
