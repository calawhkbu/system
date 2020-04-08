import { NotImplementedException, BadRequestException } from '@nestjs/common'

const app = {
  variable: {
    getPostProcessFunc: null as Function,
    partyGroup: null as any,
    card: null as any,
    user: null as any,
    zyh: 0,
  },
  method: 'GET',
  getUrl: async({ id, partyGroup: { api } }: any, params: any, constants: { [key: string]: any }, helper: { [key: string]: Function }): Promise<string> => {
    if (!api.wms || !api.wms.url) throw new NotImplementedException('wms_NOT_LINKED')
    if (!params.subqueries || !params.subqueries.type) throw new BadRequestException('MISSING_TYPE')
    const card = app.variable.card = await helper.getCard({
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      url: `${api.wms.url}/getschrptdata`,
      data: {
        zyh: app.variable.zyh = id,
        zyd: params.subqueries.type.value,
        ...(api.wms.body || {}),
      },
    })
    return card.dlink
  },
  requestHandler: ({ getPostProcessFunc, partyGroup, user }: any): any => {
    app.variable.getPostProcessFunc = getPostProcessFunc
    app.variable.partyGroup = partyGroup
    app.variable.user = user
    const result = {
      headers: {
        'content-type': 'application/json',
      },
    } as any
    if (partyGroup.api.wms.body) result.body = JSON.stringify(partyGroup.api.wms.body)
    return result
  },
  responseHandler: async(
    response: { responseBody: any; responseOptions: any },
    constants: { [key: string]: any },
    helper: { [key: string]: Function }
  ) => {
    const { card, getPostProcessFunc, partyGroup, user, zyh } = app.variable

    let responseBody = helper.parseData(response.responseBody, card)

    const postProcessFunc = await getPostProcessFunc(partyGroup.code, `wms-card-data/${zyh}`)
    responseBody = postProcessFunc(responseBody, card, user)

    return { ...response, responseBody }
  },
}

export default app
