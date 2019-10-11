import { NotImplementedException, NotFoundException, BadRequestException } from '@nestjs/common'
import moment = require('moment')
import axios from 'axios'

const app = {
  constants: {
    url: '' as string,
    zyh: 0 as number,
    zyd: 0 as number,
  },
  method: 'POST',
  getUrl: ({ api }: { api: any }) => {
    if (!api.erp || !api.erp.url) throw new NotImplementedException()
    app.constants.url = `${api.erp.url}/getschrptlist`
    return `${api.erp.url}/getschrptdata`
  },
  requestHandler: ({ id, params }: { id: number; params: any }) => {
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

    const { url, zyh, zyd } = app.constants

    // get card base info
    const axiosResponse = await axios.request({
      method: 'POST',
      url,
      headers: { 'content-type': 'application/json' },
    })
    const cards = JSON.parse(axiosResponse.data.d) as any[]
    const baseCard = cards.filter(c => c.zyh === zyh)
    const currentCard = baseCard.filter(c => c.zyd === zyd)
    if (!currentCard.length) throw new NotFoundException()

    // filter list items
    let items: any[] | null = null
    if (baseCard.length > 1)
      items = baseCard.map(({ zyd, title }) => ({ label: title, value: zyd }))

    // reformat
    const row = responseBody[0]
    row.layout = JSON.parse(row.layout)
    const card = {
      id: zyh,
      reportingKey: 'dashboard',
      api: 'erp',
      category: 'Swivel ERP',
      name: baseCard[0].title,
      description: `Generated at ${moment(row.rptdate).format('DD/MM/YYYY hh:mm:ssa')}`,
      component: {
        is: 'TableCard',
        props: {
          url: `card/external/data/erp/${zyh}`,
          filters: items ? [{ name: 'type', props: { items }, type: 'list' }] : undefined,
          headers: row.layout
            .filter(({ dtype }) => dtype !== 'H')
            .map(({ ffield, label, width, dtype, dplace, grp }) => {
              const result = { key: ffield, label } as any
              if (width > 0) result.width = width * 8
              if (dtype === 'N') {
                result.align = 'right'
                result.format = helper.getNumberFormat(dplace)
                result.subTotal = grp
              }
              return result
            }),
          footer: row.layout.reduce((result, { grp }) => result || grp, false)
            ? 'SubTotalRow'
            : undefined,
        },
      } as any,
    }

    return { ...response, responseBody: card }
  },
}

export default app
