const app = {
  constants: {},
  method: 'GET', // 'GET'|'POST'|'PUT'|'DELETE'|'HEAD'|'OPTIONS'
  getUrl: (headers: any, body: any, constants: { [key: string]: any }) => {
    return `${constants.url}/api/bill/search/${body['no']}`
  },
  requestHandler: (headers: any, body: any, constants: { [key: string]: any }) => ({
    headers: {
      'x-no-redis': true,
      'authorization': `Bearer ${constants.authorizationToken}`,
      'x-refresh-token': `${constants.refreshToken}`,
    },
  }),
  responseHandler: (response: { responseBody: any; responseOptions: any }) => {
    return response
  }
}

export default app
