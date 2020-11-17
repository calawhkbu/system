import { ERROR } from 'utils/error'

export default {
  constants: {
    getPostProcessFunc: null as Function,
    partyGroup: null as any,
    subqueries: null as any,
    card: null as any,
    user: null as any,
    zyh: 0,
  },
  method: 'GET',
  getUrl: async({ id, partyGroup: { api } }: any, params: any, constants: any, helper: { [key: string]: Function }): Promise<string> => {
    if (!api.erp || !api.erp.url) throw ERROR.ERP_NOT_SETUP()
    if (!params.subqueries || !params.subqueries.type) throw ERROR.MISSING_EXTERNAL_CARD_TYPE()
    const { type, enableFiltering, ...subqueries } = params.subqueries
    if (enableFiltering) constants.subqueries = subqueries
    const card = constants.card = await helper.getCard({
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      url: `${api.erp.url}/getschrptdata`,
      data: {
        zyh: constants.zyh = id,
        zyd: params.subqueries.type.value,
      },
    })
    console.debug(card.dlink, 'erp-card-data:system')
    return card.dlink
  },
  requestHandler: ({ getPostProcessFunc, partyGroup, user }: any, params: any, constants: any): any => {
    constants.getPostProcessFunc = getPostProcessFunc
    constants.partyGroup = partyGroup
    constants.user = user
    return {
      headers: {
        'content-type': 'application/json',
      },
    }
  },
  responseHandler: async(
    response: { responseBody: any; responseOptions: any },
    { card, getPostProcessFunc, partyGroup, subqueries, user, zyh }: any,
    helper: { [key: string]: Function }
  ) => {
    let responseBody = helper.parseData(response.responseBody, card, subqueries)

    const postProcessFunc = await getPostProcessFunc(partyGroup.code, `erp-card-data/${zyh}`)
    responseBody = postProcessFunc(responseBody, card, user)

    return { ...response, responseBody }
  },
}
