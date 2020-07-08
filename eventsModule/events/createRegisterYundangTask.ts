import moment = require('moment')
import BluebirdPromise = require('bluebird')
import { Transaction, Sequelize, QueryTypes } from 'sequelize'
import { EventService, EventHandlerConfig, EventData, EventAllService } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import BaseEventHandler from 'modules/events/baseEventHandler'

import { TrackingReference } from 'models/main/trackingReference'

export default class CreateRegisterYundangEvent extends BaseEventHandler {
  constructor(
    protected eventDataList: EventData<any>[],
    protected readonly eventHandlerConfig: EventHandlerConfig,
    protected readonly repo: string,
    protected readonly eventService: EventService,
    protected readonly allService: EventAllService,
    protected readonly user?: JwtPayload,
    protected readonly transaction?: Transaction
  ) {
    super(eventDataList, eventHandlerConfig, repo, eventService, allService, user, transaction)
  }

  public async mainFunction(eventDataList: EventData<any>[]): Promise<any[]> {
    console.debug('Start Excecute...', this.constructor.name)
    console.debug(JSON.stringify(eventDataList), 'parameters')
    console.debug('End Excecute...', this.constructor.name)
    return null
  }
}
