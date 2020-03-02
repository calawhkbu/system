import { BaseEvent } from 'modules/events/base-event'
import { EventService, EventConfig } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import { EdiService } from 'modules/edi/service'
import { TrackingReference } from 'models/main/trackingReference'
import { TrackingReferenceService } from 'modules/sequelize/trackingReference/service'


class SendEdiEvent extends BaseEvent {
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
      TrackingReferenceService: trackingReferenceService,
      EdiService: ediService
    } = this.allService as {
      EdiService: EdiService,
      TrackingReferenceService: TrackingReferenceService
    }
    const { oldData = null, data } = parameters
    if (data) {
      const createOrUpdate = oldData ? 'update' : 'create'
      let sendIt = false
      if (createOrUpdate === 'create') {
        if (data.lastStatusCode && !(['NEW', 'CANF', 'ERR', 'TSBA', 'TSDC'].includes(data.lastStatusCode))) {
          sendIt = true
        }
      } else if (createOrUpdate === 'update') {
        if (data.lastStatusCode && !(['NEW', 'CANF', 'ERR', 'TSBA', 'TSDC'].includes(data.lastStatusCode)) && oldData.lastStatusCode !== data.lastStatusCode) {
          sendIt = true
        }
      }
      if (sendIt) {
        const references: TrackingReference[] = await trackingReferenceService.getTrackingReference(
          [data.trackingNo], this.user, this.transaction
        )
        for (const { id, partyGroupCode } of references) {
          if (['ECXD'].includes(partyGroupCode)) {
            const value = {
              ...data.dataValues,
              trackingReference: await trackingReferenceService.findOne(id)
            }
            console.log(value, 'EDI')
            try {
              let finalCode = process.env.NODE_ENV === 'production' ? partyGroupCode : 'DEV'
              if (finalCode === 'ECXD') {
                finalCode = 'ECX'
              }
              await ediService.export(finalCode, '315', value)
            } catch (e) {
              console.log('Error', 'edi315')
              console.error(e, e.stack, this.constructor.name)
            }
          }
        }
      }
    }

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
    const event = new SendEdiEvent(
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
