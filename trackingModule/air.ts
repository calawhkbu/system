import moment = require('moment')

import { TrackingReference } from 'models/main/trackingReference'
import { Tracking } from 'models/main/tracking'

import { TrackingService } from 'modules/sequelize/tracking/service'
import { TrackingReferenceService } from 'modules/sequelize/trackingReference/service'
import { OutboundService } from 'modules/integration-hub/services/outbound'
import { CodeMasterService } from 'modules/sequelize/codeMaster/service'
import { SwivelConfigService } from 'modules/swivel-config/service'

export default class BaseAirTrackingService {
  constructor (
    private readonly swivelConfigService: SwivelConfigService,
    private readonly trackingService: TrackingService,
    private readonly trackingReferenceService: TrackingReferenceService,
    private readonly outboundService: OutboundService,
    private readonly codeMasterService: CodeMasterService,
    private readonly buffer?: any,
  ) {}
  async registerNew (
    partyGroupCode: string,
    trackingForm: { carrierCode?: string, carrierCode2?: string, masterNo: string, departureDateEstimated: string }
  ) {
    const trackingReference = await this.trackingReferenceService.findOne({
      where: {
        partyGroupCode,
        trackingType: 'AIR',
        masterNo: trackingForm.masterNo
      }
    })
    if (trackingReference) {
      return trackingReference
    }
    // TODO masterno validation
    return await this.trackingReferenceService.save({
      partyGroupCode,
      trackingType: 'AIR',
      carrierCode: trackingForm.carrierCode,
      ...(trackingForm.carrierCode2 ? { carrierCode2:  trackingForm.carrierCode2 } : {}),
      masterNo: trackingForm.masterNo,
      soNo: [],
      containerNo: [],
      departureDateEstimated: trackingForm.departureDateEstimated,
      mode: 'masterNo'
    })
  }
  async track (
    trackingReference: TrackingReference
  ): Promise<boolean> {
    const { trackingModule } = await this.swivelConfigService.get()
    let trackingNos: string|string[] = trackingReference[trackingReference.mode] || null
    if (!Array.isArray(trackingNos)) {
      trackingNos = [trackingNos]
    }
    if (!trackingNos.length) {
      console.warn('No Tracking No')
      return
    }
    return Promise.all(trackingNos.map((trackingNo: string) => {
      return this.trackingService.findOne({ where: { source: 'YUNDANG', trackingNo } })
        .then((oldTracking) => {
          if (oldTracking) {
            if (oldTracking.batchRetry > trackingModule.retryTime.air) {
              throw new Error()
            }
            return this.get(trackingNo, trackingReference.carrierCode, trackingReference.carrierCode2, oldTracking)
          }
          return this.register(trackingNo, trackingReference.carrierCode, trackingReference.carrierCode2)
        })
        .catch((e: any) => { throw e })
    }))
      .then(() => true)
      .catch((e: any) => {
        console.error(e, e.stack, 'BaseAirTrackingService')
        throw e
      })
  }
  async register (
    trackingNo: string,
    carrierCode: string,
    carrierCode2: string
  ): Promise<void> {
    const { trackingModule } = await this.swivelConfigService.get()
    const newTracking = {
      source: 'YUNDANG',
      trackingNo: trackingNo,
      batchStatus: 'OPEN',
      batchRetry: 0,
      details: {
        lastStatus: null,
        lastStatusCode: null,
        lastStatusDate: null,
        estimatedDepartureDate: null,
        estimatedArrivalDate: null,
        actualDepartureDate: null,
        actualArrivalDate: null,
        isClosed: null,
        lastStatusUpdateDate: null,
        lastActualUpdateDate: null
      },
      lastStatus: null,
      lastStatusCode: null,
      lastStatusDate: null,
      estimatedDepartureDate: null,
      estimatedArrivalDate: null,
      actualDepartureDate: null,
      actualArrivalDate: null,
      isClosed: null,
      lastStatusUpdateDate: null,
      lastActualUpdateDate: null,
      detailsRaw: null,
      lastBatchDate: moment.utc().toDate()
    }
    try {
      const newDetailsRaw = await this.outboundService.send(
        'system',
        'yundang-air-register',
        { Buffer: this.buffer, constants: trackingModule.yundang },
        { masterNo: trackingNo, carrierCode, carrierCode2 }
      )
      if (newDetailsRaw.success && newDetailsRaw.result[0].success) {
        newTracking.detailsRaw = newDetailsRaw
        newTracking.batchStatus = 'OPEN'
      } else {
        newTracking.detailsRaw = null
        newTracking.batchStatus = 'ERROR'
        newTracking.batchRetry = 1
      }
      await this.trackingService.save(newTracking)
    } catch (e) {
      console.error(e, e.stack, 'BaseAirTrackingService')
    }
  }
  async get (
    trackingNo: string,
    carrierCode: string,
    carrierCode2: string,
    oldTracking: Tracking
  ): Promise<void> {
    const { trackingModule } = await this.swivelConfigService.get()
    if (oldTracking.trackingNo !== trackingNo) {
      return
    }
    let newTracking = {
      id: oldTracking.id,
      source: 'YUNDANG',
      trackingNo: oldTracking.trackingNo,
      batchStatus: 'OPEN',
      details: oldTracking.details,
      detailsRaw: oldTracking.detailsRaw,
      batchRetry: oldTracking.batchRetry,
      lastBatchDate: moment.utc().toDate()
    }
    try {
      const oldDetails = oldTracking.details
      let newDetailsRaw = (await this.outboundService.send(
        'system',
        'yundang-air-get',
        { Buffer: this.buffer, constants: trackingModule.yundang },
        { masterNo: trackingNo, carrierCode, carrierCode2 }
      ))
      newDetailsRaw = Array.isArray(newDetailsRaw) ? newDetailsRaw[0] : null
      console.log(newDetailsRaw)
      newTracking.detailsRaw = newDetailsRaw
      if (!(newDetailsRaw && newDetailsRaw.success && newDetailsRaw.objairlinertracking)) {
        throw new Error()
      }
      newDetailsRaw = newDetailsRaw.objairlinertracking
      newTracking.batchStatus = 'OPEN'
      const status = [] // TODO get from codeMaster
      let newDetails = oldDetails
      newDetails.isClosed = newDetailsRaw.endTime || newDetailsRaw.isendforce === 'Y'
      newDetails.lastStatusCode = newDetailsRaw.currentnode
      newDetails.lastStatus = status[newDetailsRaw.currentnode] || newDetailsRaw.currentnode
      newDetails.lastStatusDate = newDetailsRaw.currentnodetime ? new Date(newDetailsRaw.currentnodetime) : null
      console.log([newDetails.lastStatusCode, oldDetails.lastStatusCode])
      console.log([newDetails.lastStatus, oldDetails.lastStatus])
      console.log([moment(oldDetails.lastStatusDate), moment(newDetails.lastStatusDate)])
      if (
        newDetails.lastStatusCode !== oldDetails.lastStatusCode ||
        newDetails.lastStatus !== oldDetails.lastStatus ||
        (moment(oldDetails.lastStatusDate).isSame(moment(newDetails.lastStatusDate)))
      ) {
        newDetails.lastStatusUpdateDate = moment.utc().toDate()
      }
      let trackingHistory: any[] = newDetailsRaw.lstairlinertrackingstatus || []
      const departure = trackingHistory.filter(h => h.statuscd === 'DEP')
      departure.forEach(d => {
        if (d.isest) {
          newDetails.estimatedDepartureDate = newDetails.estimatedDepartureDate || d.statustime
        }
        newDetails.actualDepartureDate = newDetails.actualDepartureDate || d.statustime
      })

      const arrival = trackingHistory.filter(h => h.statuscd === 'ARR')
      arrival.forEach(d => {
        if (d.isest) {
          newDetails.estimatedArrivalDate = newDetails.estimatedArrivalDate || d.statustime
        }
        newDetails.actualArrivalDate = newDetails.actualArrivalDate || d.statustime
      })
      if (
        (moment(oldDetails.estimatedDepartureDate).isSame(moment(newDetails.estimatedDepartureDate))) ||
        (moment(oldDetails.actualDepartureDate).isSame(moment(newDetails.actualDepartureDate))) ||
        (moment(oldDetails.estimatedArrivalDate).isSame(moment(newDetails.estimatedArrivalDate))) ||
        (moment(oldDetails.actualArrivalDate).isSame(moment(newDetails.actualArrivalDate)))
      ) {
        newDetails.lastActualUpdateDate = moment.utc().toDate()
      }
      newDetails.history = trackingHistory.map((item) => ({
        flightNo:item.flightno,
        statusCode: item.statuscd,
        status: status[item.statuscd] || item.statuscd,
        statusDescription: item.statedescription_en,
        statusDescription_cn: item.statedescription,
        statusDate: item.statustime ? new Date(item.statustime) : null,
        statusPlace: item.statusplace,
        // statusPlaceType: airports[item.statusplace] ? 'airport' : 'other',
        // statusPlaceDescription: airports[item.statusplace] ? airports[item.statusplace].locationNameClean : item.statusplace,
        updatedAt: new Date(item.updatetime),
        isEstimated: item.isest == "Y" ? true : false,
        pieces: item.pieces,
        weight: item.weight,
        volume: item.volume
      }))
      newDetails.billContainerTracking = [];
      if (newDetailsRaw.lstBookingInfo && newDetailsRaw.lstBookingInfo.length > 0) {
        newDetails.billContainerTracking = newDetailsRaw.lstBookingInfo.map((item : any) => {
          let flightDetails = [];
          if (item.lstflightinfo && item.lstflightinfo.length > 0) {
            flightDetails = item.lstflightinfo.map((flight: any) => ({
              flightNo: flight.flightno,
              flightDate: flight.flightdate ? new Date(flight.flightdate) : null,
              origin: flight.org,
              destination: flight.dst,
              etd: flight.etd ? new Date(flight.etd) : null,
              eta: flight.eta ? new Date(flight.eta) : null,
              atd: flight.atd ? new Date(flight.atd) : null,
              ata: flight.ata ? new Date(flight.ata) : null,
              statusCode: flight.status,
              status: status[flight.status] || flight.status,
              statusDescription:flight.statusdescription,
              goodsDetails:{
                name: flight.goodsname,
                pieces: flight.pieces,
                weight: flight.weight,
                volume: flight.volume
              }
            }))
          }
          return {
            origin: item.org,
            destination: item.dst,
            goodsDetails: {
              name: item.goodsname,
              pieces: item.pieces,
              weight: item.weight
            },
            flightDetails: flightDetails,
            history: item.lstcargostatus.map((history: any) => ({
              flightNo: history.flightno,
              statusCode: history.status,
              status: status[history.status] || history.status,
              statusDescription: history.statedescription,
              statusDate: new Date(history.eventtime),
              statusPlace: history.station,
              // statusPlaceType: airports[history.station] ? 'airport' : 'other',
              // statusPlaceDescription: airports[history.station] ? airports[history.station].locationNameClean : history.station,
              updatedAt: new Date(history.updatetime),
              isEstimated: history.isest == "Y" ? true : false,
              pieces: history.pieces,
              weight: history.weight
            }))
          }
        })
      } else {
        newDetails.billContainerTracking = []
      }
      newTracking.details = newDetails
    } catch (e) {
      newTracking.detailsRaw = null
      newTracking.batchStatus = 'ERROR'
      newTracking.batchRetry = oldTracking.batchRetry + 1
      console.error(e, e.stack, 'BaseAirTrackingService')
    }
    await this.trackingService.save(newTracking)
  }
}
