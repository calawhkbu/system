import { ERROR } from "utils/error"

export default {
  method: 'POST',
  getUrl: () => {
    throw ERROR.CRM_NOT_SETUP()
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
