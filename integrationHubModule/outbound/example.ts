const CONSTANTS = {
}

export default {
  method: '', // 'GET'|'POST'|'PUT'|'DELETE'|'HEAD'|'OPTIONS'
  getUrl: (headers: any, body: any) => {
    return ''
  },
  requestHandler: (headers: any, body: any) => {
    return { headers, body }
  },
  responseHandler: (response: { responseBody: any, responseOptions: any }) => {
    return response
  }
}
