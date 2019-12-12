export default {
  method: 'POST', // 'GET'|'POST'|'PUT'|'DELETE'|'HEAD'|'OPTIONS'
  getUrl: (headers: any, body: any) => {
    return 'https://ecxdillardsapi.swivelsoftware.asia/po360.ashx'
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
    return response
  },
}
