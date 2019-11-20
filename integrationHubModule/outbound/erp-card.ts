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
  getUrl: ({ partyGroup: { api } }: any) => {
    if (!api.erp || !api.erp.url) throw new NotImplementedException()
    app.constants.url = `${api.erp.url}/getschrptlist`
    return `${api.erp.url}/getschrptdata`
  },
  requestHandler: ({ id, getPostProcessFunc, partyGroup }: any, params: any) => {
    app.constants.partyGroup = partyGroup
    app.constants.getPostProcessFunc = getPostProcessFunc
    if (!params.subqueries || !params.subqueries.type) throw new BadRequestException()
    return {
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        zyh: app.constants.zyh = id,
        zyd: app.constants.zyd = params.subqueries.type.value,
      }),
    }
  },
  responseHandler: async(
    response: { responseBody: any; responseOptions: any },
    helper: { [key: string]: Function }
  ) => {
    // parse results
    const responseBody = JSON.parse(JSON.parse(response.responseBody).d) as any[]
    if (!responseBody.length) throw new NotFoundException('REPORT_NOT_READY')

    const { getPostProcessFunc, partyGroup, url, zyh, zyd } = app.constants

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
