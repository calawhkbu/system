export default {
  method: 'POST', // 'GET'|'POST'|'PUT'|'DELETE'|'HEAD'|'OPTIONS'
  getUrl: (headers: any, body: any) => {

    // hardcode the url in here
    return 'https://eu1-gateway.invenio.qwyk.io/jwt/api-token-auth'
  },
  requestHandler: (headers: any, body: {username: string, password: string}) => {
    return { headers, body }
  },
  responseHandler: (response: { responseBody: any, responseOptions: any }) => {
    return response
  }
}
