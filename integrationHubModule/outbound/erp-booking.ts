const CONSTANTS = {}

export default {
  method: 'POST', // 'GET'|'POST'|'PUT'|'DELETE'|'HEAD'|'OPTIONS'

  getUrl: (headers: any, body: any) => {
    throw new Error('Please define the erp link in Customer folder')
    // return `http://demoerpapp.swivelsoftware.com/swivelapi.asmx?op=booking_360api`
  },
  requestHandler: (headers: any, body: any) => {
    return {
      headers: {
        ...headers,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ bokjson: JSON.stringify(body['latestEntity']) })
    }
  },
  responseHandler: (response: { responseBody: any; responseOptions: any }) => {
    return response
  },
}
