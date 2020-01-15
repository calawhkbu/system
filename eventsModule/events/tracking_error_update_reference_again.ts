import { BaseEvent } from 'modules/events/base-event'
import { EventService, EventConfig } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import { Tracking } from 'models/main/tracking'
import { TrackingReference } from 'models/main/trackingReference'
import { TrackingReferenceService } from 'modules/sequelize/trackingReference/service'

class TrackingErrorUpdateReferenceAgainEvent extends BaseEvent {
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
    console.log('Start Excecute...', this.constructor.name)
    const { data, maxErrorTime } = parameters as { data: Tracking, maxErrorTime: number }
    if (data.errorTime > maxErrorTime) {
      const {
        TrackingReferenceService: trackingReferenceService,
      }: {
        TrackingReferenceService: TrackingReferenceService
      } = this.allService
      for (const { id, mode, trackingType } of (await trackingReferenceService.getTrackingReference([data.trackingNo], this.user, this.transaction))) {
        if (trackingType === 'SEA') {
          let newMode = mode
          if (mode === 'masterNo') {
            newMode = 'soNo'
          } else if (mode === 'soNo') {
            newMode = 'containerNo'
          } else if (mode === 'containerNo') {
            newMode = 'masterNo'
          }
          await trackingReferenceService.save(
            {
              id,
              mode: newMode,
              yundang: false
            } as TrackingReference,
            this.user,
            this.transaction
          )
        }
      }
    }
    console.log('End Excecute...', this.constructor.name)
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
    const event = new TrackingErrorUpdateReferenceAgainEvent(
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
