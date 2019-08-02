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
      body: {
        ...body,
        data: {
          partyGroupCode: body.data.partyGroupCode,
          trackingType: body.data.trackingType,
          carrierCode: body.data.carrierCode,
          carrierCode2: body.data.carrierCode2,
          masterNo: body.data.masterNo,
          soNo: body.data.soNo,
          containerNo: body.data.containerNo,
          departureDateEstimated: body.data.departureDateEstimated,
          mode: body.data.mode
        }
      },
      json: true
    }
  },
  responseHandler: (response: { responseBody: any, responseOptions: any }) => {
    return response
  }
}
