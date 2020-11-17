import { ERROR } from 'utils/error'

const app = {
  constants: {
    getPostProcessFunc: null as Function,
    partyGroup: null as any,
    subqueries: null as any,
    card: null as any,
    user: null as any,
    zyh: 0,
  },
  method: 'POST',
  getUrl: async({ id, partyGroup: { api } }: any, params: any, constants: { [key: string]: any }, helper: { [key: string]: Function }): Promise<string> => {
    if (!api.wmsrpt || !api.wmsrpt.url) throw ERROR.WMS_NOT_SETUP()
    const { type, enableFiltering, ...subqueries } = params.subqueries
    if (enableFiltering) constants.subqueries = subqueries
    const card = constants.card = await helper.getCard({
      method: 'POST',
      url: `${api.wmsrpt.url}/getschrptdata?id=` + id,
      data: {
        ...(api.wmsrpt.body || {}),
      },
    }, response => response.data)
    return card.dlink
  },
  requestHandler: ({ getPostProcessFunc, partyGroup, user }: any, params: any, constants: any): any => {
    constants.getPostProcessFunc = getPostProcessFunc
    constants.partyGroup = partyGroup
    constants.user = user
    const result = {} as any
    if (partyGroup.api.wmsrpt.body) result.body = JSON.stringify(partyGroup.api.wmsrpt.body)
    return result
  },
  responseHandler: async(
    response: { responseBody: any; responseOptions: any },
    { card, getPostProcessFunc, partyGroup, subqueries, user, zyh }: { [key: string]: any },
    helper: { [key: string]: Function }
  ) => {
    let responseBody = helper.parseData(response.responseBody, card, subqueries)

    const postProcessFunc = await getPostProcessFunc(partyGroup.code, `wmsrpt-card-data/${zyh}`)
    responseBody = postProcessFunc(responseBody, card, user)

    return { ...response, responseBody }
  },
}

export default app
