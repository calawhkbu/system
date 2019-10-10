import { NotImplementedException, NotFoundException, BadRequestException } from '@nestjs/common'
import axios from 'axios'

const app = {
  constants: {
    card: null as any,
  },
  method: 'GET',
  getUrl: async({
    id,
    params,
    api,
  }: {
    id: number
    params: any
    api: any
    user: any
  }): Promise<string> => {
    if (!api.erp || !api.erp.url) throw new NotImplementedException('ERP_NOT_LINKED')
    if (!params.subqueries || !params.subqueries.type) throw new BadRequestException('MISSING_TYPE')
    const axiosResponse = await axios.request({
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      url: `${api.erp.url}/getschrptdata`,
      data: {
        zyh: id,
        zyd: params.subqueries.type.value,
      },
    })
    const responseBody = JSON.parse(axiosResponse.data.d) as any[]
    if (!responseBody.length) throw new NotFoundException('REPORT_NOT_READY')
    const card = (app.constants.card = responseBody[0])
    return card.dlink
  },
  requestHandler: (): any => {
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
    const { card } = app.constants

    // reformat
    let responseBody = JSON.parse((response.responseBody.trim() || '[]').replace(/[\n\r]/g, ''))

    // grouping
    const layout = JSON.parse(card.layout) as any[]
    const groupBy = layout.filter(header => header.grp).map(header => header.ffield as string)
    if (groupBy.length > 0) responseBody = helper.groupRows(responseBody, groupBy)

    return { ...response, responseBody }
  },
}

export default app
