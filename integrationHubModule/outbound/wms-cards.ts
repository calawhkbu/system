import { NotImplementedException } from '@nestjs/common'

export default {
  method: 'POST',
  getUrl: ({ api }: { api: any }) => {
    if (!api.wms || !api.wms.url) throw new NotImplementedException()
    return `${api.wms.url}/getschrptlist`
  },
  requestHandler: ({ api }: { api: any }) => {
    const result = {
      headers: {
        'content-type': 'application/json',
      },
    } as any
    if (api.wms.body) result.body = JSON.stringify(api.wms.body)
    return result
  },
  responseHandler: (response: { responseBody: any; responseOptions: any }, helper: { [key: string]: Function }) => {
    // parse results
    let responseBody = JSON.parse(JSON.parse(response.responseBody).d) as any[]

    // reformat
    responseBody = helper.parseCards(responseBody, 'wms', 'Swivel WMS')

    return { ...response, responseBody }
  },
}
