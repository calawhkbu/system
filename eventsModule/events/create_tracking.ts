
import { BaseEvent } from 'modules/events/base-event'
import { EventService, EventConfig } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload';
import { Transaction } from 'sequelize';



import { TrackService } from 'modules/tracking/service';

import { Booking } from 'models/main/booking';
import { BookingReference } from 'models/main/bookingReference';
import { BookingContainer } from 'models/main/bookingContainer';



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

    const bookingReference = booking.bookingReference.find((x: BookingReference) => x.refName == refName)

    if (bookingReference) {
      return bookingReference.refDescription
    }


  }

  public getCotainerNo(booking: Booking): string[] {
    const containerNo = booking.bookingContainers.map((x: BookingContainer) => x.containerNo)
    return containerNo

  }



  public async createTrackingAir(booking: Booking) {

    const moduleTypeCode = booking.moduleTypeCode
    const carrierCode = booking.carrierCode
    const departureDateEstimated = booking.departureDateEstimated
    const partyGroupCode = booking.partyGroupCode

    const masterNo = this.getMasterNo(booking, "MAWB")

    if (masterNo) {

      const trackService = this.allService['TrackService'] as TrackService

      const trackingInformation = {

        carrierCode,
        masterNo,
        departureDateEstimated

      }

      return await trackService.register(partyGroupCode, moduleTypeCode, trackingInformation)

    }


  }

  public async createTrackingSea(booking: Booking) {


    const moduleTypeCode = booking.moduleTypeCode
    const carrierCode = booking.carrierCode
    const departureDateEstimated = booking.departureDateEstimated
    const partyGroupCode = booking.partyGroupCode

    const masterNo = this.getMasterNo(booking, "MLB")
    const containerNo = this.getCotainerNo(booking)

    // todo : what is this
    const carrierBookingNo = []

    // if masterNo and conatinerNo is both not found
    if (masterNo || containerNo.length > 0) {

      const trackService = this.allService['TrackService'] as TrackService
      const trackingInformation = {

        carrierCode,
        masterNo,
        containerNo,
        carrierBookingNo,
        departureDateEstimated

      }

      return await trackService.register(partyGroupCode, moduleTypeCode, trackingInformation)

    }

  }

  // parameters should be booking
  public async mainFunction(parameters: any) {

    const booking = parameters.data as Booking

    // etd, carrier and ModuleType is required
    if (booking.carrierCode && booking.moduleTypeCode && booking.departureDateEstimated) {


      switch (booking.moduleTypeCode) {
        case 'AIR':
          return await this.createTrackingAir(booking)

        case 'SEA':

          return await this.createTrackingSea(booking)

        default:
          break;
      }


    }



  }
}


export default {

  execute: async (parameters: any, eventConfig: EventConfig, repo: string, eventService: any, allService: any, user?: JwtPayload, transaction?: Transaction) => {

    const event = new CreateTrackingEvent(parameters, eventConfig, repo, eventService, allService, user, transaction)
    return await event.execute()


  }

}
