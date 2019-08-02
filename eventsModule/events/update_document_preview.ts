
import { BaseEvent } from 'modules/events/base-event'
import { EventService, EventConfig } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload';
import { Transaction } from 'sequelize';

import { DocumentDbService } from 'modules/sequelize/document/service';
import { Document } from 'models/main/document';

// debug
// import { Document } from '../../../../swivel-backend-new/src/models/main/document';
// import { DocumentDbService } from '../../../../swivel-backend-new/src/modules/sequelize/document/service';




class AfterCreateDocumentEvent extends BaseEvent {

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



    const documentService = this.allService['DocumentDbService'] as DocumentDbService

    const document = parameters.data as Document

    await documentService.updateDocumentPreviewImage(document.tableName,document.primaryKey,document.fileName,this.user)

    return {
    }

  }
}


export default {


  execute: async (parameters: any, eventConfig: EventConfig, repo: string, eventService: any, allService: any, user?: JwtPayload, transaction?: Transaction) => {

    const event = new AfterCreateDocumentEvent(parameters, eventConfig, repo, eventService, allService,user,transaction)
    return await event.execute()

  }

}
