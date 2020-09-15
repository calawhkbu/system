export default {

  constants: {
    // DEMO KEY
    url: 'https://ecxdillardsapi.swivelsoftware.asia/po360.ashx',

  },

  method: 'POST', // 'GET'|'POST'|'PUT'|'DELETE'|'HEAD'|'OPTIONS'
  getUrl: (headers: any, body: any, constants: {[key: string]: any}) => {
    return constants.url
  },
  requestHandler: (headers: any, body: any) => {
    const { errors, ...rest } = body.pojson
    console.log({ pojson: rest }, 'SEND EDI')
    return {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pojson: rest }),
    }
  },
  responseHandler: (response: { responseBody: any; responseOptions: any }) => {
    // for (const { error } of JSON.parse(response.responseBody)) {
    //   if (error) {
    //     throw new Error(error)
    //   }
    // }
    return response
  },
}
