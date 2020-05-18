import { NotImplementedException, NotFoundException, BadRequestException } from '@nestjs/common'
import axios from 'axios'

export default {
  constants: {
    getPostProcessFunc: null as Function,
    partyGroup: null as any,
    card: null as any,
    user: null as any,
    zyh: 0,
  },
  method: 'GET',
  getUrl: async({ id, partyGroup: { api } }: any, params: any, constants: any, helper: { [key: string]: Function }): Promise<string> => {
    if (!api.erp || !api.erp.url) throw new NotImplementedException('ERP_NOT_LINKED')
    if (!params.subqueries || !params.subqueries.type) throw new BadRequestException('MISSING_TYPE')
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
    console.log(card.dlink, 'erp-card-data:system')
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
    { card, getPostProcessFunc, partyGroup, user, zyh }: any,
    helper: { [key: string]: Function }
  ) => {
    let responseBody = helper.parseData(response.responseBody, card)

    const postProcessFunc = await getPostProcessFunc(partyGroup.code, `erp-card-data/${zyh}`)
    responseBody = postProcessFunc(responseBody, card, user)

    return { ...response, responseBody }
  },
}
