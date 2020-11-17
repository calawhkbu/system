import vsiteanalysis from './erp-vsiteanalysis'
import moment = require('moment')
import { ERROR } from 'utils/error'

const app = {
  consumeError: true,
  constants: {
    months: [] as string[],
    site: '' as string,
    boundTypes: [] as string[],
  },
  method: vsiteanalysis.method,
  getUrl: vsiteanalysis.getUrl,
  requestHandler: async(
    params: any,
    body: any,
    constants: { [key: string]: any },
    helper: { [key: string]: Function }
  ) => {
    const result = await vsiteanalysis.requestHandler(params, body, constants, helper)
    body = JSON.parse(result.body)
    if (!body.xmodule) throw ERROR.MISSING_MODULE_TYPE()

    return {
      headers: result.headers,
      body: JSON.stringify({
        ...body,
        grpagent: 1
      })
    }
  },
  responseHandler: (response: { responseBody: any; responseOptions: any }, { boundTypes, months, site }: any) => {
    // parse results
    let responseBody = JSON.parse(JSON.parse(response.responseBody).d)

    const agents: string[] = []
    let result: any[] = []

    // regroup results
    responseBody = responseBody.reduce((result, row) => {
      if (row.agent.trim()) {
        const jobMonth = moment(row.yymm, 'YYYYMM').format('YYYY-MM')
        let resultRow = result.find(r => r.officePartyCode === row.xsite && r.agentCode === row.agent && r.jobMonth === jobMonth)
        let totalRow = result.find(r => r.officePartyCode === row.xsite && r.agentCode === row.agent && r.jobMonth === 'total')
        if (!resultRow)
          result.push((resultRow = { officePartyCode: row.xsite, agentCode: row.agent, currency: row.currency, moduleTypeCode: row.module, jobMonth }))
        if (!totalRow)
          result.push((totalRow = { officePartyCode: row.xsite, agentCode: row.agent, currency: row.currency, moduleTypeCode: row.module, jobMonth: 'total' }))

        if (agents.indexOf(row.agent) === -1) agents.push(row.agent)

        resultRow.grossProfit =
          (resultRow.grossProfit || 0) +
          boundTypes.reduce(
            (result, type) => result + (row[`${type.toLocaleLowerCase()}profit`] || 0),
            0
          )
        resultRow.profitShareIncome =
          (resultRow.profitShareIncome || 0) +
          boundTypes.reduce(
            (result, type) => result + (row[`${type.toLocaleLowerCase()}ps_income`] || 0),
            0
          )
        resultRow.profitShareCost =
          (resultRow.profitShareCost || 0) +
          boundTypes.reduce(
            (result, type) => result + (row[`${type.toLocaleLowerCase()}ps_cost`] || 0),
            0
          )
        resultRow.profitShare =
          (resultRow.profitShare || 0) +
          boundTypes.reduce(
            (result, type) => result + (row[`${type.toLocaleLowerCase()}ps`] || 0),
            0
          )
        resultRow.otherProfit =
          (resultRow.otherProfit || 0) +
          boundTypes.reduce(
            (result, type) => result + (row[`${type.toLocaleLowerCase()}othprofit`] || 0),
            0
          )
        resultRow.revenue =
          (resultRow.revenue || 0) +
          boundTypes.reduce(
            (result, type) => result + (row[`${type.toLocaleLowerCase()}sales`] || 0),
            0
          )
        totalRow.grossProfit =
          (totalRow.grossProfit || 0) +
          boundTypes.reduce(
            (result, type) => result + (row[`${type.toLocaleLowerCase()}profit`] || 0),
            0
          )
        totalRow.profitShareIncome =
          (totalRow.profitShareIncome || 0) +
          boundTypes.reduce(
            (result, type) => result + (row[`${type.toLocaleLowerCase()}ps_income`] || 0),
            0
          )
        totalRow.profitShareCost =
          (totalRow.profitShareCost || 0) +
          boundTypes.reduce(
            (result, type) => result + (row[`${type.toLocaleLowerCase()}ps_cost`] || 0),
            0
          )
        totalRow.profitShare =
          (totalRow.profitShare || 0) +
          boundTypes.reduce(
            (result, type) => result + (row[`${type.toLocaleLowerCase()}ps`] || 0),
            0
          )
        totalRow.otherProfit =
          (totalRow.otherProfit || 0) +
          boundTypes.reduce(
            (result, type) => result + (row[`${type.toLocaleLowerCase()}othprofit`] || 0),
            0
          )
        totalRow.revenue =
          (totalRow.revenue || 0) +
          boundTypes.reduce(
            (result, type) => result + (row[`${type.toLocaleLowerCase()}sales`] || 0),
            0
          )
      }

      return result
    }, [])

    responseBody.sort((l, r) => {
      if (l.officePartyCode !== r.officePartyCode)
        return l.officePartyCode.localeCompare(r.officePartyCode)
      if (l.agentCode !== r.agentCode)
        return l.agentCode.localeCompare(r.agentCode)
      return l.jobMonth.localeCompare(r.jobMonth)
    })

    const anyRow = responseBody.find(r => r.officePartyCode === site)
    const currency = anyRow ? anyRow.currency : null
    for (const agent of agents) {
      const row: any = { officePartyCode: site, agentCode: agent, currency }
      const rows = responseBody.filter(r => r.officePartyCode === site && r.agentCode === agent)

      for (const month of [...months, 'total']) {
        const r = rows.find(r => r.jobMonth === month)
        const monthName = month === 'total' ? month : moment(month, 'YYYY-MM').format('MMMM')
        for (const field of ['grossProfit', 'profitShareIncome', 'profitShareCode', 'profitShare', 'otherProfit', 'revenue']) {
          row[`${monthName}_${field}`] = (r && r[field]) || 0
        }
      }

      result.push(row)
    }

    result = result.sort((l, r) => {
      const l_grossProfit = (l.total_grossProfit || 0) + (l.total_grossProfit || 0) + (l.total_grossProfit || 0)
      const r_grossProfit = (r.total_grossProfit || 0) + (r.total_grossProfit || 0) + (r.total_grossProfit || 0)
      return l_grossProfit < r_grossProfit ? 1 : l_grossProfit > r_grossProfit ? -1 : 0
    })

    /* {
      officePartyCode: string,
      agentCode: string,
      currency: string,

      // by month
      grossProfit: number,
      profitShareIncome: number,
      profitShareCost: number,
      profitShare: number,
      otherProfit: number,
      revenue: number,
    } */

    return { ...response, responseBody: result }
  },
}

export default app
