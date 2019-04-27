export default {
  method: '', // GET / POST-JSON / POST-SIMPLE
  getUrl: (headers: any, body: any) => {
    return ''
  },
  headersHandler: (headers: any) => {
    return headers
  },
  bodyHandler: (body: any) => {
    return body
  },
  responseHandler: (response: any) => {
    return response
  }
}
