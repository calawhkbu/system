import { EventService, EventConfig, EventHandlerConfig, EventData } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction, Sequelize } from 'sequelize'
import { Tracking } from 'models/main/tracking'
import { TrackingReference } from 'models/main/trackingReference'
import { TrackingReferenceService } from 'modules/sequelize/trackingReference/service'
import { ShipmentService } from 'modules/sequelize/shipment/services/shipment'

import BluebirdPromise = require('bluebird')
import BaseEventHandler from 'modules/events/baseEventHandler'

export default class UpdateTrackingIdBackToEntityEvent extends BaseEventHandler {
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

  public async mainFunction2(
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
          const idsQuery = ids.map(({ id }) => (`id = ${id}`))
          await trackingReferenceService.query(`
            UPDATE shipment
            SET currentTrackingNo = "${data.trackingNo}"
            WHERE ${idsQuery.join(' OR ')}
          `)
        }
        // booking
        // const selectBookingQuery = `
        //   SELECT booking.id
        //   FROM booking
        //   LEFT OUTER JOIN booking_reference booking_reference_SEA
        //     ON booking_reference_SEA.bookingId = booking.id AND booking_reference_SEA.refName = "MBL"
        //   LEFT OUTER JOIN booking_reference booking_reference_AIR
        //     ON booking_reference_AIR.bookingId = booking.id AND booking_reference_AIR.refName = "MAWB"
        //   LEFT OUTER JOIN booking_container ON booking_container.bookingId = booking.id
        //   WHERE (${partyGroupQuery && partyGroupQuery.length > 0 ? partyGroupQuery.join(' OR ') : '1=1'})
        //   AND (
        //     booking_reference_SEA.refDescription = "${data.trackingNo}"
        //     OR booking_reference_AIR.refDescription = "${data.trackingNo}"
        //     OR booking_container.soNo = "${data.trackingNo}"
        //     OR booking_container.containerNo = "${data.trackingNo}"
        //   )
        // `
        // const bookingIds = await trackingReferenceService.query(selectBookingQuery, { type: Sequelize.QueryTypes.SELECT })
        // if (bookingIds && bookingIds.length) {
        //   const bidsQuery = bookingIds.map(({ id }) => (`id = ${id}`))
        //   await trackingReferenceService.query(`
        //     UPDATE booking
        //     SET currentTrackingNo = "${data.trackingNo}"
        //     WHERE ${bidsQuery.join(' OR ')}
        //   `)
        // }
      }
    }
    console.debug('End Excecute (UpdateTrackingIdBackToEntityEvent) ...', this.constructor.name)
    return null
  }

  public async mainFunction(
    eventDataList: EventData<Tracking>[]
  ) {

    const {
      TrackingReferenceService: trackingReferenceService,
      ShipmentService : shipmentService,
    }: {
      TrackingReferenceService: TrackingReferenceService,
      ShipmentService: ShipmentService
    } = this.allService

    const trackingNoList = eventDataList.reduce((
      trackingNos: string[],
      { originalEntity, updatedEntity, latestEntity }
    ) => {
      // only do things if have lastStatusCode
      if (latestEntity && latestEntity.lastStatusCode && !['ERR', 'CANF'].includes(latestEntity.lastStatusCode)) {
        trackingNos.push(latestEntity.trackingNo)
      }
      return trackingNos
    }, [])
    if (trackingNoList && trackingNoList.length) {
      const trackingReferenceList = await trackingReferenceService.getTrackingReference(trackingNoList)
      if (trackingReferenceList && trackingReferenceList.length) {
        const selectedPartyGroupCode = trackingReferenceList.reduce((partyGroupCodes: string[], { partyGroupCode }: TrackingReference) => {
          if (partyGroupCode && !partyGroupCodes.find(s => s === partyGroupCode)) {
            partyGroupCodes.push(partyGroupCode)
          }
          return partyGroupCodes
        }, [])
        const partyGroupQuery = selectedPartyGroupCode.map(partyGroupCode => `(partyGroupCode = "${partyGroupCode}")`)
        const trackingNo = trackingNoList.reduce((tcs: string[], trackingNo) => {
          if (trackingNo && !tcs.find(s => s === trackingNo)) {
            tcs.push(trackingNo)
          }
          return tcs
        }, [])
        const trackingNoQuery = trackingNo.map((trackingNo) => {
          return `(shipment.masterNo = "${trackingNo}" OR shipment_container.carrierBookingNo = "${trackingNo}" OR shipment_container.containerNo = "${trackingNo}")`
        })
        const selectQuery = `
          SELECT shipment.id, shipment.masterNo, shipment_container.carrierBookingNo, shipment_container.containerNo
          FROM shipment
          LEFT OUTER JOIN shipment_container ON shipment_container.shipmentId = shipment.id
          WHERE (${partyGroupQuery && partyGroupQuery.length ? partyGroupQuery.join(' OR ') : '1=1'})
          AND (${trackingNoQuery && trackingNoQuery.length ? trackingNoQuery.join(' OR ') : '1=1'})
        `
        const ids = await trackingReferenceService.query(selectQuery, { type: Sequelize.QueryTypes.SELECT })
        if (ids && ids.length) {
          return BluebirdPromise.map(
            ids,
            async({ id, masterNo, carrierBookingNo, containerNo }) => {
              const trackingNo = trackingNoList.find(t => t === masterNo || t === carrierBookingNo || t === containerNo)
              if (trackingNo) {
                const finalUpdateQuery = `UPDATE shipment SET currentTrackingNo = "${trackingNo}" where id in (${id})`
                return await trackingReferenceService.query(finalUpdateQuery, { type: Sequelize.QueryTypes.SELECT })
              }
              return null
            },
            { concurrency: 5 }
          )
        }
      }
    }

    return undefined
  }
}
