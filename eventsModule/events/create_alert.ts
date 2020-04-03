import BaseEventHandler from 'modules/events/baseEventHandler'
import { EventService, EventConfig, EventData, EventHandlerConfig } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import { AlertDbService } from 'modules/sequelize/alert/service'

class CreateAlertEvent extends BaseEventHandler {
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

  public async mainFunction(eventDataList: EventData<any>[]) {

    const alertDbService = this.allService['AlertDbService'] as AlertDbService

    const promiseList = eventDataList.map(eventData => {

      const tableName = eventData.tableName
      const primaryKey = eventData.primaryKey
      const alertType = eventData.alertType
      const extraParam = eventData.extraParam

      // todo : later change to bulk
      return alertDbService.createAlert(
        tableName,
        primaryKey,
        alertType,
        extraParam,
        this.user,
        this.transaction
      )

    })

    return await Promise.all(promiseList)

  }
}
