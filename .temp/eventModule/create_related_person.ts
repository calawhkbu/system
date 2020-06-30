
import { EventService, EventConfig, EventHandlerConfig, EventData, EventAllService } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import _ = require('lodash')
import { RelatedPersonTableService } from 'modules/sequelize/services/table/relatedPerson'
import { RelatedPerson } from 'models/main/relatedPerson'
import BaseEventHandler from 'modules/events/baseEventHandler'
import { Shipment } from 'models/main/shipment'

export default class CreateRelatedPersonEvent extends BaseEventHandler {
  constructor(
    protected  eventDataList: EventData<any>[],
    protected readonly eventHandlerConfig: EventHandlerConfig,
    protected readonly repo: string,
    protected readonly eventService: EventService,
    protected readonly allService: EventAllService,

    protected readonly user?: JwtPayload,
    protected readonly transaction?: Transaction
  ) {
    super(eventDataList, eventHandlerConfig, repo, eventService, allService, user, transaction)
  }

  public async mainFunction(eventDataList: EventData<any>[]) {
    console.debug('Start Excecute [Create Related Person]...', this.constructor.name)
    return null
  }
}
