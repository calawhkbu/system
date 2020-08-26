import { BadRequestException, ForbiddenException, NotImplementedException } from '@nestjs/common'
import moment = require('moment')

const app = {
  consumeError: true,
  constants: {
  },
  method: 'POST',
  getUrl: ({ api }: { api: any }) => {

    console.log(`getUrl`)
    return `http://localhost:8080/api/shipment/query/shipment`
  },
  requestHandler: async(
    { query, roles, roleService, partyGroup, party, partyService, user }: any,
    body: any,
    constants: { [key: string]: any },
    helper: { [key: string]: Function }
  ) => {

    console.log(`requestHandler start`)
    console.log(query)


    // todo : get the correct token
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoicGVyc29uIiwiZCI6MSwidSI6IjM2MEBzd2l2ZWxzb2Z0d2FyZS5jb20iLCJwIjpbeyJpIjoxLCJjIjoiREVWIiwiZiI6IlN3aXZlbCBTb2Z0d2FyZSAoMzYwIEFkbWluKSIsInQiOm51bGwsInAiOlsxNzYwMTMsMTc2MDE0LDE3NjAxNSwxNzYwMTYsMTc2MDE3LDE3NjAxOCwxNzYwMTksMTc2MDIwLDE3NjAyMSwxNzYwMjNdLCJyIjpbMSw1LDYsNywxNCwxNSwxOSwyMSwyMiwyMywyNF19XSwiaWF0IjoxNTk0MzUwNTcwLCJleHAiOjE2MjU5MDgxNzAsImlzcyI6IlN3aXZlbCBTb2Z0d2FyZSBMaW1pdGVkIiwic3ViIjoiU3dpdmVsIDM2MCBKV1QifQ.EtbBg7-wFlLDeRKguSDMbGVktxqjmqCULGLsShzQL00'

    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify(query),
    }
  },
  responseHandler: (response: { responseBody: any; responseOptions: any }, { boundTypes, months, site }: any) => {

    console.log(`responseHandler start`)
  

    const resultList = JSON.parse(response.responseBody)
    console.log(resultList)

    return { ...response, responseBody: resultList }
  }
}

export default app
