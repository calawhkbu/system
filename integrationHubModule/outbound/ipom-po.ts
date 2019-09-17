
export default {
  method: 'POST', // 'GET'|'POST'|'PUT'|'DELETE'|'HEAD'|'OPTIONS'
  getUrl: (headers: any, body: any) => {
    return 'http://ecxipomapi_uat.swivelsoftware.com/ipomapi.asmx'
  },
  requestHandler: (headers: any, body: any) => {
    return {
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        pojson: body
      }
    }
  },
  responseHandler: (response: { responseBody: any; responseOptions: any }) => {
    return response
  },
}
