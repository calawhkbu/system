import { EventService, EventConfig, EventData, EventHandlerConfig } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import { OutboundService } from 'modules/integration-hub/services/outbound'
import BaseEventHandler from 'modules/events/baseEventHandler'

// import { Booking } from 'models/main/booking';

export default class SendDataToExternalEvent extends BaseEventHandler {
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

  public async mainFunction(eventDataList: EventData<any>[]) {
    console.log('Start sending booking to external ...', this.constructor.name)

    const promiseList = eventDataList.map(async eventData => {

      const {
        latestEntity, outboundName, header = {}, body = {}
      } = eventData
      const {
        OutboundService: outboundService
      } = this.allService as { OutboundService: OutboundService }

      const selectedPartyGroupCode = this.user.selectedPartyGroup.code

      try {
        const response = await outboundService.send(
          `customer-${selectedPartyGroupCode}`,
          outboundName,
          header,
          { latestEntity, ...body }
        )

        return response
        console.log(response, this.constructor.name)
      } catch (e) {
        console.error(e, e.stack, this.constructor.name)
      }

    })

    const resultList = await Promise.all(promiseList)
    console.log('End sending booking to external ...', this.constructor.name)
    return resultList

  }
}
