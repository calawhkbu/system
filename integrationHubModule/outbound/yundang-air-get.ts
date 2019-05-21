const CONSTANTS = {
  secret: '1be5222c-728c-4368-9813-8d9a7de94b1e',
  companyId: 3132,
  lstbookingcontract: [
    { keyid: '000', mobile: '12345678901', passid: 'Y', dlptid: 'Y' }
  ]
};

const sha1 = require('sha1')
const moment = require('moment');

export default {
  method: 'POST', // GET / POST-JSON / POST-SIMPLE
  getUrl: () => {
    return `http://apis.yundangnet.com/api/v1/airbooking-liner?companyid=${CONSTANTS.companyId}`
  },
  requestHandler: (
    headers: any,
    body: { carrierCode: string, masterNo: string }
  ) => {
    const data = [{ keyid: '000', carriercd: body.carrierCode, awbno: body.masterNo.replace('-', ''), lstbookingcontract: CONSTANTS.lstbookingcontract }]
    const timestamp = moment().utcOffset(8).format('YYYY-MM-DD HH:mm:ss');
    const hashIt = sha1([`companyid=${CONSTANTS.companyId}`, `data=${JSON.stringify(data)}&timestamp=${timestamp}`, CONSTANTS.secret].join('||'), { asBytes: true })
    return {
      headers: {
        "content-type": "application/x-www-form-urlencoded"
      },
      formData: {
        data: JSON.stringify(data),
        timestamp,
        hash: (headers.Buffer.from(hashIt)).toString('base64')
      }
    }
  },
  responseHandler: (response: { responseBody: any, responseOptions: any }) => {
    let { responseBody } = response
    responseBody = (JSON.parse(responseBody))[0]
    return {
      ...response,
      responseBody
    }
  }
}
