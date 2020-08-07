import moment = require('moment')
import BluebirdPromise = require('bluebird')
import { Transaction, Sequelize, QueryTypes } from 'sequelize'

import { EventService, EventHandlerConfig, EventData, EventAllService } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'

import { Tracking } from 'models/main/tracking'
import { BookingTableService } from 'modules/sequelize/services/table/booking'
import { ShipmentTableService } from 'modules/sequelize/services/table/shipment'

import BaseEventHandler from 'modules/events/baseEventHandler'

export default class UpdateDataFromTrackingEvent extends BaseEventHandler {
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

  protected getOldTrackingData(eventDataList: EventData<Tracking>[]): Tracking[] {
    return (eventDataList || []).reduce((data: Tracking[], { originalEntity }: EventData<Tracking>) => {
      if (originalEntity) {
        data.push(originalEntity)
      }
      return data
    }, [])
  }

  protected getNewTrackingData(eventDataList: EventData<Tracking>[]): Tracking[] {
    return (eventDataList || []).reduce((data: Tracking[], { latestEntity }: EventData<Tracking>) => {
      if (latestEntity) {
        data.push(latestEntity)
      }
      return data
    }, [])
  }

  public async mainFunction(eventDataList: EventData<Tracking>[]) {
    const { trackService, alertTableService } = this.allService
    const oldTrackings = this.getOldTrackingData(eventDataList) || []
    const newTrackings = this.getNewTrackingData(eventDataList) || []
    if (newTrackings && newTrackings.length) {
      const shipments = await trackService.getShipmentMapping(newTrackings || [], this.transaction) || []
      const bookings = await trackService.getBookingMapping(newTrackings || [], this.transaction) || []
      await trackService.updateBackEntity(newTrackings, shipments, bookings, this.transaction)
      for (const { trackingNo, estimatedDepartureDate, estimatedArrivalDate, actualDepartureDate, actualArrivalDate } of newTrackings) {
        const selectedShipments = shipments.filter(s => s.masterNo === trackingNo || s.containerNo === trackingNo || s.carrierBookingNo === trackingNo)
        const selectedBookings = bookings.filter(s => s.masterNo === trackingNo || s.containerNo === trackingNo || s.carrierBookingNo === trackingNo)
        const oldTracking = oldTrackings.find(o => o.trackingNo === trackingNo)
        if (oldTracking) {
          const {
            estimatedDepartureDate: oldEstimatedDepartureDate,
            estimatedArrivalDate: oldEstimatedArrivalDate,
            actualDepartureDate: oldActualDepartureDate,
            actualArrivalDate: oldActualArrivalDate,
          } = oldTracking
          for (const shipment of selectedShipments || []) {
            if (shipment.moduleTypeCode === 'SEA') {
              if (!moment.utc(estimatedDepartureDate).isBetween(moment.utc(oldEstimatedDepartureDate).subtract(1, 'd'), moment.utc(oldEstimatedDepartureDate).add(1, 'd'))) {
                alertTableService.createAlert(
                  {
                    partyGroupCode: shipment.partyGroupCode,
                    tableName: 'shipment',
                    primaryKey: shipment.id,
                    alertConfig: {
                      tableName: 'shipment',
                      alertCategory: 'Notification',
                      severity: 'medium',
                      templatePath: 'alert/tracking-alert',
                      alertType: `trackingEstimatedDepartureDateChanged`,
                    },
                    extraParam: {
                      trackingNo,
                      oldEstimatedDepartureDate, oldEstimatedArrivalDate, oldActualDepartureDate, oldActualArrivalDate,
                      estimatedDepartureDate, estimatedArrivalDate, actualDepartureDate, actualArrivalDate
                    }
                  }
                )
              } else if (!moment.utc(estimatedArrivalDate).isBetween(moment.utc(oldEstimatedArrivalDate).subtract(1, 'd'), moment.utc(oldEstimatedArrivalDate).add(1, 'd'))) {
                alertTableService.createAlert(
                  {
                    partyGroupCode: shipment.partyGroupCode,
                    tableName: 'shipment',
                    primaryKey: shipment.id,
                    alertConfig: {
                      tableName: 'shipment',
                      alertCategory: 'Notification',
                      severity: 'medium',
                      templatePath: 'alert/tracking-alert',
                      alertType: `trackingEstimatedArrivalDateChanged`,
                    },
                    extraParam: {
                      trackingNo,
                      oldEstimatedDepartureDate, oldEstimatedArrivalDate, oldActualDepartureDate, oldActualArrivalDate,
                      estimatedDepartureDate, estimatedArrivalDate, actualDepartureDate, actualArrivalDate
                    }
                  }
                )
              }
            } else if (shipment.moduleTypeCode === 'AIR') {
              if (!moment.utc(estimatedDepartureDate).isBetween(moment.utc(oldEstimatedDepartureDate).subtract(3, 'h'), moment.utc(oldEstimatedDepartureDate).add(3, 'h'))) {
                alertTableService.createAlert(
                  {
                    partyGroupCode: shipment.partyGroupCode,
                    tableName: 'shipment',
                    primaryKey: shipment.id,
                    alertConfig: {
                      tableName: 'shipment',
                      alertCategory: 'Notification',
                      severity: 'medium',
                      templatePath: 'alert/tracking-alert',
                      alertType: `trackingEstimatedDepartureDateChanged`,
                    },
                    extraParam: {
                      trackingNo,
                      oldEstimatedDepartureDate, oldEstimatedArrivalDate, oldActualDepartureDate, oldActualArrivalDate,
                      estimatedDepartureDate, estimatedArrivalDate, actualDepartureDate, actualArrivalDate
                    }
                  }
                )
              } else if (!moment.utc(estimatedArrivalDate).isBetween(moment.utc(oldEstimatedArrivalDate).subtract(3, 'h'), moment.utc(oldEstimatedArrivalDate).add(3, 'h'))) {
                alertTableService.createAlert(
                  {
                    partyGroupCode: shipment.partyGroupCode,
                    tableName: 'shipment',
                    primaryKey: shipment.id,
                    alertConfig: {
                      tableName: 'shipment',
                      alertCategory: 'Notification',
                      severity: 'medium',
                      templatePath: 'alert/tracking-alert',
                      alertType: `trackingEstimatedArrivalDateChanged`,
                    },
                    extraParam: {
                      trackingNo,
                      oldEstimatedDepartureDate, oldEstimatedArrivalDate, oldActualDepartureDate, oldActualArrivalDate,
                      estimatedDepartureDate, estimatedArrivalDate, actualDepartureDate, actualArrivalDate
                    }
                  }
                )
              }
            }
          }
          for (const booking of selectedBookings || []) {
            if (booking.moduleTypeCode === 'SEA') {
              if (!moment.utc(estimatedDepartureDate).isBetween(moment.utc(oldEstimatedDepartureDate).subtract(1, 'd'), moment.utc(oldEstimatedDepartureDate).add(1, 'd'))) {
                alertTableService.createAlert(
                  {
                    partyGroupCode: booking.partyGroupCode,
                    tableName: 'booking',
                    primaryKey: booking.id,
                    alertConfig: {
                      tableName: 'booking',
                      alertCategory: 'Notification',
                      severity: 'medium',
                      templatePath: 'alert/tracking-alert',
                      alertType: `trackingEstimatedDepartureDateChanged`,
                    },
                    extraParam: {
                      trackingNo,
                      oldEstimatedDepartureDate, oldEstimatedArrivalDate, oldActualDepartureDate, oldActualArrivalDate,
                      estimatedDepartureDate, estimatedArrivalDate, actualDepartureDate, actualArrivalDate
                    }
                  }
                )
              } else if (!moment.utc(estimatedArrivalDate).isBetween(moment.utc(oldEstimatedArrivalDate).subtract(1, 'd'), moment.utc(oldEstimatedArrivalDate).add(1, 'd'))) {
                alertTableService.createAlert(
                  {
                    partyGroupCode: booking.partyGroupCode,
                    tableName: 'booking',
                    primaryKey: booking.id,
                    alertConfig: {
                      tableName: 'shipment',
                      alertCategory: 'Notification',
                      severity: 'medium',
                      templatePath: 'alert/tracking-alert',
                      alertType: `trackingEstimatedArrivalDateChanged`,
                    },
                    extraParam: {
                      trackingNo,
                      oldEstimatedDepartureDate, oldEstimatedArrivalDate, oldActualDepartureDate, oldActualArrivalDate,
                      estimatedDepartureDate, estimatedArrivalDate, actualDepartureDate, actualArrivalDate
                    }
                  }
                )
              }
            } else if (booking.moduleTypeCode === 'AIR') {
              if (!moment.utc(estimatedDepartureDate).isBetween(moment.utc(oldEstimatedDepartureDate).subtract(3, 'h'), moment.utc(oldEstimatedDepartureDate).add(3, 'h'))) {
                alertTableService.createAlert(
                  {
                    partyGroupCode: booking.partyGroupCode,
                    tableName: 'booking',
                    primaryKey: booking.id,
                    alertConfig: {
                      tableName: 'booking',
                      alertCategory: 'Notification',
                      severity: 'medium',
                      templatePath: 'alert/tracking-alert',
                      alertType: `trackingEstimatedDepartureDateChanged`,
                    },
                    extraParam: {
                      trackingNo,
                      oldEstimatedDepartureDate, oldEstimatedArrivalDate, oldActualDepartureDate, oldActualArrivalDate,
                      estimatedDepartureDate, estimatedArrivalDate, actualDepartureDate, actualArrivalDate
                    }
                  }
                )
              } else if (!moment.utc(estimatedArrivalDate).isBetween(moment.utc(oldEstimatedArrivalDate).subtract(3, 'h'), moment.utc(oldEstimatedArrivalDate).add(3, 'h'))) {
                alertTableService.createAlert(
                  {
                    partyGroupCode: booking.partyGroupCode,
                    tableName: 'booking',
                    primaryKey: booking.id,
                    alertConfig: {
                      tableName: 'booking',
                      alertCategory: 'Notification',
                      severity: 'medium',
                      templatePath: 'alert/tracking-alert',
                      alertType: `trackingEstimatedArrivalDateChanged`,
                    },
                    extraParam: {
                      trackingNo,
                      oldEstimatedDepartureDate, oldEstimatedArrivalDate, oldActualDepartureDate, oldActualArrivalDate,
                      estimatedDepartureDate, estimatedArrivalDate, actualDepartureDate, actualArrivalDate
                    }
                  }
                )
              }
            }
          }
        }

      }
    }

    return undefined
  }
}
