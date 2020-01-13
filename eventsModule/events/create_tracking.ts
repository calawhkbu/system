import { BaseEvent } from 'modules/events/base-event'
import { EventService, EventConfig } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'

import { TrackService } from 'modules/tracking/services'

import { BookingReference } from 'models/main/bookingReference'
import { BookingContainer } from 'models/main/bookingContainer'
import { RegisterTrackingForm } from 'modules/tracking/interface'

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

  private async getTrackingNoFromBooking(
    {
      moduleTypeCode = null,
      carrierCode = null,
      bookingDate = {},
      bookingReference = [],
      bookingContainers = []
    }: any
  ) {
    if (moduleTypeCode && carrierCode && bookingDate.departureDateEstimated) {
      let refName = null
      if (moduleTypeCode === 'AIR') {
        refName = 'MAWB'
      } else if (moduleTypeCode === 'SEA') {
        refName = 'MBL'
      }
      const masterNo = bookingReference.reduce((masterNo: string, bookingReference: BookingReference) => {
        if (bookingReference.refName === refName) {
          masterNo = bookingReference.refDescription
        }
        return masterNo
      }, null)
      let soNo = []
      let containerNo = []
      if (moduleTypeCode === 'SEA') {
        soNo = bookingContainers.reduce((soNos: string[], bookingContainer: BookingContainer) => {
          if (bookingContainer.soNo && bookingContainer.soNo.length) {
            soNos.push(bookingContainer.soNo)
          }
          return soNos
        }, [])
        containerNo = bookingContainers.reduce((containerNos: string[], bookingContainer: BookingContainer) => {
          if (bookingContainer.containerNo && bookingContainer.containerNo.length) {
            containerNos.push(bookingContainer.containerNo)
          }
          return containerNos
        }, [])
      }
      return { masterNo, soNo, containerNo }
    }
    return null
  }
  private async getTrackingNoFromShipment(
    {
      moduleTypeCode = null,
      carrierCode = null,
      shipmentDate = {},
      trackingNos = null
    }: any
  ) {
    if (moduleTypeCode && carrierCode && shipmentDate.departureDateEstimated) {
      return trackingNos
    }
    return null
  }
  private async getTrackingNo(data: any, tableName: string) {
    switch (tableName) {
      case 'booking': return await this.getTrackingNoFromBooking(data)
      case 'shipment': return await this.getTrackingNoFromShipment(data)
      default: return null
    }
  }

  // parameters should be booking
  public async mainFunction(parameters: any) {
    console.log('Start Create Tracking Event ....', this.constructor.name)

    const {
      TrackService: trackService
    } = this.allService as {
      TrackService: TrackService
    }

    const { data, otherParameters } = parameters

    const trackingNo = await this.getTrackingNo(data, otherParameters.tableName)
    if (
      trackingNo
      && (
        trackingNo.masterNo
        || (trackingNo.soNo && trackingNo.soNo.length)
        || (trackingNo.containerNo && trackingNo.containerNo.length)
      )
    ) {
      try {
        const registerForm: RegisterTrackingForm = {
          moduleTypeCode: data.moduleTypeCode,
          carrierCode: data.carrierCode,
          departureDateEstimated: data[`${otherParameters.tableName}Date`].departureDateEstimated,
          masterNo: trackingNo.masterNo,
          soNo: trackingNo.soNo,
          containerNo: trackingNo.containerNo,
          flexData: {
            entity: parameters.data
          }
        }
        console.log(registerForm, this.constructor.name)
        await trackService.register(registerForm, this.user)
      } catch (e) {
        console.error(e, e.stack, this.constructor.name)
      }
    }
    console.log('End Create Tracking Event ....', this.constructor.name)
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
