import { ERROR } from 'utils/error'

const app = {
  constants: {
    fieldNameMap: {
      billCargos: 'billCargo',
      billTransports: 'billTransport',
    },
    houseNo: '',
  },
  method: 'POST', // 'GET'|'POST'|'PUT'|'DELETE'|'HEAD'|'OPTIONS'
  getUrl: ({ api }: { api: any }) => {
    if (!api.erp || (!api.erp.url2 && !api.erp.url)) throw ERROR.ERP_NOT_SETUP()
    return `${api.erp.url2 || api.erp.url}/getshipdetail`
  },
  requestHandler: async(
    { party, partyGroup, partyService }: any,
    body: any,
    constants: { [key: string]: any },
    helper: { [key: string]: Function }
  ) => {
    const [site, moduleTypeCode, houseNo] = body['options'].split('+')

    // resolve parties
    party = await helper.resolveParties(partyService, partyGroup, party)

    const requestBody = {} as any

    // xBranch
    // if (!party.find(p => p.thirdPartyCode && p.thirdPartyCode.erp === site)) throw new ForbiddenException('NO_ACCESS_RIGHT')
    requestBody.xBranch = site

    // xModule
    requestBody.xModule = moduleTypeCode

    // xHouseNo
    if (!houseNo) throw ERROR.MISSING_HOUSE_NO()
    requestBody.xHouseNo = constants.houseNo = houseNo

    return {
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  },
  responseHandler: (response: { responseBody: any; responseOptions: any }, { houseNo, fieldNameMap }: any) => {
    // parse results
    let responseBody: any
    try {
      responseBody = JSON.parse(JSON.parse(response.responseBody).d)[0]
    } catch (e) {
      console.error(e, e.stack, 'erp-shipment')
      throw ERROR.SHIPMENT_NOT_FOUND()
    }

    // rename
    for (const key of Object.keys(fieldNameMap)) {
      const value = responseBody[fieldNameMap[key]]
      delete responseBody[fieldNameMap[key]]
      responseBody[key] = value
    }

    return {
      responseBody,
      responseOptions: response.responseOptions,
    }
  },
}

export default app
