import { NotImplementedException, NotFoundException, BadRequestException } from '@nestjs/common'

const app = {
  constants: {
    getPostProcessFunc: null as Function,
    partyGroup: null as any,
    url: '',
    zyh: 0,
    zyd: 0,
  },
  method: 'POST',
  getUrl: ({ partyGroup: { api } }: any, params: any, constants: any) => {
    if (!api.erp || !api.erp.url) throw new NotImplementedException()
    constants.url = `${api.erp.url}/getschrptlist`
    return `${api.erp.url}/getschrptdata`
  },
  requestHandler: ({ id, getPostProcessFunc, partyGroup }: any, params: any, constants: any) => {
    constants.partyGroup = partyGroup
    constants.getPostProcessFunc = getPostProcessFunc
    if (!params.subqueries || !params.subqueries.type) throw new BadRequestException()
    console.log('zyh = ' + id + ', zyd = ' + params.subqueries.type.value, 'erp-card:system')
    return {
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        zyh: constants.zyh = id,
        zyd: constants.zyd = params.subqueries.type.value,
      }),
    }
  },
  responseHandler: async(
    response: { responseBody: any; responseOptions: any },
    constants: { [key: string]: any },
    helper: { [key: string]: Function }
  ) => {
    // parse results
    const responseBody = JSON.parse(JSON.parse(response.responseBody).d) as any[]
    if (!responseBody.length) throw new NotFoundException('REPORT_NOT_READY')

    const { getPostProcessFunc, partyGroup, url, zyh, zyd } = constants

    let card = await helper.prepareCard(responseBody[0], 'erp', 'Swivel ERP', zyh, zyd, {
      method: 'POST',
      url,
      headers: { 'content-type': 'application/json' },
    })

    const postProcessFunc = await getPostProcessFunc(partyGroup.code, `erp-card/${zyh}`)
    card = postProcessFunc(card)

    return { ...response, responseBody: card }
  },
}

export default app
