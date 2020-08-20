import { BaseExcelParser } from 'modules/parser/parser/excel'
export const templateFormat = {}

export default class DefaultParser extends BaseExcelParser {
  async import(base64String: string) {
    const response = super.import(base64String)
    console.log(response)
    return response
  }
}
