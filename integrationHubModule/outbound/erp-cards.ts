import { NotImplementedException } from '@nestjs/common'

export default {
  method: 'POST',
  getUrl: ({ api }: { api: any }) => {
    if (!api.erp || !api.erp.url) throw new NotImplementedException()
    return `${api.erp.url}/getschrptlist`
  },
  requestHandler: () => {
    return {
      headers: {
        'content-type': 'application/json',
      },
    }
  },
  responseHandler: (response: { responseBody: any; responseOptions: any }, constants: { [key: string]: any }, helper: { [key: string]: Function }) => {
    // parse results
    let responseBody = JSON.parse(JSON.parse(response.responseBody).d) as any[]

    // reformat
    responseBody = helper.parseCards(responseBody, 'erp', 'Swivel ERP')

    return { ...response, responseBody }
  },
}
