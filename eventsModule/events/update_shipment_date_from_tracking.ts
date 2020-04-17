
import { EventService, EventConfig, EventHandlerConfig, EventData } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction, Sequelize } from 'sequelize'
import { Tracking } from 'models/main/tracking'
import { TrackingReference } from 'models/main/trackingReference'
import { TrackingReferenceService } from 'modules/sequelize/trackingReference/service'
import moment = require('moment')
import BluebirdPromise = require('bluebird')
import BaseEventHandler from 'modules/events/baseEventHandler'

export default class UpdateShipmentDateFromTrackingEvent extends BaseEventHandler {
  constructor(
    protected  eventDataList: EventData<any>[],
    protected readonly eventHandlerConfig: EventHandlerConfig,
    protected readonly repo: string,
    protected readonly eventService: EventService,
    protected readonly allService: any,

    protected readonly user?: JwtPayload,
    protected readonly transaction?: Transaction
  ) {
    super(eventDataList, eventHandlerConfig, repo, eventService, allService, user, transaction)
  }

  // public async mainFunction2(
  //   {
  //     data
  //   }: {
  //       data: Tracking
  //     }
  // ) {
  //   const {
  //     TrackingReferenceService: trackingReferenceService,
  //   }: {
  //       TrackingReferenceService: TrackingReferenceService
  //     } = this.allService
  //   console.debug('Start Excecute (UpdateShipmentDateFromTrackingEvent) ...', this.constructor.name)
  //   if (data) {
  //     const {
  //       estimatedDepartureDate,
  //       estimatedArrivalDate,
  //       actualDepartureDate,
  //       actualArrivalDate
  //     } = data
  //     const trackingReferences = await trackingReferenceService.getTrackingReference(
  //       [data.trackingNo], this.user
  //     )
  //     if (trackingReferences && trackingReferences.length) {
  //       const partyGroupQuery = trackingReferences.map(({ partyGroupCode }: TrackingReference) => {
  //         return `partyGroupCode = "${partyGroupCode}"`
  //       })
  //       const selectQuery = `
  //         SELECT shipment.id
  //         FROM shipment
  //         LEFT OUTER JOIN shipment_container ON shipment_container.shipmentId = shipment.id
  //         WHERE (${partyGroupQuery && partyGroupQuery.length > 0 ? partyGroupQuery.join(' OR ') : '1=1'})
  //         AND (
  //           shipment.masterNo = "${data.trackingNo}"
  //           OR shipment_container.carrierBookingNo = "${data.trackingNo}"
  //           OR shipment_container.containerNo = "${data.trackingNo}"
  //         )
  //       `
  //       const ids = await trackingReferenceService.query(selectQuery, { type: Sequelize.QueryTypes.SELECT })
  //       if (ids && ids.length) {
  //         const idsQuery = ids.map(({ id }) => (`shipmentId = ${id}`))
  //         const etdQuery = estimatedDepartureDate ? `departureDateEstimated = "${moment.utc(estimatedDepartureDate).format('YYYY-MM-DD HH:mm:ss')}"` : null
  //         const etaQuery = estimatedArrivalDate ? `arrivalDateEstimated = "${moment.utc(estimatedArrivalDate).format('YYYY-MM-DD HH:mm:ss')}"` : null
  //         const atdQuery = actualDepartureDate ? `departureDateActual = "${moment.utc(actualDepartureDate).format('YYYY-MM-DD HH:mm:ss')}"` : null
  //         const ataQuery = actualArrivalDate ? `arrivalDateActual = "${moment.utc(actualArrivalDate).format('YYYY-MM-DD HH:mm:ss')}"` : null
  //         if (etdQuery || etaQuery || atdQuery || ataQuery) {
  //           let dateQuery = etdQuery || null
  //           if (etaQuery) {
  //             dateQuery = `${dateQuery ? `${dateQuery},` : ''}${etaQuery}`
  //           }
  //           if (atdQuery) {
  //             dateQuery = `${dateQuery ? `${dateQuery},` : ''}${atdQuery}`
  //           }
  //           if (ataQuery) {
  //             dateQuery = `${dateQuery ? `${dateQuery},` : ''}${ataQuery}`
  //           }
  //           await trackingReferenceService.query(`UPDATE shipment_date SET ${dateQuery} WHERE ${idsQuery.join(' OR ')}`)
  //         }

  //       }
  //     }
  //   }
  //   console.debug('Start Excecute (UpdateShipmentDateFromTrackingEvent) ...', this.constructor.name)
  //   return null
  // }
  public async mainFunction(eventDataList: EventData<Tracking>[]) {

    const {
      TrackingReferenceService: trackingReferenceService,
      // ShipmentService : shipmentService,
    }: {
      TrackingReferenceService: TrackingReferenceService,
      // ShipmentService: ShipmentService
    } = this.allService

    const trackingNoList = (eventDataList || []).reduce((
      trackingNos: any[],
      { originalEntity, updatedEntity, latestEntity }
    ) => {
      // only do things if have lastStatusCode
      if (latestEntity) {
        const {
          estimatedDepartureDate,
          estimatedArrivalDate,
          actualDepartureDate,
          actualArrivalDate,
          lastStatusCode,
          trackingStatus
        } = latestEntity
        if (estimatedDepartureDate || estimatedArrivalDate || actualDepartureDate || actualArrivalDate) {
          trackingNos.push({
            trackingNo: latestEntity.trackingNo,
            isClosed: latestEntity.isClosed,
            lastStatusCode, trackingStatus,
            estimatedDepartureDate, estimatedArrivalDate,
            actualDepartureDate, actualArrivalDate
          })
        }
      }
      return trackingNos
    }, [])
    if (trackingNoList && trackingNoList.length) {
      const trackingReferenceList = await trackingReferenceService.getTrackingReference(trackingNoList.map(({ trackingNo }) => trackingNo))
      if (trackingReferenceList && trackingReferenceList.length) {
        const selectedPartyGroupCode = trackingReferenceList.reduce((partyGroupCodes: string[], { partyGroupCode }: TrackingReference) => {
          if (partyGroupCode && !partyGroupCodes.find(s => s === partyGroupCode)) {
            partyGroupCodes.push(partyGroupCode)
          }
          return partyGroupCodes
        }, [])
        const partyGroupQuery = selectedPartyGroupCode.map(partyGroupCode => `(partyGroupCode = "${partyGroupCode}")`)
        const trackingNo = trackingNoList.reduce((tcs: string[], { trackingNo }) => {
          if (trackingNo && !tcs.find(s => s === trackingNo)) {
            tcs.push(trackingNo)
          }
          return tcs
        }, [])
        const trackingNoQuery = trackingNo.map((trackingNo) => {
          return `(shipment.masterNo = "${trackingNo}" OR shipment_container.carrierBookingNo = "${trackingNo}" OR shipment_container.containerNo = "${trackingNo}")`
        })
        const selectQuery = `
          SELECT shipment.id, shipment.masterNo, shipment_container.carrierBookingNo, shipment_container.containerNo
          FROM shipment
          LEFT OUTER JOIN shipment_container ON shipment_container.shipmentId = shipment.id
          WHERE (${partyGroupQuery && partyGroupQuery.length ? partyGroupQuery.join(' OR ') : '1=1'})
          AND (${trackingNoQuery && trackingNoQuery.length ? trackingNoQuery.join(' OR ') : '1=1'})
        `
        const ids = await trackingReferenceService.query(selectQuery, { type: Sequelize.QueryTypes.SELECT })
        if (ids && ids.length) {
          await BluebirdPromise.map(
            ids,
            async({ id, masterNo, carrierBookingNo, containerNo }) => {
              const {
                trackingNo,
                lastStatusCode, trackingStatus,
                estimatedDepartureDate, estimatedArrivalDate,
                actualDepartureDate, actualArrivalDate
              } = trackingNoList.find(t => t.trackingNo === masterNo || t.trackingNo === carrierBookingNo || t.trackingNo === containerNo)
              if (trackingNo) {
                //
                //           await trackingReferenceService.query(`
                //             UPDATE shipment
                //             SET currentTrackingNo = "${data.trackingNo}"
                //             WHERE (${idsQuery.join(' OR ')}) AND currentTrackingNo is null
                //           `)
                //         }
                if (trackingStatus && trackingStatus.length && !['ERR', 'CANF'].includes(lastStatusCode)) {
                  const finalUpdateTrckingNoQuery = `UPDATE shipment SET currentTrackingNo = "${trackingNo}" where id in (${id}) AND currentTrackingNo is null`
                  await trackingReferenceService.query(finalUpdateTrckingNoQuery)
                }
                if (estimatedDepartureDate) {
                  await trackingReferenceService.query(`
                    UPDATE shipment_date
                    SET departureDateEstimated = "${moment.utc(estimatedDepartureDate).format('YYYY-MM-DD HH:mm:ss')}"
                    WHERE shipmentId in (${id})
                    AND arrivalDateActual is null
                  `)
                }
                if (actualDepartureDate) {
                  await trackingReferenceService.query(`
                    UPDATE shipment_date
                    SET departureDateActual = "${moment.utc(actualDepartureDate).format('YYYY-MM-DD HH:mm:ss')}"
                    WHERE shipmentId in (${id})
                    AND arrivalDateActual is null
                  `)
                }
                if (estimatedArrivalDate) {
                  await trackingReferenceService.query(`
                    UPDATE shipment_date
                    SET arrivalDateEstimated = "${moment.utc(estimatedArrivalDate).format('YYYY-MM-DD HH:mm:ss')}"
                    WHERE shipmentId in (${id})
                    AND arrivalDateActual is null
                  `)
                }
                if (actualArrivalDate) {
                  const newATA = moment.utc(actualArrivalDate).format('YYYY-MM-DD HH:mm:ss')
                  await trackingReferenceService.query(`
                    UPDATE shipment_date
                    SET arrivalDateActual = "${newATA}"
                    WHERE shipmentId in (${id})
                    AND (arrivalDateActual is null or arrivalDateActual >= DATE_SUB("${newATA}", INTERVAL 45 day))
                  `)
                }
              }
              return null
            },
            { concurrency: 10 }
          )
        }
      }
    }

    return undefined
  }
}
