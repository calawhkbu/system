import moment = require('moment')

import { TrackingReference } from 'models/main/trackingReference'
import { Tracking } from 'models/main/tracking'

import { TrackingService } from 'modules/sequelize/tracking/service'
import { TrackingReferenceService } from 'modules/sequelize/trackingReference/service'
import { OutboundService } from 'modules/integration-hub/services/outbound'
import { CodeMasterService } from 'modules/sequelize/codeMaster/service'
import { SwivelConfigService } from 'modules/swivel-config/service'

export default class BaseAirTrackingService {
  constructor(
    private readonly swivelConfigService: SwivelConfigService,
    private readonly trackingService: TrackingService,
    private readonly trackingReferenceService: TrackingReferenceService,
    private readonly outboundService: OutboundService,
    private readonly codeMasterService: CodeMasterService,
    private readonly buffer?: any
  ) {}
  async registerNew(partyGroupId: number, trackingForm: any) {
    return null
  }
  async track(trackingReference: TrackingReference): Promise<boolean> {
    return false
  }
}
