import { EventService, EventConfig, EventHandlerConfig, EventData, EventAllService } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import _ = require('lodash')
import moment = require('moment')
import BluebirdPromise = require('bluebird')

import { RegisterTrackingForm } from 'modules/tracking/interface'
import BaseEventHandler from 'modules/events/baseEventHandler'

export default class CreateTrackingEvent extends BaseEventHandler {
  constructor(
    protected  eventDataList: EventData<any>[],
    protected readonly eventHandlerConfig: EventHandlerConfig,
    protected readonly repo: string,
    protected readonly eventService: EventService,
    protected readonly allService: EventAllService,
    protected readonly user?: JwtPayload,
    protected readonly transaction?: Transaction
  ) {
    super(eventDataList, eventHandlerConfig, repo, eventService, allService, user, transaction)
  }
  private async getTrackingNo(
    data: any,
    {
      isTracking, moduleTypeCode, carrierCode, departureDateEstimated, masterNo, soNo, containerNo
    }: { [name: string]: string|((data: any) => any) }
  ): Promise<RegisterTrackingForm|null> {
    const tracking = this.getValueFromData(data, isTracking, null)
    const moduleTypeCodeData = this.getValueFromData(data, moduleTypeCode, null)
    const carrierCodeData = this.getValueFromData(data, carrierCode, null)
    const departureDateEstimatedData = this.getValueFromData(data, departureDateEstimated, null)
    const needCarrier = moduleTypeCodeData === 'AIR' ? true : carrierCodeData
    if (tracking && moduleTypeCodeData && needCarrier) {
      const masterNoData = this.getValueFromData(data, masterNo, null)
      const soNoData = moduleTypeCodeData === 'SEA' ? this.getValueFromData(data, soNo, []) : []
      const containerNoData = moduleTypeCodeData === 'SEA' ? this.getValueFromData(data, containerNo, []) : []
      return {
        moduleTypeCode: moduleTypeCodeData,
        carrierCode: carrierCodeData,
        departureDateEstimated: departureDateEstimatedData || moment.utc().format('YYYY-MM-DD 00:00:00'),
        masterNo: masterNoData,
        soNo: soNoData.reduce((s: string[], no: string) => {
          if (no) {
            s.push(no)
          }
          return s
        }, []),
        containerNo: containerNoData.reduce((s: string[], no: string) => {
          if (no) {
            s.push(no)
          }
          return s
        }, []),
        flexData: { entity: data }
      }
    }
    return null
  }

  public async mainFunction(
    eventDataList: EventData<any>[]
  ) {
    console.debug('Start Create Tracking Event ....', this.constructor.name)

    const { trackService } = this.allService

    await BluebirdPromise.map(
      eventDataList,
      async({ latestEntity, loadashMapping, tableName }) => {
        if (latestEntity.billStatus === null) {
          try {
            const registerForm = await this.getTrackingNo(latestEntity, loadashMapping)
            if (registerForm) {
              await trackService.register(registerForm, this.user)
            }
          } catch (e) {
            console.error(`
              We cannot create tracking on below ${tableName}:\n
              ID: ${latestEntity['id']}\n
              Register Form:\n
              ${JSON.stringify(latestEntity)}\n
            `, null, this.constructor.name)
            console.error(e, e.stack, this.constructor.name)
          }
        }
      },
      { concurrency: 30 }
    )
    console.debug('End Create Tracking Event ....', this.constructor.name)
    return[]

  }
}
