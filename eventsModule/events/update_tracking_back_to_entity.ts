import { BaseEvent } from 'modules/events/base-event'
import { EventService, EventConfig } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import { Tracking } from 'models/main/tracking'
import { TrackingReference } from 'models/main/trackingReference'
import { TrackingReferenceService } from 'modules/sequelize/trackingReference/service'

class UpdateTrackingIdBackToEntityEvent extends BaseEvent {
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

  public async mainFunction(
    {
      data
    }: {
      data: Tracking
    }
  ) {
    const {
      TrackingReferenceService: trackingReferenceService,
    }: {
      TrackingReferenceService: TrackingReferenceService
    } = this.allService
    console.debug('Start Excecute (UpdateTrackingIdBackToEntityEvent) ...', this.constructor.name)
    if (data && data.lastStatusCode && !['ERR', 'CANF'].includes(data.lastStatusCode)) {
      const trackingReferences = await trackingReferenceService.getTrackingReference(
        [data.trackingNo], this.user
      )
      if (trackingReferences && trackingReferences.length) {
        console.log(trackingReferences, this.constructor.name)
        const partyGroupQuery = trackingReferences.map(({ partyGroupCode }: TrackingReference) => {
          return `partyGroupCode = "${partyGroupCode}"`
        })
        console.log(partyGroupQuery, this.constructor.name)
        // shipment
        const shipmentQuery = `
          UPDATE shipment
          SET currentTrackingNo = "${data.trackingNo}"
          WHERE ${partyGroupQuery && partyGroupQuery.length > 0 ? partyGroupQuery.join(' OR ') : '1=1'}
          AND currentTrackingNo is null
          AND (
            masterNo = "${data.trackingNo}"
            OR
            id in (
              SELECT shipmentId
              FROM shipment_container
              WHERE carrierBookingNo = "${data.trackingNo}" OR containerNo = "${data.trackingNo}"
            )
          )
        `
        await trackingReferenceService.query(shipmentQuery)
        const bookingQuery = `
          UPDATE booking
          SET currentTrackingNo = "${data.trackingNo}"
          WHERE ${partyGroupQuery && partyGroupQuery.length > 0 ? partyGroupQuery.join(' OR ') : '1=1'}
          AND currentTrackingNo is null
          AND (
            id in (SELECT bookingId FROM booking_reference WHERE refDescription = "${data.trackingNo}" AND refName in ("MBL", "MAWB"))
            OR
            id in (SELECT bookingId FROM booking_container WHERE soNo = "${data.trackingNo}" OR containerNo = "${data.trackingNo}")
          )
        `
        await trackingReferenceService.query(bookingQuery)
      }
    }
    console.debug('End Excecute (UpdateTrackingIdBackToEntityEvent) ...', this.constructor.name)
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
    const event = new UpdateTrackingIdBackToEntityEvent(
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
