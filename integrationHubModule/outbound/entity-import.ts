const CONSTANTS = {
}

export default {
  method: 'POST', // 'GET'|'POST'|'PUT'|'DELETE'|'HEAD'|'OPTIONS'
  getUrl: (headers: any, body: any) => {
    return `${headers.url}document/entity/import`
  },
  requestHandler: (headers: any, body: any) => {
    return {
      headers: {
        'content-type': 'application/json'
      },
      body: {
        ...body
      },
      json: true
    }
  },
  responseHandler: (response: { responseBody: any, responseOptions: any }) => {
    return response
  }
}
