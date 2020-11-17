import { ERROR } from 'utils/error'

const app = {
  constants: {
    getPostProcessFunc: null as Function,
    partyGroup: null as any,
    url: '',
    zyh: 0,
    zyd: 0,
  },
  method: 'POST',
  getUrl: ({ id, partyGroup: { api } }: any, params: any, constants: any) => {
    if (!api.wmsrpt || !api.wmsrpt.url) throw ERROR.WMS_NOT_SETUP()
    constants.url = `${api.wmsrpt.url}/getschrptlist`
    return `${api.wmsrpt.url}/getschrptdata?id=` + id
  },
  requestHandler: ({ id, getPostProcessFunc, partyGroup }: any, params: any, constants: any) => {
    constants.partyGroup = partyGroup
    constants.getPostProcessFunc = getPostProcessFunc
    constants.zyh = constants.zyd = id
    return {
      body: JSON.stringify({
        ...(partyGroup.api.wmsrpt.body || {}),
      }),
    }
  },
  responseHandler: async(
    response: { responseBody: any; responseOptions: any },
    { getPostProcessFunc, partyGroup, url, zyh, zyd }: { [key: string]: any },
    helper: { [key: string]: Function }
  ) => {
    // parse results
    const responseBody = JSON.parse(response.responseBody)

    let card = await helper.prepareCard(responseBody, 'wmsrpt', 'Swivel WMS', zyh, zyd, {
      method: 'POST',
      url,
      data: {
        ...(partyGroup.api.wmsrpt.body || {}),
      },
    }, response => response.data)

    const postProcessFunc = await getPostProcessFunc(partyGroup.code, `wmsrpt-card/${zyh}`)
    card = postProcessFunc(card)

    return { ...response, responseBody: card }
  },
}

export default app
