const CONSTANTS = {}

export default {
  method: 'POST', // 'GET'|'POST'|'PUT'|'DELETE'|'HEAD'|'OPTIONS'

  getUrl: (headers: any, body: any) => {
    return `http://demoerpapp.swivelsoftware.com/swivelapi.asmx?op=booking_360api`
  },
  requestHandler: (headers: any, body: any) => {
    return {
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ bokjson: body }),
      json: true,
    }
  },
  responseHandler: (response: { responseBody: any; responseOptions: any }) => {
    return response
  },
}
