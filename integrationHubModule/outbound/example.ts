const CONSTANTS = {}

export default {
  method: '', // 'GET'|'POST'|'PUT'|'DELETE'|'HEAD'|'OPTIONS'
  getUrl: (headers: any, body: any,constants: { [key: string]: any }) => {
    return ''
  },
  requestHandler: (headers: any, body: any,constants: { [key: string]: any }) => {
    return { headers, body }
  },
  responseHandler: (response: { responseBody: any; responseOptions: any },constants: { [key: string]: any }) => {
    return response
  },
}
