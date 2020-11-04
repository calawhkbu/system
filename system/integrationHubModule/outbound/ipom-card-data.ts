import { NotImplementedException, BadRequestException } from '@nestjs/common'

const app = {
  constants: {
    getPostProcessFunc: null as Function,
    partyGroup: null as any,
    subqueries: null as any,
    card: null as any,
    user: null as any,
    zyh: 0,
  },
  method: 'GET',
  getUrl: async({ id, partyGroup: { api } }: any, params: any, constants: { [key: string]: any }, helper: { [key: string]: Function }): Promise<string> => {
    if (!api.ipom || !api.ipom.url) throw new NotImplementedException('ipom_NOT_LINKED')
    if (!params.subqueries || !params.subqueries.type) throw new BadRequestException('MISSING_TYPE')
    const { type, enableFiltering, ...subqueries } = params.subqueries
    if (enableFiltering) constants.subqueries = subqueries
    const card = constants.card = await helper.getCard({
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      url: `${api.ipom.url}/getschrptdata`,
      data: {
        zyh: constants.zyh = id,
        zyd: params.subqueries.type.value,
        ...(api.ipom.body || {}),
      },
    })
    return card.dlink
  },
  requestHandler: ({ getPostProcessFunc, partyGroup, user }: any, params: any, constants: any): any => {
    constants.getPostProcessFunc = getPostProcessFunc
    constants.partyGroup = partyGroup
    constants.user = user
    const result = {
      headers: {
        'content-type': 'application/json',
      },
    } as any
    if (partyGroup.api.ipom.body) result.body = JSON.stringify(partyGroup.api.ipom.body)
    return result
  },
  responseHandler: async(
    response: { responseBody: any; responseOptions: any },
    { card, getPostProcessFunc, partyGroup, subqueries, user, zyh }: { [key: string]: any },
    helper: { [key: string]: Function }
  ) => {
    let responseBody = helper.parseData(response.responseBody, card, subqueries)

    const postProcessFunc = await getPostProcessFunc(partyGroup.code, `ipom-card-data/${zyh}`)
    responseBody = postProcessFunc(responseBody, card, user)

    return { ...response, responseBody }
  },
}

export default app
