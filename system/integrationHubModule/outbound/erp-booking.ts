export default {
  method: 'POST',
  getUrl: () => {
    throw new Error('Please define the erp link in Customer folder')
  },
  requestHandler: (headers: any, body: any) => {
    return {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bokjson: JSON.stringify(body['latestEntity'])
      })
    }
  },
  responseHandler: (response: { responseBody: any; responseOptions: any }) => {
    return response
  },
}
