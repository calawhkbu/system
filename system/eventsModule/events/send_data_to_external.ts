import { EventService, EventConfig, EventData, EventHandlerConfig, EventAllService } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import BaseEventHandler from 'modules/events/baseEventHandler'
import BluebirdPromise = require('bluebird')

// import { Booking } from 'models/main/booking';

const removeFunction = (a: any, b: any) => {
  if (typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
    for (const key of Object.keys(b)) {
      if (a[key] && b[key] && typeof a[key] === 'object' && typeof b[key] === 'object' && !Array.isArray(a[key]) && !Array.isArray(b[key])) {
        b[key] = removeFunction(a[key], b[key])
      } else if (a[key] === null && b[key] === null) {
        delete b[key]
      }
    }
  }
  return b
}

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

  compare (a: any, b: any): any {
    if (a && b) {
      return removeFunction(a, b)
    } else if (!a && b) {
      return b
    }
    return null
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
          const finalLatestestEntity = this.compare(originalEntity, latestEntity)
          if (finalLatestestEntity) {
            return await outboundService.send(
              `customer-${partyGroupCode}`,
              outboundName,
              header,
              { latestEntity, ...body }
            )
          }
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
