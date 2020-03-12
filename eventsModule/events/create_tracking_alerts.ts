import { BaseEvent } from 'modules/events/base-event'
import { EventService, EventConfig } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction, Sequelize } from 'sequelize'
import moment = require('moment')

import { Tracking } from 'models/main/tracking'
import { TrackingReference } from 'models/main/trackingReference'
import { BookingService } from 'modules/sequelize/booking/services/booking'
import { TrackingService } from 'modules/sequelize/tracking/service'
import { TrackingReferenceService } from 'modules/sequelize/trackingReference/service'
import { AlertDbService } from 'modules/sequelize/alert/service'

// config the timeRange that need to send alert

const deplayAlertTimeRange = {
  SEA: 'days',
  AIR: 'hours'
}

class TrackingUpdateDataEvent extends BaseEvent {
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

  private async getEntity({ partyGroupCode, masterNo = null, soNo = [], containerNo = [] }: TrackingReference) {
    const { BookingService: bookingService }: { BookingService: BookingService } = this.allService
    return await bookingService.query(`
      SELECT
        base.tableName, base.primaryKey,
        entity.moduleTypeCode as module,
        entity.departureDateEstimated, entity.departureDateActual,
        entity.arrivalDateEstimated, entity.arrivalDateActual
      FROM (
        SELECT 'booking' as tableName, br.bookingId as primaryKey
        FROM booking_reference br
        WHERE br.refDescription = :masterNo
        UNION
        SELECT 'booking' as tableName, bc.bookingId as primaryKey
        FROM booking_container bc
        WHERE (bc.soNo in (:soNo) OR bc.containerNo in (:containerNo))
      ) base
      LEFT OUTER JOIN (
        SELECT
          booking.id, booking.moduleTypeCode,
          booking_date.departureDateEstimated, booking_date.departureDateActual,
          booking_date.arrivalDateEstimated, booking_date.arrivalDateActual
        FROM booking
        LEFT OUTER JOIN booking_date ON booking_date.bookingId = booking.id
        WHERE booking.partyGroupCode = :partyGroupCode
      ) entity ON entity.id = base.primaryKey
      UNION
      SELECT
        base.tableName, base.primaryKey,
        entity.moduleTypeCode as module,
        entity.departureDateEstimated, entity.departureDateActual,
        entity.arrivalDateEstimated, entity.arrivalDateActual
      FROM (
        SELECT 'shipment' as tableName, s.id as primaryKey
        FROM shipment s
        WHERE s.masterNo = :masterNo
        UNION
        SELECT 'shipment' as tableName, sc.shipmentId as primaryKey
        FROM shipment_container sc
        WHERE (sc.carrierBookingNo in (:soNo) OR sc.containerNo in (:containerNo))
      ) base
      LEFT OUTER JOIN (
        SELECT
          shipment.id, shipment.moduleTypeCode,
          shipment_date.departureDateEstimated, shipment_date.departureDateActual,
          shipment_date.arrivalDateEstimated, shipment_date.arrivalDateActual
        FROM shipment
        LEFT OUTER JOIN shipment_date ON shipment_date.shipmentId = shipment.id
        WHERE shipment.partyGroupCode = :partyGroupCode
      ) entity ON entity.id = base.primaryKey
    `, {
      raw: true,
      type: Sequelize.QueryTypes.SELECT,
      transaction: this.transaction,
      replacements: { masterNo, soNo, containerNo, partyGroupCode }
    })
  }

  private async getTrackingReference(trackingNo: string[]) {
    const {
      TrackingReferenceService: trackingReferenceService,
    }: {
      TrackingReferenceService: TrackingReferenceService
    } = this.allService
    return await trackingReferenceService.getTrackingReference(trackingNo)
  }

  public async mainFunction(parameters: any) {
    console.debug(`Event Started [Create Tracking Alert]`, this.constructor.name)
    const {
      AlertDbService: alertDbService,
      TrackingReferenceService: trackingReferenceService,
    }: {
      TrackingService: TrackingService,
      AlertDbService: AlertDbService,
      BookingService: BookingService,
      TrackingReferenceService: TrackingReferenceService
    } = this.allService
    const {
      trackingNo,
      estimatedDepartureDate: trackingEstimatedDepartureDate, estimatedArrivalDate: trackingEstimatedArrivalDate,
      actualDepartureDate: trackingActualDepartureDate, actualArrivalDate: trackingActualArrivalDate
    } = parameters.data as Tracking
    if (trackingNo) {
      for (const trackingReference of await this.getTrackingReference([trackingNo])) {
        for (const {
          tableName, primaryKey,
          module,
          estimatedDepartureDate: inputEstimatedDepartureDate, estimatedArrivalDate: inputEstimatedArrivalDate,
          actualDepartureDate: inputActualDepartureDate, actualArrivalDate: inputActualArrivalDate
        } of await this.getEntity(trackingReference)) {
          if (
            !moment.utc(trackingEstimatedDepartureDate).isBetween(
              moment.utc(inputEstimatedDepartureDate).subtract(1, deplayAlertTimeRange[module]),
              moment.utc(inputEstimatedDepartureDate).add(1, deplayAlertTimeRange[module])
            )
          ) {
            await alertDbService.createAlert(
              tableName, primaryKey,
              {
                tableName: `${tableName}`,
                alertCategory: 'Exception',
                alertType: `${tableName}EtdChanged`,
                severity: 'high',
                contactRoleList: [],
                templatePath: ''
              },
              {
                oldDate: moment.utc(inputEstimatedDepartureDate).format('YYYY-MM-DD HH:mm:ss'),
                newDate: moment.utc(trackingEstimatedDepartureDate).format('YYYY-MM-DD HH:mm:ss')
              }, this.user
            )
          }
          if (
            !moment.utc(trackingEstimatedArrivalDate).isBetween(
              moment.utc(inputEstimatedArrivalDate).subtract(1, deplayAlertTimeRange[module]),
              moment.utc(inputEstimatedArrivalDate).add(1, deplayAlertTimeRange[module])
            )
          ) {
            await alertDbService.createAlert(
              tableName, primaryKey,
              {
                tableName: `${tableName}`,
                alertCategory: 'Exception',
                alertType: `${tableName}EtaChanged`,
                severity: 'high',
                contactRoleList: [],
                templatePath: ''
              },
              {
                oldDate: moment.utc(inputEstimatedArrivalDate).format('YYYY-MM-DD HH:mm:ss'),
                newDate: moment.utc(trackingEstimatedArrivalDate).format('YYYY-MM-DD HH:mm:ss')
              }, this.user
            )
          }
          if (
            !moment.utc(trackingActualDepartureDate).isBetween(
              moment.utc(inputActualDepartureDate).subtract(1, deplayAlertTimeRange[module]),
              moment.utc(inputActualDepartureDate).add(1, deplayAlertTimeRange[module])
            )
          ) {
            await alertDbService.createAlert(
              tableName, primaryKey,
              {
                tableName: `${tableName}`,
                alertCategory: 'Exception',
                alertType: `${tableName}AtdChanged`,
                severity: 'high',
                contactRoleList: [],
                templatePath: ''
              },
              {
                oldDate: moment.utc(inputActualDepartureDate).format('YYYY-MM-DD HH:mm:ss'),
                newDate: moment.utc(trackingActualDepartureDate).format('YYYY-MM-DD HH:mm:ss')
              }, this.user
            )
          }
          if (
            !moment.utc(trackingActualArrivalDate).isBetween(
              moment.utc(inputActualArrivalDate).subtract(1, deplayAlertTimeRange[module]),
              moment.utc(inputActualArrivalDate).add(1, deplayAlertTimeRange[module])
            )
          ) {
            await alertDbService.createAlert(
              tableName, primaryKey,
              {
                tableName: `${tableName}`,
                alertCategory: 'Exception',
                alertType: `${tableName}AtaChanged`,
                severity: 'high',
                contactRoleList: [],
                templatePath: ''
              },
              {
                oldDate: moment.utc(inputActualArrivalDate).format('YYYY-MM-DD HH:mm:ss'),
                newDate: moment.utc(trackingActualArrivalDate).format('YYYY-MM-DD HH:mm:ss')
              }, this.user
            )
          }
        }
      }
    }
    console.debug(`Event Ended [Create Tracking Alert]`, this.constructor.name)
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
    const event = new TrackingUpdateDataEvent(
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
