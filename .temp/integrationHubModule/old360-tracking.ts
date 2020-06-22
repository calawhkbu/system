const app = {
  constants: {
    // DEMO KEY
    url: 'http://localhost:8081',
    // url: 'http://192.168.3.133:8081',
    // url: 'https://360demo-api.swivelsoftware.asia',
    authorizationToken:
     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDMsInVzZXJuYW1lIjoiZGVidWdAZGVidWcuY29tIiwiaWF0IjoxNTY5Mzc3NjA4LCJleHAiOjE1NjkzNzc5MDh9.0R-G76TNIXi_4tkmvogMBhfO9DF5FRp3iHJsxaPX4m0',
    refreshToken:
     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDMsInVzZXJuYW1lIjoiZGVidWdAZGVidWcuY29tIiwiaWF0IjoxNTY5Mzc3NjA4fQ.234fxezQv-254GS1auNlRMiCPiTA7OspAPycUAZjgV0',

  },
  method: 'GET', // 'GET'|'POST'|'PUT'|'DELETE'|'HEAD'|'OPTIONS'
  getUrl: (headers: any, body: any, constants: {[key: string]: any}) => {
    return `${constants.url}/api/billTracking/mbl/${encodeURIComponent(
      body['masterNo']
    )}`
  },
  requestHandler: (headers: any, body: any, constants: {[key: string]: any}) => ({
    headers: {
      'x-no-redis': true,
      'authorization': `Bearer ${constants.authorizationToken}`,
      'x-refresh-token': `${constants.refreshToken}`,
    },
  }),
  responseHandler: (
     { responseBody, responseOptions }: { responseBody: any; responseOptions: any }
  ) => {
    const body = []
    try {
      const { data } = JSON.parse(responseBody)
      if (data && data.lastStatusDetails) {
        const { history = [], billCargoTracking = [], billContainerTracking = [] } = data.lastStatusDetails
        const tracking = {
          ...data,
          source: 'YUNDANG',
          details: {
            raw: data.lastStatusDetails
          },
          trackingStatus: history,
          trackingContainers: billContainerTracking,
          trackingCargos: billCargoTracking
        }
        body.push(tracking)
      }
    } catch (e) {

    }
    return { responseBody: body, responseOptions}
  },
}

export default app
