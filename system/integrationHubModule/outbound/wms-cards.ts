import { ERROR } from 'utils/error'

export default {
  method: 'POST',
  getUrl: ({ api }: { api: any }) => {
    if (!api.wms || !api.wms.url) throw ERROR.WMS_NOT_SETUP()
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
  responseHandler: (response: { responseBody: any; responseOptions: any }, constants: { [key: string]: any }, helper: { [key: string]: Function }) => {
    // parse results
    let responseBody = JSON.parse(JSON.parse(response.responseBody).d) as any[]

    // reformat
    responseBody = helper.parseCards(responseBody, 'wms', 'Swivel WMS')

    return { ...response, responseBody }
  },
}
