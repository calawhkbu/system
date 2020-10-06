import { BaseExcelParser } from 'modules/parser/parser/excel'
export const templateFormat = {}

export default class DefaultParser extends BaseExcelParser {

  async getImportTemplate(jsonTemplate: any)
  {
    return await super.getImportTemplate(jsonTemplate)
  }

  async export(exportEntity: any)
  {
    return await super.export(exportEntity)
  }

  async import(base64String: string) {
    const response = super.import(base64String)
    return response
  }
}
