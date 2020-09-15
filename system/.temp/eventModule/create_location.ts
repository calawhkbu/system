import BaseEventHandler from 'modules/events/baseEventHandler'
import { EventService, EventConfig, EventData, EventHandlerConfig, EventAllService } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import BluebirdPromise = require('bluebird')

import { Booking } from 'models/main/booking'
import { Shipment } from 'models/main/shipment'
import { Location } from 'models/main/location'

export default class CreateLocationEvent extends BaseEventHandler {
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

  private getCountryCode(moduleTypeCode: string, code: string) {
    if (moduleTypeCode === 'SEA') {
      return code.substring(0, 2)
    } else if (moduleTypeCode === 'AIR') {
    } else if (moduleTypeCode === 'ROAD') {
    }
    return null
  }

  private getLocationCode(moduleTypeCode: string, code: string) {
    if (moduleTypeCode === 'SEA') {
      return code.substring(2)
    } else if (moduleTypeCode === 'AIR') {
      return code
    } else if (moduleTypeCode === 'ROAD') {
      return code
    }
    return null
  }

  private getPortFromEntity(eventDataList: EventData<Booking|Shipment>[]): Location[] {
    return eventDataList.reduce((ports: Location[], { latestEntity }: EventData<Booking|Shipment>) => {
      if (latestEntity) {
        if (latestEntity.placeOfReceiptCode && (ports.filter(p => p.portCode === latestEntity.placeOfReceiptCode)).length === 0) {
          ports.push({
            partyGroupCode: latestEntity.partyGroupCode,
            countryCode: this.getCountryCode(latestEntity.moduleTypeCode, latestEntity.placeOfReceiptCode),
            locationCode: this.getLocationCode(latestEntity.moduleTypeCode, latestEntity.placeOfReceiptCode),
            moduleTypeCode: latestEntity.moduleTypeCode,
            portCode: latestEntity.placeOfReceiptCode,
            name: latestEntity.placeOfReceiptName
          } as Location)
        }
        if (latestEntity.portOfLoadingCode && (ports.filter(p => p.portCode === latestEntity.portOfLoadingCode)).length === 0) {
          ports.push({
            partyGroupCode: latestEntity.partyGroupCode,
            countryCode: this.getCountryCode(latestEntity.moduleTypeCode, latestEntity.portOfLoadingCode),
            locationCode: this.getLocationCode(latestEntity.moduleTypeCode, latestEntity.portOfLoadingCode),
            moduleTypeCode: latestEntity.moduleTypeCode,
            portCode: latestEntity.portOfLoadingCode,
            name: latestEntity.portOfLoadingName
          } as Location)
        }
        if (latestEntity.portOfDischargeCode && (ports.filter(p => p.portCode === latestEntity.portOfDischargeCode)).length === 0) {
          ports.push({
            partyGroupCode: latestEntity.partyGroupCode,
            countryCode: this.getCountryCode(latestEntity.moduleTypeCode, latestEntity.portOfDischargeCode),
            locationCode: this.getLocationCode(latestEntity.moduleTypeCode, latestEntity.portOfDischargeCode),
            moduleTypeCode: latestEntity.moduleTypeCode,
            portCode: latestEntity.portOfDischargeCode,
            name: latestEntity.portOfDischargeName
          } as Location)
        }
        if (latestEntity.placeOfDeliveryCode && (ports.filter(p => p.portCode === latestEntity.placeOfDeliveryCode)).length === 0) {
          ports.push({
            partyGroupCode: latestEntity.partyGroupCode,
            countryCode: this.getCountryCode(latestEntity.moduleTypeCode, latestEntity.placeOfDeliveryCode),
            locationCode: this.getLocationCode(latestEntity.moduleTypeCode, latestEntity.placeOfDeliveryCode),
            moduleTypeCode: latestEntity.moduleTypeCode,
            portCode: latestEntity.placeOfDeliveryCode,
            name: latestEntity.placeOfDeliveryName
          } as Location)
        }
        if (latestEntity.finalDestinationCode && (ports.filter(p => p.portCode === latestEntity.finalDestinationCode)).length === 0) {
          ports.push({
            partyGroupCode: latestEntity.partyGroupCode,
            countryCode: this.getCountryCode(latestEntity.moduleTypeCode, latestEntity.finalDestinationCode),
            locationCode: this.getLocationCode(latestEntity.moduleTypeCode, latestEntity.finalDestinationCode),
            moduleTypeCode: latestEntity.moduleTypeCode,
            portCode: latestEntity.finalDestinationCode,
            name: latestEntity.finalDestinationName
          } as Location)
        }
      }
      return ports
    }, [])
  }

  public async mainFunction(eventDataList: EventData<Booking|Shipment>[]): Promise<any[]> {
    console.debug('Start Excecute...', this.constructor.name)
    try {
      await this.allService.locationTableService.checkBeforeSave(
        this.getPortFromEntity(eventDataList),
        this.user, this.transaction
      )
    } catch (e) {

    }
    console.debug('End Excecute...', this.constructor.name)
    return null
  }
}
