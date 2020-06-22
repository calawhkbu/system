
import { EventService, EventConfig, EventHandlerConfig, EventData, EventAllService } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'

import { DocumentTableService } from 'modules/sequelize/services/table/document'
import { Document } from 'models/main/document'
import BaseEventHandler from 'modules/events/baseEventHandler'
import { StorageService } from 'modules/storage/service'
import { SwivelConfigService } from 'modules/swivel-config/service'
import { OutboundService } from 'modules/integration-hub/services/outbound'
import { DocumentStorageService } from 'modules/documentStorage/service'


export default class UpdateDocumentPreviewEvent extends BaseEventHandler {
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

  public async mainFunction(eventDataList: EventData<Document>[]) {

    const documentTableService = this.allService['DocumentDbService'] as DocumentTableService
    const documentStorageService = this.allService['DocumentStorageService'] as DocumentStorageService

    const storageService = this.allService['StorageService'] as StorageService
    const swivelConfigService = this.allService['SwivelConfigService'] as SwivelConfigService
    const outboundService = this.allService['OutboundService'] as OutboundService

    const promiseList = eventDataList.map(async eventData => {

      const { latestEntity } = eventData


      try {

        const document = latestEntity

        const partyGroupCode = document.partyGroupCode
        // download the document
        const { fileBuffer, extension } = await documentTableService.downloadDocument(
          document.tableName,
          document.primaryKey,
          document.fileName,
          this.user
        )
        const base64String = await storageService.bufferToBase64DataString(fileBuffer)
        const { jobUrl } = await swivelConfigService.get()

        const responseBody = await outboundService.sendExternal(
          'preview-document',
          {
            url: jobUrl,
          },
          {
            fileData: {
              extension,
              base64string: base64String,
            },
          }
        )

        // extract the file returned from c#
        const fileData = responseBody.fileData

        const imageBase64String = fileData.base64String
        const imageExtension = fileData.extension

        const { fullKey } = await documentStorageService.composeKey(
          await documentTableService.getLocalPrefix(document),
          document.key
        )

        await documentStorageService.updatePreviewImage(
          partyGroupCode,
          fullKey,
          imageBase64String
        )
      } catch (e) {
        console.warn('update preview failed', this.constructor.name)
        console.error(e, e.stack, this.constructor.name)
        // prob. C# throw error (e.g. cannot generate preview for this fileType)
        // do nothing
      }



    })

    await Promise.all(promiseList)

    return []
  }
}
