import { NotImplementedException, NotFoundException, BadRequestException } from '@nestjs/common'
import axios from 'axios'

const app = {
  constants: {
    getPostProcessFunc: null as Function,
    partyGroup: null as any,
    card: null as any,
    user: null as any,
    zyh: 0,
  },
  method: 'GET',
  getUrl: async({ id, partyGroup: { api } }: any, params: any, helper: { [key: string]: Function }): Promise<string> => {
    if (!api.erp || !api.erp.url) throw new NotImplementedException('ERP_NOT_LINKED')
    if (!params.subqueries || !params.subqueries.type) throw new BadRequestException('MISSING_TYPE')
    const card = app.constants.card = await helper.getCard({
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      url: `${api.erp.url}/getschrptdata`,
      data: {
        zyh: app.constants.zyh = id,
        zyd: params.subqueries.type.value,
      },
    })
    return card.dlink
  },
  requestHandler: ({ getPostProcessFunc, partyGroup, user }: any): any => {
    app.constants.getPostProcessFunc = getPostProcessFunc
    app.constants.partyGroup = partyGroup
    app.constants.user = user
    return {
      headers: {
        'content-type': 'application/json',
      },
    }
  },
  responseHandler: async(
    response: { responseBody: any; responseOptions: any },
    helper: { [key: string]: Function }
  ) => {
    const { card, getPostProcessFunc, partyGroup, user, zyh } = app.constants

    let responseBody = helper.parseData(response.responseBody, card)

    const postProcessFunc = await getPostProcessFunc(partyGroup.code, `erp-card-data/${zyh}`)
    responseBody = postProcessFunc(responseBody, card, user)

    return { ...response, responseBody }
  },
}

export default app
