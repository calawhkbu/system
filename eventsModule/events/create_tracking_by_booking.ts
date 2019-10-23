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
  // parameters should be booking
  public async mainFunction(parameters: any) {
    console.log('Start Create Tracking Event ....', this.constructor.name)

    const {
      TrackService: trackService
    } = this.allService as {
      TrackService: TrackService
    }

    const {
      moduleTypeCode = null,
      carrierCode = null,
      departureDateEstimated = null,
      bookingReference = [],
      bookingContainers = []
    } = parameters.data

    if (moduleTypeCode && carrierCode && departureDateEstimated) {
      try {
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
        const registerForm: RegisterTrackingForm = {
          moduleTypeCode,
          carrierCode,
          departureDateEstimated,
          masterNo,
          soNo,
          containerNo,
          flexData: {
            booking: parameters.data
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
