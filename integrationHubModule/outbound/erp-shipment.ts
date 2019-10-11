import { NotImplementedException } from '@nestjs/common'

export default {
  method: 'POST', // 'GET'|'POST'|'PUT'|'DELETE'|'HEAD'|'OPTIONS'
  getUrl: ({ api }: { api: any }) => {
    if (!api.erp || !api.erp.url) throw new NotImplementedException()
    return `${api.erp.url}/getshipdetail`
  },
  requestHandler: ({ query, roles, party }: { query: any; roles: any[]; party: any[] }) => {
    // TODO
  },
  responseHandler: (response: { responseBody: any; responseOptions: any }) => {
    // TODO
  },
}
