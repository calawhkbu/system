import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common'

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
    if (!api.erp || (!api.erp.url2 && !api.erp.url)) throw new NotImplementedException()
    return `${api.erp.url2 || api.erp.url}/getshipdetail`
  },
  requestHandler: async(
    { party, partyGroup, partyService }: any,
    body: any,
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
    if (!houseNo) throw new BadRequestException('MISSING_HOUSE_NO')
    requestBody.xHouseNo = app.constants.houseNo = houseNo

    return {
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  },
  responseHandler: (response: { responseBody: any; responseOptions: any }) => {
    // parse results
    let responseBody: any
    try {
      responseBody = JSON.parse(JSON.parse(response.responseBody).d)[0]
    } catch (e) {
      console.error(e, e.stack, 'erp-shipment')
      throw new NotFoundException(`SHIPMENT_${app.constants.houseNo.toLocaleUpperCase()}_NOT_FOUND`)
    }

    // rename
    const { fieldNameMap } = app.constants
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
