
import { EventService, EventConfig, EventHandlerConfig, EventData } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'

import { DocumentTableService } from 'modules/sequelize/services/table/document'
import BaseEventHandler from 'modules/events/baseEventHandler'

// // debug

// import { DocumentDbService } from '../../../../swivel-backend-new/src/modules/sequelize/document/service';

export default class FillTemplateEvent extends BaseEventHandler {
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

    const promiseList = eventDataList.map(async eventData => {

      const { latestEntity, tableName, primaryKey, fileName, outputFileType } = eventData as EventData<any>

      const {
        DocumentDbService: doucmentDbService
      } = this.allService as {
        DocumentDbService: DocumentTableService
      }
      const newDocument = await doucmentDbService.fillTemplate(
        tableName,
        primaryKey,
        fileName,
        outputFileType,
        this.user,
        this.transaction
      )

      return newDocument

    })

    return await Promise.all(promiseList)

  }
}
