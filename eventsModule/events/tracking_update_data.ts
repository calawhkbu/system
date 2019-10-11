import { BaseEvent } from 'modules/events/base-event'
import { EventService, EventConfig } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction, Sequelize } from 'sequelize'
import { IFindOptions } from 'sequelize-typescript'
import moment = require('moment')

import { BookingService } from '../../../../swivel-backend-new/src/modules/sequelize/booking/service'

import { TrackingService } from '../../../../swivel-backend-new/src/modules/sequelize/tracking/service'
import { TrackingReferenceService } from '../../../../swivel-backend-new/src/modules/sequelize/trackingReference/service'
import { AlertDbService } from '../../../../swivel-backend-new/src/modules/sequelize/alert/service'

import { Tracking } from '../../../../swivel-backend-new/src/models/main/tracking'
import { Booking } from '../../../../swivel-backend-new/src/models/main/booking'
import { TrackingReference } from '../../../../swivel-backend-new/src/models/main/trackingReference'

// config the timeRange that need to send alert

const deplayAlertTimeRange = {
  SEA: {
    value: 1,
    unit: 'days',
  },
  AIR: {
    value: 1,
    unit: 'hours',
  },
}

const alertMap = [
  {
    trackingVariable: 'estimatedDepartureDate',
    bookingVariable: 'departureDateEstimated',
    alertType: 'bookingEtdChanged',
  },
  {
    trackingVariable: 'actualDepartureDate',
    bookingVariable: 'departureDateActual',
    alertType: 'bookingAtdChanged',
  },

  {
    trackingVariable: 'estimatedArrivalDate',
    bookingVariable: 'arrivalDateEstimated',
    alertType: 'bookingEtAChanged',
  },
  {
    trackingVariable: 'actualArrivalDate',
    bookingVariable: 'arrivalDateActual',
    alertType: 'bookingAtaChanged',
  },
]

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

  public async mainFunction(parameters: any) {
    const {
      TrackingService: trackingService,
      AlertDbService: alertDbService,
      BookingService: bookingService,
      TrackingReferenceService: trackingReferenceService,
    }: {
      TrackingService: TrackingService,
      AlertDbService: AlertDbService,
      BookingService: BookingService,
      TrackingReferenceService: TrackingReferenceService
    } = this.allService
    const {
      trackingNo
    } = parameters.data as Tracking
    const references: TrackingReference[] = await trackingService.reportQuery(
      'tracking_table',
      {
        fields: [['tracking_reference', 'id'] ],
        subqueries: { trackingNo: { value: [trackingNo] } }
      }
    )
    for (const { id } of references) {
      const {
        masterNo = null,
        soNo = [],
        containerNo = []
      }: TrackingReference = await trackingReferenceService.findOne(id)
      const bookingIdList = await bookingService.query(
        `
          SELECT br.bookingId as bookingId
          FROM booking_reference br
          WHERE br.refDescription in (:trackingNo) AND (br.refName = 'MAWB' OR br.refName = 'MLB')
          UNION
          SELECT bc.bookingId as bookingId
          FROM booking_container bc
          WHERE (bc.soNo in (:trackingNo) OR bc.containerNo in (:trackingNo))
        `,
        {
          raw: true,
          type: Sequelize.QueryTypes.SELECT,
          transaction: this.transaction,
          replacement: {
            trackingNo: [masterNo].concat(soNo, containerNo)
          }
        }
      )
      for (const id of bookingIdList) {

      }
    }

    await Promise.all(
      trackingReferenceList.map(async trackingReference => {
        let bookingIdListQueryString: string
        let bookingIdList: number[]

        if (trackingReference.type === 'masterNo') {
          // hardcode
          bookingIdListQueryString = `
          `
        } else if (trackingReference.type === 'soNo') {
          bookingIdListQueryString = `
          `
        } else if (trackingReference.type === 'containerNo') {
          bookingIdListQueryString = `
          `
        }

        const bookingIdListQueryResult = (await bookingService.query(
          bookingIdListQueryString,
          rawQueryOption
        )) as { bookingId: number }[]
        bookingIdList = bookingIdListQueryResult.map(x => x.bookingId)

        const bookingList = (await bookingService.find(
          {
            where: {
              id: bookingIdList,
              partyGroupCode: trackingReference.partyGroupCode,
            },
            transaction: this.transaction,
          },
          this.user
        )) as Booking[]

        const alertResult = [] as {
          tableName: string
          primaryKey: string
          alertType: string
        }[]
        // process the tracking information into booking
        const resultList = bookingList.map(booking => {
          const result = {
            id: booking.id,
          } as any

          for (const iterator of alertMap) {
            // console.log(iterator,'iterator')

            const trackingTime = (tracking[iterator.trackingVariable]
              ? moment(tracking[iterator.trackingVariable])
                  .utc()
                  .toDate()
              : undefined) as Date
            const bookingTime = booking[iterator.bookingVariable] as Date

            // console.log(iterator.bookingVariable)
            // console.log(`trackingTime : ${trackingTime} type : ${typeof trackingTime}`)
            // console.log(`bookingTime : ${bookingTime} type : ${typeof bookingTime}`)

            // put the updated variable into result
            if (trackingTime) {
              result[iterator.bookingVariable] = trackingTime

              if (bookingTime) {
                const minTime = moment(bookingTime)
                  .utc()
                  .subtract(
                    deplayAlertTimeRange[booking.moduleTypeCode].value,
                    deplayAlertTimeRange[booking.moduleTypeCode].unit
                  )
                const maxTime = moment(bookingTime)
                  .utc()
                  .add(
                    deplayAlertTimeRange[booking.moduleTypeCode].value,
                    deplayAlertTimeRange[booking.moduleTypeCode].unit
                  )

                if (trackingTime < minTime || trackingTime > maxTime) {
                  console.log(`need to send ${iterator.alertType}`)

                  alertResult.push({
                    // hardcode
                    tableName: 'booking',
                    primaryKey: booking.id.toString(),
                    alertType: iterator.alertType,
                  })
                }
              }
            }
          }

          return result
        })

        // update booking
        await bookingService.save(resultList, this.user, this.transaction)

        // send alert
        for (const iterator of alertResult) {
          await alertDbService.createAlert(
            iterator.tableName,
            iterator.primaryKey,
            iterator.alertType,
            undefined,
            undefined,
            this.user,
            this.transaction
          )
        }
      })
    )

    console.log('in main Excecute of TrackingUpdateData Finish')

    return {
      exampleResult: 'exampleValue',
    }
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
