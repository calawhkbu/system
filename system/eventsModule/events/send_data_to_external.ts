import { EventService, EventConfig, EventData, EventHandlerConfig, EventAllService } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import BaseEventHandler from 'modules/events/baseEventHandler'
import BluebirdPromise = require('bluebird')

// import { Booking } from 'models/main/booking';

export default class SendDataToExternalEvent extends BaseEventHandler {
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

  public async mainFunction(eventDataList: EventData<any>[]) {
    console.debug('Start sending booking to external ...', this.constructor.name)
    const { outboundService } = this.allService
    await BluebirdPromise.map(
      eventDataList,
      async({
        originalEntity,
        savedEntity,
        latestEntity,
        outboundName,
        header = {},
        body = {}
      }: EventData<any> & {
        outboundName: string
        header: any
        body: any
        getUserPartyGroupCode: (o: any, s: any, l: any) => string
      }) => {
        const partyGroupCode = this.user.selectedPartyGroup.code
        try {
          return await outboundService.send(
            `customer-${partyGroupCode}`,
            outboundName,
            header,
            { latestEntity, ...body }
          )
        } catch (e) {
          console.error(e, e.stack, this.constructor.name)
        }
      },
      { concurrency: 10 }
    )
    console.debug('End sending booking to external ...', this.constructor.name)
    return eventDataList
  }
}
