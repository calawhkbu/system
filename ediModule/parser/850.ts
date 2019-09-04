
import { BaseEdiParser } from 'modules/edi/baseEdiParser'
import { CodeMasterService } from 'modules/sequelize/codeMaster/service'
import { ProductDbService } from 'modules/sequelize/product/service'
import { OutboundService } from 'modules/integration-hub/services/outbound'

export default class EdiParser850 extends BaseEdiParser {

    constructor(
        protected readonly type: string,
        protected readonly formatJson: any,
        protected readonly outboundService: OutboundService,
        protected readonly codeMasterService: CodeMasterService,
        protected readonly productDbService: ProductDbService

    ) {
        super(type, formatJson, outboundService, codeMasterService, productDbService)
    }

    async import(base64EdiContent: string, jsonFormat: any): Promise<any> {

        console.log(`import type  : ${this.type}`)

        const result = await this.callImportOutbound()

        return result

    }

    async export(jsonFormat: any): Promise<any> {

        console.log(`export type  : ${this.type}`)

        const result = await this.callExportOutbound()

        return result

    }

}
