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

  public async mainFunction({
    entityList, maxErrorTime
  }: {
    entityList: { originalEntity: Tracking, updatedEntity: Tracking, latestEntity: Tracking }[],
    maxErrorTime: number
  }) {
    console.log('Start Excecute...', this.constructor.name)
    const {
      TrackingReferenceService: trackingReferenceService,
    }: {
      TrackingReferenceService: TrackingReferenceService
    } = this.allService
    const trackingNoList = entityList.reduce((
      trackingNos: any[],
      { originalEntity, updatedEntity, latestEntity }
    ) => {
      if (latestEntity.errorTime > maxErrorTime) {
        trackingNos.push(latestEntity.trackingNo)
      }
      return trackingNos
    }, [])
    const trackingReferences = await trackingReferenceService.getTrackingReference(trackingNoList, this.user, this.transaction)
    await trackingReferenceService.save(
      trackingReferences.reduce((selected: TrackingReference[], {
        id, mode, trackingType, flexData
      }: TrackingReference) => {
        if (trackingType === 'SEA') {
          let newMode = mode
          if (mode === 'masterNo') {
            newMode = 'soNo'
          } else if (mode === 'soNo') {
            newMode = 'containerNo'
          } else if (mode === 'containerNo') {
            newMode = 'masterNo'
          }
          selected.push({
            id,
            mode: newMode,
            flexData,
            yundang: 0
          } as TrackingReference)
        }
        return selected
      }, []),
      this.user,
      this.transaction
    )
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
