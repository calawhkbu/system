import { BaseEvent } from 'modules/events/base-event'
import { EventService, EventConfig } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import { Tracking } from 'models/main/tracking'
import { TrackingReference } from 'models/main/trackingReference'
import { TrackingReferenceService } from 'modules/sequelize/trackingReference/service'
import moment = require('moment')

class UpdateShipmentDateFromTrackingEvent extends BaseEvent {
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
    console.debug('Start Excecute (UpdateShipmentDateFromTrackingEvent) ...', this.constructor.name)
    if (data) {
      const {
        estimatedDepartureDate,
        estimatedArrivalDate,
        actualDepartureDate,
        actualArrivalDate
      } = data
      const trackingReferences = await trackingReferenceService.getTrackingReference(
        [data.trackingNo], this.user
      )
      if (trackingReferences && trackingReferences.length) {
        const partyGroupQuery = trackingReferences.map(({ partyGroupCode }: TrackingReference) => {
          return `partyGroupCode = "${partyGroupCode}"`
        })
        const etdQuery = estimatedDepartureDate ? `departureDateEstimated = "${moment.utc(estimatedDepartureDate).format('YYYY-MM-DD HH:mm:ss')}"` : null
        const etaQuery = estimatedArrivalDate ? `arrivalDateEstimated = "${moment.utc(estimatedArrivalDate).format('YYYY-MM-DD HH:mm:ss')}"` : null
        const atdQuery = actualDepartureDate ? `departureDateActual = "${moment.utc(actualDepartureDate).format('YYYY-MM-DD HH:mm:ss')}"` : null
        const ataQuery = actualArrivalDate ? `arrivalDateActual = "${moment.utc(actualArrivalDate).format('YYYY-MM-DD HH:mm:ss')}"` : null
        if (etdQuery || etaQuery || atdQuery || ataQuery) {
          let dateQuery = etdQuery || null
          if (etaQuery) {
            dateQuery = `${dateQuery ? `${dateQuery},` : ''}${etaQuery}`
          }
          if (atdQuery) {
            dateQuery = `${dateQuery ? `${dateQuery},` : ''}${atdQuery}`
          }
          if (ataQuery) {
            dateQuery = `${dateQuery ? `${dateQuery},` : ''}${ataQuery}`
          }
          const shipmentQuery = `
            UPDATE shipment_date
            SET ${dateQuery}
            WHERE shipmentId IN (
              SELECT id
              FROM shipment
              WHERE (${partyGroupQuery && partyGroupQuery.length > 0 ? partyGroupQuery.join(' OR ') : '1=1'})
              AND (
                masterNo = "${data.trackingNo}"
                OR id in (
                  SELECT shipmentId
                  FROM shipment_container
                  WHERE carrierBookingNo = "${data.trackingNo}" OR containerNo = "${data.trackingNo}"
                )
              )
            )
          `
          await trackingReferenceService.query(shipmentQuery)
          const bookingQuery = `
            UPDATE booking_date
            SET ${dateQuery}
            WHERE bookingId IN (
              SELECT id
              FROM booking
              WHERE (${partyGroupQuery && partyGroupQuery.length > 0 ? partyGroupQuery.join(' OR ') : '1=1'})
              AND (
                id in (
                  SELECT bookingId
                  FROM booking_reference
                  WHERE refDescription = "${data.trackingNo}"
                )
                OR id in (
                  SELECT bookingId
                  FROM booking_container
                  WHERE carrierBookingNo = "${data.trackingNo}" OR containerNo = "${data.trackingNo}"
                )
              )
            )
          `
          await trackingReferenceService.query(bookingQuery)
        }
      }
    }
    console.debug('Start Excecute (UpdateShipmentDateFromTrackingEvent) ...', this.constructor.name)
    return null
  }
}

export default {
  execute: async (
    parameters: any,
    eventConfig: EventConfig,
    repo: string,
    eventService: any,
    allService: any,
    user?: JwtPayload,
    transaction?: Transaction
  ) => {
    const event = new UpdateShipmentDateFromTrackingEvent(
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
