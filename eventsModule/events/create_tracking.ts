import { BaseEvent } from 'modules/events/base-event'
import { EventService, EventConfig } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'

import { TrackService } from 'modules/tracking/service'

import { Booking } from 'models/main/booking'
import { BookingReference } from 'models/main/bookingReference'
import { BookingContainer } from 'models/main/bookingContainer'

// // debug
// import { TrackService } from '../../../../swivel-backend-new/src/modules/tracking/service';

// import { Booking } from '../../../../swivel-backend-new/src/models/main/booking';
// import { BookingReference } from '../../../../swivel-backend-new/src/models/main/bookingReference';
// import { BookingContainer } from '../../../../swivel-backend-new/src/models/main/bookingContainer';

class CreateTrackingEvent extends BaseEvent {
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

  public getMasterNo(booking: Booking, refName: string): string {
    const bookingReference = booking.bookingReference.find(
      (x: BookingReference) => x.refName === refName
    )

    if (bookingReference) {
      return bookingReference.refDescription
    }
  }

  public getCotainerNo(booking: Booking): string[] {
    const containerNoList = booking.bookingContainers.filter(
      (x: BookingContainer) => x.containerNo && x.containerNo.length
    )
    return containerNoList
  }

  public getSoNo(booking: Booking): string[] {
    const soNoList = booking.bookingContainers.filter(
      (x: BookingContainer) => x.soNo && x.soNo.length
    )
    return soNoList
  }

  public async createTrackingAir(booking: Booking) {
    const moduleTypeCode = booking.moduleTypeCode
    const carrierCode = booking.carrierCode
    const departureDateEstimated = booking.departureDateEstimated
    const partyGroupCode = booking.partyGroupCode

    // hardcode
    const masterNo = this.getMasterNo(booking, 'MAWB')
    console.log(masterNo, '================')

    if (masterNo) {
      const trackService = this.allService['TrackService'] as TrackService

      const trackingInformation = {
        // carrierCode,
        masterNo,
        departureDateEstimated,
      }

      return await trackService.register(partyGroupCode, moduleTypeCode, trackingInformation)
    }
  }

  public async createTrackingSea(booking: Booking) {
    const moduleTypeCode = booking.moduleTypeCode
    const carrierCode = booking.carrierCode
    const departureDateEstimated = booking.departureDateEstimated
    const partyGroupCode = booking.partyGroupCode

    // hardcode
    const masterNo = this.getMasterNo(booking, 'MBL')
    const containerNo = this.getCotainerNo(booking)
    const soNo = this.getSoNo(booking)

    // if masterNo and conatinerNo is both not found
    if (carrierCode || masterNo || containerNo.length > 0 || soNo.length) {
      const trackService = this.allService['TrackService'] as TrackService
      const trackingInformation = {
        carrierCode,
        masterNo,
        containerNo,
        soNo,
        departureDateEstimated,
      }

      return await trackService.register(partyGroupCode, moduleTypeCode, trackingInformation)
    }
  }

  // parameters should be booking
  public async mainFunction(parameters: any) {
    console.log('======================')

    const booking = parameters.data as Booking

    // etd, carrier and ModuleType is required

    if (booking.moduleTypeCode && booking.departureDateEstimated) {
      console.log('here')

      switch (booking.moduleTypeCode) {
        case 'AIR':
          return await this.createTrackingAir(booking)

        case 'SEA':
          return await this.createTrackingSea(booking)

        default:
          break
      }
    }
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
    const event = new CreateTrackingEvent(
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
