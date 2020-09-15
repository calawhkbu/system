import { NotImplementedException } from '@nestjs/common'

export default {
  method: 'POST',
  getUrl: ({ api }: { api: any }) => {
    if (!api.wmsrpt || !api.wmsrpt.url) throw new NotImplementedException()
    return `${api.wmsrpt.url}/getschrptlist`
  },
  requestHandler: ({ api }: { api: any }) => {
    const result = {} as any
    if (api.wmsrpt.body) result.body = JSON.stringify(api.wmsrpt.body)
    return result
  },
  responseHandler: (response: { responseBody: any; responseOptions: any }, constants: { [key: string]: any }, helper: { [key: string]: Function }) => {
    // parse results
    let responseBody = JSON.parse(response.responseBody) as any[]

    // reformat
    responseBody = helper.parseCards(responseBody, 'wmsrpt', 'Swivel WMS')

    return { ...response, responseBody }
  },
}
