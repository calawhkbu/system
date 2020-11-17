import { NotImplementedException } from '@nestjs/common'
import { ERROR } from 'utils/error'

export default {
  method: 'POST',
  getUrl: ({ api }: { api: any }) => {
    if (!api.ipom || !api.ipom.url) throw ERROR.POM_NOT_SETUP()
    return `${api.ipom.url}/getschrptlist`
  },
  requestHandler: ({ api }: { api: any }) => {
    const result = {
      headers: {
        'content-type': 'application/json',
      },
    } as any
    if (api.ipom.body) result.body = JSON.stringify(api.ipom.body)
    return result
  },
  responseHandler: (response: { responseBody: any; responseOptions: any }, constants: { [key: string]: any }, helper: { [key: string]: Function }) => {
    // parse results
    let responseBody = JSON.parse(JSON.parse(response.responseBody).d) as any[]

    // reformat
    responseBody = helper.parseCards(responseBody, 'ipom', 'Swivel POM')

    return { ...response, responseBody }
  },
}
