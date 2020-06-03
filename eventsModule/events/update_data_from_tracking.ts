import moment = require('moment')
import BluebirdPromise = require('bluebird')
import { Transaction, Sequelize } from 'sequelize'

import { EventService, EventHandlerConfig, EventData } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'

import { Tracking } from 'models/main/tracking'
import { BookingTableService } from 'modules/sequelize/services/table/booking'
import { ShipmentTableService } from 'modules/sequelize/services/table/shipment'

import BaseEventHandler from 'modules/events/baseEventHandler'

interface UseTrackingData {
  trackingNo: string
  tracking: Tracking
}

export default class UpdateShipmentDateFromTrackingEvent extends BaseEventHandler {
  constructor(
    protected eventDataList: EventData<any>[],
    protected readonly eventHandlerConfig: EventHandlerConfig,
    protected readonly repo: string,
    protected readonly eventService: EventService,
    protected readonly allService: any,
    protected readonly user?: JwtPayload,
    protected readonly transaction?: Transaction
  ) {
    super(eventDataList, eventHandlerConfig, repo, eventService, allService, user, transaction)
  }

  protected getAllTrackingData(eventDataList: EventData<Tracking>[]): UseTrackingData[] {
    return (eventDataList || []).reduce((data: UseTrackingData[], { latestEntity }: EventData<Tracking>) => {
      if (latestEntity) {
        data.push({ trackingNo: latestEntity.trackingNo, tracking: latestEntity })
      }
      return data
    }, [])
  }

  public async mainFunction(eventDataList: EventData<Tracking>[]) {
    const start = Date.now()
    const partyGroupCode = ['DEV', 'GGL', 'DT', 'STD', 'ECX', 'ASW', 'FHUB']

    const {
      BookingService: bookingService,
      ShipmentService : shipmentService,
    }: {
      BookingService: BookingTableService,
      ShipmentService: ShipmentTableService
    } = this.allService

    const trackingDataList = this.getAllTrackingData(eventDataList)
    if (trackingDataList && trackingDataList.length) {
      const trackingNos = trackingDataList.map(trackingData => trackingData.trackingNo)
      const shipmentIds = await shipmentService.query(
        `
          SELECT shipment.id, shipment.masterNo, shipment_container.carrierBookingNo, shipment_container.containerNo
          FROM shipment
          LEFT OUTER JOIN shipment_container on shipment_container.shipmentId = shipment.id
          WHERE partyGroupCode in (:partyGroupCode)
          AND (
            masterNo in (:trackingNos)
            OR id in (SELECT shipmentId FROM shipment_container WHERE carrierBookingNo in (:trackingNos) OR containerNo in (:trackingNos))
          )
        `,
        {
          type: Sequelize.QueryTypes.SELECT,
          raw: true,
          transaction: this.transaction,
          replacements: { partyGroupCode, trackingNos }
        }
      )
      if (shipmentIds && shipmentIds.length) {
        await BluebirdPromise.map(
          shipmentIds.reduce((querys: string[], { id, masterNo, carrierBookingNo, containerNo }) => {
            const found = trackingDataList.find(t => t.trackingNo === masterNo || t.trackingNo === carrierBookingNo || t.trackingNo === containerNo)
            if (found) {
              const { trackingNo, tracking } = found
              if (tracking.trackingStatus && tracking.trackingStatus.length  && !['ERR', 'CANF'].includes(tracking.lastStatusCode)) {
                querys.push(`UPDATE shipment SET currentTrackingNo = "${trackingNo}" WHERE id = ${id} AND currentTrackingNo is null`)
              }
              if (tracking.estimatedDepartureDate) {
                const date = moment.utc(tracking.estimatedDepartureDate).format('YYYY-MM-DD HH:mm:ss')
                querys.push(`UPDATE shipment_date SET departureDateEstimated = "${date}" WHERE shipmentId = ${id} and arrivalDateActual is null`)
              }
              if (tracking.actualDepartureDate) {
                const date = moment.utc(tracking.actualDepartureDate).format('YYYY-MM-DD HH:mm:ss')
                querys.push(`UPDATE shipment_date SET departureDateActual = "${date}" WHERE shipmentId = ${id} and arrivalDateActual is null`)
              }
              if (tracking.estimatedArrivalDate) {
                const date = moment.utc(tracking.estimatedArrivalDate).format('YYYY-MM-DD HH:mm:ss')
                querys.push(`UPDATE shipment_date SET arrivalDateEstimated = "${date}" WHERE shipmentId = ${id} and arrivalDateActual is null`)
              }
              if (tracking.actualArrivalDate) {
                const date = moment.utc(tracking.actualArrivalDate).format('YYYY-MM-DD HH:mm:ss')
                querys.push(`UPDATE shipment_date SET arrivalDateActual = "${date}" WHERE shipmentId = ${id} and (arrivalDateActual is null or arrivalDateActual >= DATE_SUB("${date}", INTERVAL 45 day))`)
              }
              for (const { isEstimated, statusDate, statusCode } of tracking.trackingStatus || []) {
                if (statusDate) {
                  const date = moment.utc(statusDate).format('YYYY-MM-DD HH:mm:ss')
                  if (statusCode === 'BKCF' || statusCode === 'BKD') {
                    querys.push(`UPDATE shipment_date SET carrierConfirmationDate${isEstimated ? 'Estimated' : 'Actual'} = "${date}" WHERE shipmentId = ${id} and arrivalDateActual is null`)
                  } else if (statusCode === 'STSP') {
                    querys.push(`UPDATE shipment_date SET sentToShipperDate${isEstimated ? 'Estimated' : 'Actual'} = "${date}" WHERE shipmentId = ${id} and arrivalDateActual is null`)
                  } else if (statusCode === 'GITM') {
                    querys.push(`UPDATE shipment_date SET gateInDate${isEstimated ? 'Estimated' : 'Actual'} = "${date}" WHERE shipmentId = ${id} and arrivalDateActual is null`)
                  } else if (statusCode === 'LOBD' || statusCode === 'MNF') {
                    querys.push(`UPDATE shipment_date SET loadOnboardDate${isEstimated ? 'Estimated' : 'Actual'} = "${date}" WHERE shipmentId = ${id} and arrivalDateActual is null`)
                  } else if (statusCode === 'RCS') {
                    querys.push(`UPDATE shipment_date SET cargoReceiptDate${isEstimated ? 'Estimated' : 'Actual'} = "${date}" WHERE shipmentId = ${id} and arrivalDateActual is null`)
                  } else if (statusCode === 'STCS') {
                    querys.push(`UPDATE shipment_date SET sentToConsigneeDate${isEstimated ? 'Estimated' : 'Actual'} = "${date}" WHERE shipmentId = ${id} and emptyContainerReturnDateActual is null`)
                  } else if (statusCode === 'DLV') {
                    querys.push(`UPDATE shipment_date SET finalDoorDeliveryDate${isEstimated ? 'Estimated' : 'Actual'} = "${date}" WHERE shipmentId = ${id} and emptyContainerReturnDateActual is null`)
                  } else if (statusCode === 'RCVE') {
                    querys.push(`UPDATE shipment_date SET emptyContainerReturnDate${isEstimated ? 'Estimated' : 'Actual'} = "${date}" WHERE shipmentId = ${id} and emptyContainerReturnDateActual is null`)
                  }
                }
              }
            }
            return querys
          }, []),
          async(query: string) => await shipmentService.query(query, this.transaction),
          { concurrency: 30 }
        )
      }
      const bookingIds = await shipmentService.query(
        `
          SELECT booking.id, booking_reference.refDescription as masterNo, booking_container.containerNo, booking_container.soNo as carrierBookingNo
          FROM booking
          LEFT OUTER JOIN booking_container ON shipment_container.shipmentId = shipment.id
          LEFT OUTER JOIN booking_reference ON booking_reference.bookingId = booking.id AND (booking_reference.refName = 'MBL' OR booking_reference.refName = 'MAWB')
          WHERE partyGroupCode in (:partyGroupCode)
          AND (
            id in (SELECT bookingId FROM booking_reference WHERE (refName = 'MBL' OR refName = 'MAWB') AND refDescriptionn (:trackingNos))
            OR id in (SELECT bookingId FROM booking_container WHERE soNo in (:trackingNos) OR containerNo in (:trackingNos))
          )
        `,
        {
          type: Sequelize.QueryTypes.SELECT,
          raw: true,
          transaction: this.transaction,
          replacements: { partyGroupCode, trackingNos }
        }
      )
      if (bookingIds && bookingIds.length) {
        await BluebirdPromise.map(
          bookingIds.reduce((querys: string[], { id, masterNo, carrierBookingNo, containerNo }) => {
            const found = trackingDataList.find(t => t.trackingNo === masterNo || t.trackingNo === carrierBookingNo || t.trackingNo === containerNo)
            if (found) {
              const { trackingNo, tracking } = found
              if (tracking.trackingStatus && tracking.trackingStatus.length  && !['ERR', 'CANF'].includes(tracking.lastStatusCode)) {
                querys.push(`UPDATE booking SET currentTrackingNo = "${trackingNo}" WHERE id = ${id} AND currentTrackingNo is null`)
              }
              if (tracking.estimatedDepartureDate) {
                const date = moment.utc(tracking.estimatedDepartureDate).format('YYYY-MM-DD HH:mm:ss')
                querys.push(`UPDATE booking_date SET departureDateEstimated = "${date}" WHERE shipmentId = ${id} and arrivalDateActual is null`)
              }
              if (tracking.actualDepartureDate) {
                const date = moment.utc(tracking.actualDepartureDate).format('YYYY-MM-DD HH:mm:ss')
                querys.push(`UPDATE booking_date SET departureDateActual = "${date}" WHERE shipmentId = ${id} and arrivalDateActual is null`)
              }
              if (tracking.estimatedArrivalDate) {
                const date = moment.utc(tracking.estimatedArrivalDate).format('YYYY-MM-DD HH:mm:ss')
                querys.push(`UPDATE booking_date SET arrivalDateEstimated = "${date}" WHERE shipmentId = ${id} and arrivalDateActual is null`)
              }
              if (tracking.actualArrivalDate) {
                const date = moment.utc(tracking.actualArrivalDate).format('YYYY-MM-DD HH:mm:ss')
                querys.push(`UPDATE booking_date SET arrivalDateActual = "${date}" WHERE shipmentId = ${id} and (arrivalDateActual is null or arrivalDateActual >= DATE_SUB("${date}", INTERVAL 45 day))`)
              }
              for (const { isEstimated, statusDate, statusCode } of tracking.trackingStatus || []) {
                if (statusDate) {
                  const date = moment.utc(statusDate).format('YYYY-MM-DD HH:mm:ss')
                  if (statusCode === 'BKCF' || statusCode === 'BKD') {
                    querys.push(`UPDATE booking_date SET carrierConfirmationDate${isEstimated ? 'Estimated' : 'Actual'} = "${date}" WHERE shipmentId = ${id} and arrivalDateActual is null`)
                  } else if (statusCode === 'STSP') {
                    querys.push(`UPDATE booking_date SET sentToShipperDate${isEstimated ? 'Estimated' : 'Actual'} = "${date}" WHERE shipmentId = ${id} and arrivalDateActual is null`)
                  } else if (statusCode === 'GITM') {
                    querys.push(`UPDATE booking_date SET gateInDate${isEstimated ? 'Estimated' : 'Actual'} = "${date}" WHERE shipmentId = ${id} and arrivalDateActual is null`)
                  } else if (statusCode === 'LOBD' || statusCode === 'MNF') {
                    querys.push(`UPDATE booking_date SET loadOnboardDate${isEstimated ? 'Estimated' : 'Actual'} = "${date}" WHERE shipmentId = ${id} and arrivalDateActual is null`)
                  } else if (statusCode === 'RCS') {
                    querys.push(`UPDATE booking_date SET cargoReceiptDate${isEstimated ? 'Estimated' : 'Actual'} = "${date}" WHERE shipmentId = ${id} and arrivalDateActual is null`)
                  } else if (statusCode === 'STCS') {
                    querys.push(`UPDATE booking_date SET sentToConsigneeDate${isEstimated ? 'Estimated' : 'Actual'} = "${date}" WHERE shipmentId = ${id} and emptyContainerReturnDateActual is null`)
                  } else if (statusCode === 'DLV') {
                    querys.push(`UPDATE booking_date SET finalDoorDeliveryDate${isEstimated ? 'Estimated' : 'Actual'} = "${date}" WHERE shipmentId = ${id} and emptyContainerReturnDateActual is null`)
                  } else if (statusCode === 'RCVE') {
                    querys.push(`UPDATE booking_date SET emptyContainerReturnDate${isEstimated ? 'Estimated' : 'Actual'} = "${date}" WHERE shipmentId = ${id} and emptyContainerReturnDateActual is null`)
                  }
                }
              }
            }
            return querys
          }, []),
          async(query: string) => await shipmentService.query(query, this.transaction),
          { concurrency: 30 }
        )
      }
    }
    console.log(Date.now() - start, 'YUNDANG-TIME')
    return undefined
  }
}
