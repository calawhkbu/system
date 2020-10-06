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

  protected getAllTrackingData(eventDataList: EventData<Tracking>[]): Tracking[] {
    return (eventDataList || []).reduce((data: Tracking[], { latestEntity }: EventData<Tracking>) => {
      if (latestEntity) {
        data.push(latestEntity)
      }
      return data
    }, [])
  }

  public async mainFunction(eventDataList: EventData<Tracking>[]) {
    const { trackService } = this.allService
    const trackingDataList = this.getAllTrackingData(eventDataList)
    if (trackingDataList && trackingDataList.length) {
      try {
        await trackService.updateBackEntity(
          trackingDataList,
          await trackService.getShipmentMapping(trackingDataList, this.transaction),
          await trackService.getBookingMapping(trackingDataList, this.transaction),
        )
      } catch (e) {
        console.warn('Update back to Entitiy error', this.constructor.name)
        console.error(e, e.stack, this.constructor.name)
      }
    }
    return undefined
  }
}
