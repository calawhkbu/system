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
    trackingForm: { carrierCode: string, masterNo: string, carrierBookingNo?: string[], containerNo?: string[], departureDateEstimated: string }
  ) {
    const trackingReference = await this.trackingReferenceService.findOne({
      where: { partyGroupCode, trackingType: 'SEA', masterNo: trackingForm.masterNo }
    })
    if (trackingReference) {
      return trackingReference
    }
    if (!trackingForm.carrierCode) {
      throw new Error('No Carrier Code')
    }
    const code = this.codeMasterService.findOne({ where: { codeType: 'yundang-carrier-sea', code: trackingForm.carrierCode } })
    if (!code) {
      throw new Error('Carrier not support')
    }
    if (!trackingForm.masterNo) {
      throw new Error('No MasterNo')
    }
    (trackingForm.carrierBookingNo || []).forEach(carrierBookingNo => {
      if (typeof carrierBookingNo !== 'string') {
        throw new Error('carrier booking no is not correct')
      }
    });
    (trackingForm.containerNo || []).forEach(containerNo => {
      if (typeof containerNo !== 'string') {
        throw new Error('carrier booking no is not correct')
      }
    });
    // TODO masterno validation
    return await this.trackingReferenceService.save({
      partyGroupCode,
      trackingType: 'SEA',
      carrierCode: code.name,
      masterNo: trackingForm.masterNo,
      carrierBookingNo: trackingForm.carrierBookingNo,
      containerNo: trackingForm.carrierBookingNo,
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
      return this.trackingService.findOne({
        where: { source: 'YUNDANG', trackingNo }
      })
        .then((oldTracking) => {
          if (oldTracking) {
            if (oldTracking.batchRetry > trackingModule.retryTime.sea) {
              throw new Error()
            }
            let trackingNo2 = {}
            return this.get(trackingNo, trackingReference, trackingReference.carrierCode, oldTracking)
          }
          return this.register(trackingNo, trackingReference, trackingReference.carrierCode)
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
    trackingReference: TrackingReference,
    carrierCode: string
  ): Promise<void> {
    const { trackingModule } = await this.swivelConfigService.get()
    let newTracking = {
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
      detailsRaw: null,
      lastBatchDate: moment.utc().toDate()
    }
    const isMasterContainer = (trackingReference.mode === 'containerNo')
    let masterNo2 = null
    if (carrierCode === 'SITC') {
      if (trackingReference.mode === 'masterNo') {
        masterNo2 = trackingReference.containerNo[0]
      } else if (trackingReference.mode === 'carrierBookingNo') {
        masterNo2 = trackingReference.containerNo[0]
      } else if (trackingReference.mode === 'containerNo') {
        masterNo2 = trackingReference.masterNo
      }
    }
    try {
      const newDetailsRaw = await this.outboundService.send(
        'system',
        'yundang-sea-register',
        { Buffer: this.buffer, constants: trackingModule.yundang },
        { masterNo: trackingNo, carrierCode, isMasterContainer, ...(masterNo2 ? { masterNo2 }: {}) }
      )
      newTracking.detailsRaw = newDetailsRaw
      if (newDetailsRaw.success && newDetailsRaw.result[0].success) {
        newTracking.batchStatus = 'OPEN'
        newTracking.batchRetry = 0
      } else {
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
    trackingReference: TrackingReference,
    carrierCode: string,
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
      const isMasterContainer = (trackingReference.mode === 'containerNo')
      let masterNo2 = null
      if (carrierCode === 'SITC') {
        if (trackingReference.mode === 'masterNo') {
          masterNo2 = trackingReference.containerNo[0]
        } else if (trackingReference.mode === 'carrierBookingNo') {
          masterNo2 = trackingReference.containerNo[0]
        } else if (trackingReference.mode === 'containerNo') {
          masterNo2 = trackingReference.masterNo
        }
      }
      let newDetailsRaw = (await this.outboundService.send(
        'system',
        'yundang-sea-get',
        { Buffer: this.buffer, constants: trackingModule.yundang },
        { masterNo: trackingNo, carrierCode, isMasterContainer, ...(masterNo2 ? { masterNo2 }: {}) }
      ))
      newDetailsRaw = Array.isArray(newDetailsRaw) ? newDetailsRaw[0] : null
      newTracking.detailsRaw = newDetailsRaw
      if (!(newDetailsRaw && newDetailsRaw.success && newDetailsRaw.objlinertracking)) {
        throw new Error()
      }
      newDetailsRaw = newDetailsRaw.objlinertracking
      newTracking.batchStatus = 'OPEN'
      const status = [] // TODO get from codeMaster
      let newDetails = oldDetails
      newDetails.isClosed = newDetailsRaw.endTime || newDetailsRaw.isendforce === 'Y'
      newDetails.lastStatusCode = newDetailsRaw.currentnode
      newDetails.lastStatus = status[newDetailsRaw.currentnode] || newDetailsRaw.currentnode
      newDetails.lastStatusDate = newDetailsRaw.currentnodetime ? new Date(newDetailsRaw.currentnodetime) : null
      if (
        newDetails.lastStatusCode !== oldDetails.lastStatusCode ||
        newDetails.lastStatus !== oldDetails.lastStatus ||
        (moment(oldDetails.lastStatusDate).isSame(moment(newDetails.lastStatusDate)))
      ) {
        newDetails.lastStatusUpdateDate = moment.utc().toDate()
      }
      newDetails.lastPort = newDetailsRaw.currentnodeplace
      newDetails.vesselName = newDetailsRaw.vslname
      let trackingHistory: any[] = newDetailsRaw.lstlinertrackingstatus || []
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
        statusCode: item.statuscd,
        status: status[item.statuscd] || item.statuscd,
        statusDescription: item.statedescription_en,
        statusDescription_cn: item.statedescription,
        statusDate: new Date(item.statustime),
        statusPlace: item.statusplace,
        updatedAt: new Date(item.updatetime),
        isEstimated: item.isest == "Y" ? true : false
      }))
      newDetails.billCargoTracking = []
      if (newDetailsRaw.objbillinfo && newDetailsRaw.objbillinfo.lstctnrinfos && newDetailsRaw.objbillinfo.lstctnrinfos.length > 0) {
        newDetails.billContainerTracking = newDetailsRaw.objbillinfo.lstctnrinfos.map((item : any) => {
          return {
            containerNo: item.conno,
            sealNo: item.sealno,
            containerType: item.ctype,
            containerSize: item.csize,
            history: item.lstctnrstatus.map((item: any) => {
              return {
                  vessel: item.vslname,
                  voyage: item.voy,
                  statusCode: item.status,
                  status: status[item.status] || item.status,
                  statusDescription: item.statedescription,
                  statusDate: new Date(item.eventtime),
                  statusPlace: item.station,
                  updatedAt: new Date(item.updatetime)
               }
            })
          }
        })
      } else {
        newDetails.billContainerTracking = []
      }
      newTracking.details = newDetails
      newTracking.batchRetry = 0
    } catch (e) {
      newTracking.detailsRaw = null
      newTracking.batchStatus = 'ERROR'
      newTracking.batchRetry = oldTracking.batchRetry + 1
      console.error(e, e.stack, 'BaseSeaTrackingService')
    }
    await this.trackingService.save(newTracking)
  }
}
