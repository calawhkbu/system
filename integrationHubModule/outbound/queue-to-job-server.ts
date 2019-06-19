const CONSTANTS = {
}

export default {
  method: 'POST', // 'GET'|'POST'|'PUT'|'DELETE'|'HEAD'|'OPTIONS'
  getUrl: (headers: any, body: any) => {
    return `${headers.url}queue/tracking`
  },
  requestHandler: (headers: any, body: any) => {
    return {
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  },
  responseHandler: (response: { responseBody: any, responseOptions: any }) => {
    return response
  }
}
