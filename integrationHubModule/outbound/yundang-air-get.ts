const sha1 = require('sha1')
const moment = require('moment')

export default {
  method: 'POST', // GET / POST-JSON / POST-SIMPLE
  getUrl: (
    headers: { Buffer: any, constants: any },
    body: { carrierCode: string, carrierCode2: string, masterNo: string }
  ) => {
    return `http://apis.yundangnet.com/api/v1/airbooking-liner?companyid=${headers.constants.companyId}`
  },
  requestHandler: (
    headers: { Buffer: any, constants: any },
    body: { carrierCode: string, carrierCode2: string, masterNo: string }
  ) => {
    if (!headers.Buffer) {
      throw new Error('Pleace post buffer')
    }
    const data = [
      {
        keyid: '000',
        carriercd: body.carrierCode,
        ...(body.carrierCode2 ? { carriercd: body.carrierCode2 } : {}),
        awbno: body.masterNo.replace('-', ''),
        lstbookingcontract: headers.constants.lstbookingcontract
      }
    ]
    const timestamp = moment().utcOffset(8).format('YYYY-MM-DD HH:mm:ss')
    const hashIt = sha1([`companyid=${headers.constants.companyId}`, `data=${JSON.stringify(data)}&timestamp=${timestamp}`, headers.constants.secret].join('||'), { asBytes: true })
    return {
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      formData: {
        data: JSON.stringify(data),
        timestamp,
        hash: (headers.Buffer.from(hashIt)).toString('base64')
      }
    }
  },
  responseHandler: (response: { responseBody: any, responseOptions: any }) => {
    return {
      ...response,
      responseBody: JSON.parse(response.responseBody)
    }
  }
}
