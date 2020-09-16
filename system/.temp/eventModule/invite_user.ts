import { BaseEvent } from 'modules/events/base-event'
import { EventService, EventConfig } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'

import { InvitationDbService } from 'modules/sequelize/invitation/service'

// // used in development for syntaxt hightlighting
// import { BaseEvent } from '../../../../swivel-backend-new/src/modules/events/base-event'
// import { InvitationDbService } from '../../../../swivel-backend-new/src/modules/sequelize/invitation/service'

class ExampleEvent extends BaseEvent {
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
    const person = parameters.person
    const partyGroupCode = parameters.partyGroupCode

    const invitationDbService = this.allService['InvitationDbService'] as InvitationDbService

    // create a new Invitation
    const newInvitation = await invitationDbService.createInvitation(
      person,
      partyGroupCode,
      this.user,
      this.transaction
    )

    return newInvitation
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
    const event = new ExampleEvent(
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
