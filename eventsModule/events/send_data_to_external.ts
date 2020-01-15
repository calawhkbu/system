import { BaseEvent } from 'modules/events/base-event'
import { EventService, EventConfig } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import { OutboundService } from 'modules/integration-hub/services/outbound'

// import { Booking } from 'models/main/booking';

class SendDataToExternalEvent extends BaseEvent {
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
    console.log('Start sending booking to external ...', this.constructor.name)

    const {
      data, outboundName, header = {}, body = {}
    } = parameters
    const {
      OutboundService: outboundService
    } = this.allService as { OutboundService: OutboundService }

    const selectedPartyGroupCode = this.user.selectedPartyGroup.code

    try {
      const response = await outboundService.send(
        `customer-${selectedPartyGroupCode}`,
        outboundName,
        header,
        { data, ...body }
      )
      console.log(response, this.constructor.name)
    } catch (e) {
      console.error(e, e.stack, this.constructor.name)
    }
    console.log('End sending booking to external ...', this.constructor.name)
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
    const event = new SendDataToExternalEvent(
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
