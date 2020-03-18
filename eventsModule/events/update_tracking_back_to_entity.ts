import { BaseEvent } from 'modules/events/base-event'
import { EventService, EventConfig } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction, Sequelize } from 'sequelize'
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
        const partyGroupQuery = trackingReferences.map(({ partyGroupCode }: TrackingReference) => {
          return `partyGroupCode = "${partyGroupCode}"`
        })
        // shipment
        const selectQuery = `
          SELECT shipment.id
          FROM shipment
          LEFT OUTER JOIN shipment_container ON shipment_container.shipmentId = shipment.id
          WHERE (${partyGroupQuery && partyGroupQuery.length > 0 ? partyGroupQuery.join(' OR ') : '1=1'})
          AND (
            shipment.masterNo = "${data.trackingNo}"
            OR shipment_container.carrierBookingNo = "${data.trackingNo}"
            OR shipment_container.containerNo = "${data.trackingNo}"
          )
        `
        const ids = await trackingReferenceService.query(selectQuery, { type: Sequelize.QueryTypes.SELECT })
        if (ids && ids.length) {
          const idsQuery = ids.map(id => `id = ${id}`)
          await trackingReferenceService.query(`
            UPDATE shipment
            SET currentTrackingNo = "${data.trackingNo}"
            WHERE ${idsQuery.join(',')}
          `)
        }
        // const bookingQuery = `
        //   UPDATE booking
        //   SET currentTrackingNo = "${data.trackingNo}"
        //   WHERE (${partyGroupQuery && partyGroupQuery.length > 0 ? partyGroupQuery.join(' OR ') : '1=1'})
        //   AND currentTrackingNo is null
        //   AND (
        //     id in (SELECT bookingId FROM booking_reference WHERE refDescription = "${data.trackingNo}" AND refName in ("MBL", "MAWB"))
        //     OR
        //     id in (SELECT bookingId FROM booking_container WHERE soNo = "${data.trackingNo}" OR containerNo = "${data.trackingNo}")
        //   )
        // `
        // await trackingReferenceService.query(bookingQuery)
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
