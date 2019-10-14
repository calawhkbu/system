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
  SEA: { value: 1, unit: 'days' },
  AIR: { value: 1, unit: 'hours' },
}

const alertMap = [
  { trackingVariable: 'estimatedDepartureDate', bookingVariable: 'departureDateEstimated', alertType: 'bookingEtdChanged' },
  { trackingVariable: 'actualDepartureDate', bookingVariable: 'departureDateActual', alertType: 'bookingAtdChanged' },
  { trackingVariable: 'estimatedArrivalDate', bookingVariable: 'arrivalDateEstimated', alertType: 'bookingEtAChanged' },
  { trackingVariable: 'actualArrivalDate', bookingVariable: 'arrivalDateActual', alertType: 'bookingAtaChanged' },
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
    const { trackingNo } = parameters.data as Tracking
    const bookingIdList = await bookingService.query(
      `
        SELECT "trackingReference" AS \`type\`, tr.id AS \`id\`
        FROM (
          (
            SELECT \`tracking_reference\`.\`id\`, \`masterNo\` AS \`trackingNo\`, 'masterNo' AS \`type\`
            FROM \`tracking_reference\`
          )
          UNION (
            SELECT \`tracking_reference\`.\`id\`, \`soTable\`.\`trackingNo\`, 'soNo' AS \`type\`
            FROM  \`tracking_reference\`,  JSON_TABLE(\`soNo\`, "$[*]" COLUMNS (\`trackingNo\` VARCHAR(100) PATH "$")) \`soTable\`
          )
          UNION (
            SELECT  \`tracking_reference\`.\`id\` , \`containerTable\`.\`trackingNo\`, 'containerNo' as \`type\`
            FROM \`tracking_reference\`,  JSON_TABLE(\`containerNo\`, "$[*]" COLUMNS (\`trackingNo\` VARCHAR(100) PATH "$")) \`containerTable\`)
          )
        ) trackingReference tr
        WHERE
        UNION
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
        replacements: { trackingNo }
      }
    )
    for (const id of bookingIdList) {

    }
    //
    // await Promise.all(
    //   trackingReferenceList.map(async trackingReference => {
    //     let bookingIdListQueryString: string
    //     let bookingIdList: number[]
    //
    //     if (trackingReference.type === 'masterNo') {
    //       // hardcode
    //       bookingIdListQueryString = `
    //       `
    //     } else if (trackingReference.type === 'soNo') {
    //       bookingIdListQueryString = `
    //       `
    //     } else if (trackingReference.type === 'containerNo') {
    //       bookingIdListQueryString = `
    //       `
    //     }
    //
    //     const bookingIdListQueryResult = (await bookingService.query(
    //       bookingIdListQueryString,
    //       rawQueryOption
    //     )) as { bookingId: number }[]
    //     bookingIdList = bookingIdListQueryResult.map(x => x.bookingId)
    //
    //     const bookingList = (await bookingService.find(
    //       {
    //         where: {
    //           id: bookingIdList,
    //           partyGroupCode: trackingReference.partyGroupCode,
    //         },
    //         transaction: this.transaction,
    //       },
    //       this.user
    //     )) as Booking[]
    //
    //     const alertResult = [] as {
    //       tableName: string
    //       primaryKey: string
    //       alertType: string
    //     }[]
    //     // process the tracking information into booking
    //     const resultList = bookingList.map(booking => {
    //       const result = {
    //         id: booking.id,
    //       } as any
    //
    //       for (const iterator of alertMap) {
    //         // console.log(iterator,'iterator')
    //
    //         const trackingTime = (tracking[iterator.trackingVariable]
    //           ? moment(tracking[iterator.trackingVariable])
    //               .utc()
    //               .toDate()
    //           : undefined) as Date
    //         const bookingTime = booking[iterator.bookingVariable] as Date
    //
    //         // console.log(iterator.bookingVariable)
    //         // console.log(`trackingTime : ${trackingTime} type : ${typeof trackingTime}`)
    //         // console.log(`bookingTime : ${bookingTime} type : ${typeof bookingTime}`)
    //
    //         // put the updated variable into result
    //         if (trackingTime) {
    //           result[iterator.bookingVariable] = trackingTime
    //
    //           if (bookingTime) {
    //             const minTime = moment(bookingTime)
    //               .utc()
    //               .subtract(
    //                 deplayAlertTimeRange[booking.moduleTypeCode].value,
    //                 deplayAlertTimeRange[booking.moduleTypeCode].unit
    //               )
    //             const maxTime = moment(bookingTime)
    //               .utc()
    //               .add(
    //                 deplayAlertTimeRange[booking.moduleTypeCode].value,
    //                 deplayAlertTimeRange[booking.moduleTypeCode].unit
    //               )
    //
    //             if (trackingTime < minTime || trackingTime > maxTime) {
    //               console.log(`need to send ${iterator.alertType}`)
    //
    //               alertResult.push({
    //                 // hardcode
    //                 tableName: 'booking',
    //                 primaryKey: booking.id.toString(),
    //                 alertType: iterator.alertType,
    //               })
    //             }
    //           }
    //         }
    //       }
    //
    //       return result
    //     })
    //
    //     // update booking
    //     await bookingService.save(resultList, this.user, this.transaction)
    //
    //     // send alert
    //     for (const iterator of alertResult) {
    //       await alertDbService.createAlert(
    //         iterator.tableName,
    //         iterator.primaryKey,
    //         iterator.alertType,
    //         undefined,
    //         undefined,
    //         this.user,
    //         this.transaction
    //       )
    //     }
    //   })
    // )

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
