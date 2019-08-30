
import { BaseEdiParser } from 'modules/edi/baseEdiParser'
import { StorageService } from 'modules/storage/service'
import { CodeMasterService } from 'modules/sequelize/codeMaster/service'
import { ProductDbService } from 'modules/sequelize/product/service'
import { OutboundService } from 'modules/integration-hub/services/outbound'

export default class EdiParser850 extends BaseEdiParser {

    constructor(
        protected readonly type: string,
        protected readonly format: any,
        protected readonly storageService: StorageService,
        protected readonly outboundService: OutboundService,
        protected readonly codeMasterService: CodeMasterService,
        protected readonly productDbService: ProductDbService

    ) {
        super(type, format, storageService, outboundService, codeMasterService, productDbService)
    }

    async import(): Promise<any> {

        console.log(`import type  : ${this.type}`)

        const result = {}

        return result

    }

    async export(): Promise<any> {

        console.log(`export type  : ${this.type}`)

        const result = ''
        return result

    }

}
