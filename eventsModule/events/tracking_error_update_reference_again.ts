import { EventService, EventConfig, EventHandlerConfig, EventData } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import { Tracking } from 'models/main/tracking'
import { TrackingReference } from 'models/main/trackingReference'
import { TrackingReferenceService } from 'modules/sequelize/trackingReference/service'
import BaseEventHandler from 'modules/events/baseEventHandler'

export default class TrackingErrorUpdateReferenceAgainEvent extends BaseEventHandler {
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

  public async mainFunction(eventDataList: EventData<Tracking>[]) {
    console.log('Start Excecute...', this.constructor.name)

    const {
      TrackingReferenceService: trackingReferenceService,
    }: {
      TrackingReferenceService: TrackingReferenceService
    } = this.allService

    const trackingNoList = eventDataList.reduce((
      trackingNos: any[],
      { originalEntity, updatedEntity, latestEntity, maxErrorTime }
    ) => {
      if (latestEntity.errorTime > maxErrorTime) {
        trackingNos.push(latestEntity.trackingNo)
      }
      return trackingNos
    }, [])
    const trackingReferences = await trackingReferenceService.getTrackingReference(trackingNoList, this.user, this.transaction)
    await trackingReferenceService.save(
      trackingReferences.reduce((selected: TrackingReference[], {
        id, mode, trackingType, flexData, masterNo = null, soNo = [], containerNo = []
      }: TrackingReference) => {
        if (trackingType === 'SEA') {
          let newMode = mode
          if (mode === 'masterNo') {
            if (soNo && soNo.length) {
              newMode = 'soNo'
            }
            if (containerNo && containerNo.length) {
              newMode = 'containerNo'
            }
          } else if (mode === 'soNo') {
            if (containerNo && containerNo.length) {
              newMode = 'containerNo'
            }
            if (masterNo) {
              newMode = 'containerNo'
            }
          } else if (mode === 'containerNo') {
            if (masterNo) {
              newMode = 'containerNo'
            }
            if (soNo && soNo.length) {
              newMode = 'soNo'
            }
          }
          if (newMode !== mode) {
            selected.push({
              id,
              mode: newMode,
              flexData,
              yundang: 0
            } as TrackingReference)
          }
        }
        return selected
      }, []),
      this.user,
      this.transaction
    )

    console.log('End Excecute...', this.constructor.name)
    return trackingNoList

  }
}
