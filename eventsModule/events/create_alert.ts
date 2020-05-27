import BaseEventHandler from 'modules/events/baseEventHandler'
import { EventService, EventConfig, EventData, EventHandlerConfig } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Sequelize, Transaction } from 'sequelize'
import { AlertTableService } from 'modules/sequelize/services/table/alert'

export default class CreateAlertEvent extends BaseEventHandler {
  constructor(
    protected eventDataList: EventData<any>[],
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

    const alertDbService = this.allService['AlertDbService'] as AlertTableService

    const alertDataList = eventDataList.map(eventData => {

      const partyGroupCode = eventData.partyGroupCode as string
      const tableName = eventData.tableName as string
      const primaryKey = eventData.primaryKey as string
      const alertType = eventData.alertType as string
      const extraParam = eventData.extraParam as { [key: string]: any }

      return { tableName, primaryKey, alertType, extraParam, partyGroupCode }
    })

    return await alertDbService.createAlert(alertDataList, this.user, this.transaction)

  }
}
