
import { EventService, EventConfig, EventHandlerConfig, EventData } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'

import { DocumentDbService } from 'modules/sequelize/document/service'
import { Document } from 'models/main/document'
import BaseEventHandler from 'modules/events/baseEventHandler'

// debug
// import { Document } from '../../../../swivel-backend-new/src/models/main/document';
// import { DocumentDbService } from '../../../../swivel-backend-new/src/modules/sequelize/document/service';

export default class UpdateDocumentPreviewEvent extends BaseEventHandler {
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

  public async mainFunction(eventDataList: EventData<Document>[]) {
    const documentService = this.allService['DocumentDbService'] as DocumentDbService

    const promiseList = eventDataList.map(async eventData => {

      const { latestEntity } = eventData

      await documentService.updateDocumentPreviewImage(
        latestEntity.tableName,
        latestEntity.primaryKey,
        latestEntity.fileName,
        this.user
      )

    })

    await Promise.all(promiseList)

    return []
  }
}
