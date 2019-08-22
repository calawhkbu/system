import { BaseEvent } from 'modules/events/base-event'
import { EventService, EventConfig } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import { AlertDbService } from '../../../../swivel-backend-new/src/modules/sequelize/alert/service'

class CreateAlertEvent extends BaseEvent {
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
    console.log(JSON.stringify(parameters), 'parameters')

    const tableName = parameters.tableName
    const primaryKey = parameters.primaryKey
    const alertType = parameters.alertType
    const customMessage = parameters.customMessage
    const extraParam = parameters.extraParam

    const alertDbService = this.allService['AlertDbService'] as AlertDbService

    return await alertDbService.createAlert(tableName, primaryKey, alertType, customMessage, extraParam, this.user)
  }
}

export default {
  execute: async(parameters: any, eventConfig: EventConfig, repo: string, eventService: any, allService: any, user?: JwtPayload, transaction?: Transaction) => {
    const event = new CreateAlertEvent(parameters, eventConfig, repo, eventService, allService, user, transaction)
    return await event.execute()
  },
}
