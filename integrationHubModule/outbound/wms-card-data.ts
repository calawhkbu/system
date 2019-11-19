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
  getUrl: async({ id, partyGroup: { api } }: any, params: any): Promise<string> => {
    if (!api.wms || !api.wms.url) throw new NotImplementedException('wms_NOT_LINKED')
    if (!params.subqueries || !params.subqueries.type) throw new BadRequestException('MISSING_TYPE')
    const axiosResponse = await axios.request({
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      url: `${api.wms.url}/getschrptdata`,
      data: {
        zyh: app.constants.zyh = id,
        zyd: params.subqueries.type.value,
        ...(api.wms.body || {}),
      },
    })
    const responseBody = JSON.parse(axiosResponse.data.d) as any[]
    if (!responseBody.length) throw new NotFoundException('REPORT_NOT_READY')
    const card = (app.constants.card = responseBody[0])
    return card.dlink
  },
  requestHandler: ({ getPostProcessFunc, partyGroup, user }: any): any => {
    app.constants.getPostProcessFunc = getPostProcessFunc
    app.constants.partyGroup = partyGroup
    app.constants.user = user
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
    helper: { [key: string]: Function }
  ) => {
    const { card, getPostProcessFunc, partyGroup, user, zyh } = app.constants

    // reformat
    let responseBody = JSON.parse((response.responseBody.trim() || '[]').replace(/[\n\r]/g, ''))

    // grouping
    const layout = JSON.parse(card.layout) as any[]
    const groupBy = layout.filter(header => header.grp).map(header => header.ffield as string)
    if (groupBy.length > 0) responseBody = helper.groupRows(responseBody, groupBy)

    const postProcessFunc = await getPostProcessFunc(partyGroup.code, `wms-card-data/${zyh}`)
    responseBody = postProcessFunc(responseBody, card, user)

    return { ...response, responseBody }
  },
}

export default app
