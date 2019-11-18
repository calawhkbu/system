import { NotImplementedException, NotFoundException, BadRequestException } from '@nestjs/common'
import moment = require('moment')
import axios from 'axios'

const app = {
  constants: {
    getPostProcessFunc: null as Function,
    partyGroup: null as any,
    url: '',
    zyh: 0,
    zyd: 0,
  },
  method: 'POST',
  getUrl: ({ partyGroup: { api } }: any) => {
    if (!api.wms || !api.wms.url) throw new NotImplementedException()
    app.constants.url = `${api.wms.url}/getschrptlist`
    return `${api.wms.url}/getschrptdata`
  },
  requestHandler: ({ api, id, getPostProcessFunc, partyGroup }: any, params: any) => {
    app.constants.partyGroup = partyGroup
    app.constants.getPostProcessFunc = getPostProcessFunc
    if (!params.subqueries || !params.subqueries.type) throw new BadRequestException()
    return {
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        zyh: app.constants.zyh = id,
        zyd: app.constants.zyd = params.subqueries.type.value,
        ...(api.wms.body || {}),
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

    const { getPostProcessFunc, partyGroup, url, zyh, zyd } = app.constants

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
    let card = {
      id: zyh,
      reportingKey: 'dashboard',
      api: 'wms',
      category: 'Swivel WMS',
      name: baseCard[0].title,
      description: `Generated at ${moment(row.rptdate).format('DD/MM/YYYY hh:mm:ssa')}`,
      component: {
        is: 'TableCard',
        props: {
          url: `card/external/data/wms/${zyh}`,
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
          isExternalCard: true,
          skipReportFilters: true,
        },
      } as any,
    }

    const postProcessFunc = await getPostProcessFunc(partyGroup.code, `wms-card/${zyh}`)
    card = postProcessFunc(card)

    return { ...response, responseBody: card }
  },
}

export default app
