import { BaseEvent } from 'modules/events/base-event'
import { EventService, EventConfig } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'

import { DocumentDbService } from 'modules/sequelize/document/service'
import { Transaction } from 'sequelize'

// // debug

// import { DocumentDbService } from '../../../../swivel-backend-new/src/modules/sequelize/document/service';

class FillTemplateEvent extends BaseEvent {
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
    console.log('fill template', 'template')
    const tableName = parameters.tableName
    const primaryKey = parameters.primaryKey
    const fileName = parameters.fileName
    const outputFileType = parameters.outputFileType

    const doucmentDbService = this.allService['DocumentDbService'] as DocumentDbService
    const newDocument = await doucmentDbService.fillTemplate(
      tableName,
      primaryKey,
      fileName,
      outputFileType,
      this.user,
      this.transaction
    )

    return newDocument
  }
}

export default {
  execute: async (
    parameters: any,
    eventConfig: EventConfig,
    repo: string,
    eventService: any,
    allService: any,
    user?: JwtPayload,
    transaction?: Transaction
  ) => {
    const event = new FillTemplateEvent(
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
