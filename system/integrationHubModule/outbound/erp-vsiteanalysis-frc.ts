import vsiteanalysis from './erp-vsiteanalysis'
import moment = require('moment')

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

    return {
      headers: result.headers,
      body: JSON.stringify({
        ...body,
        grpcarrier: 1,
        grpfreehand: 1
      })
    }
  },
  responseHandler: (response: { responseBody: any; responseOptions: any }, { boundTypes, months, site }: any) => {
    // parse results
    let responseBody = JSON.parse(JSON.parse(response.responseBody).d)

    const carriers: string[] = []

    // regroup results
    responseBody = responseBody.reduce((result, row) => {
      if (row.carrier.trim()) {
        const jobMonth = moment(row.yymm, 'YYYYMM').format('YYYY-MM')
        let resultRow = result.find(r => r.officePartyCode === row.xsite && r.carrierName === row.carrier && r.jobMonth === jobMonth)
        let totalRow = result.find(r => r.officePartyCode === row.xsite && r.carrierName === row.carrier && r.jobMonth === 'total')
        if (!resultRow)
          result.push((resultRow = { officePartyCode: row.xsite, carrierName: row.carrier, currency: row.currency, jobMonth }))
        if (!totalRow)
          result.push((totalRow = { officePartyCode: row.xsite, carrierName: row.carrier, currency: row.currency, jobMonth: 'total' }))

        if (carriers.indexOf(row.carrier) === -1) carriers.push(row.carrier)

        const nominatedTypeCode = row.freehand

        resultRow[`${nominatedTypeCode}_grossProfit`] =
          (resultRow[`${nominatedTypeCode}_grossProfit`] || 0) +
          boundTypes.reduce(
            (result, type) => result + (row[`${type.toLocaleLowerCase()}profit`] || 0),
            0
          )
        resultRow[`${nominatedTypeCode}_profitShareIncome`] =
          (resultRow[`${nominatedTypeCode}_profitShareIncome`] || 0) +
          boundTypes.reduce(
            (result, type) => result + (row[`${type.toLocaleLowerCase()}ps_income`] || 0),
            0
          )
        resultRow[`${nominatedTypeCode}_profitShareCost`] =
          (resultRow[`${nominatedTypeCode}_profitShareCost`] || 0) +
          boundTypes.reduce(
            (result, type) => result + (row[`${type.toLocaleLowerCase()}ps_cost`] || 0),
            0
          )
        resultRow[`${nominatedTypeCode}_profitShare`] =
          (resultRow[`${nominatedTypeCode}_profitShare`] || 0) +
          boundTypes.reduce((result, type) => result + (row[`${type.toLocaleLowerCase()}ps`] || 0), 0)
        resultRow[`${nominatedTypeCode}_otherProfit`] =
          (resultRow[`${nominatedTypeCode}_otherProfit`] || 0) +
          boundTypes.reduce(
            (result, type) => result + (row[`${type.toLocaleLowerCase()}othprofit`] || 0),
            0
          )
        resultRow[`${nominatedTypeCode}_revenue`] =
          (resultRow[`${nominatedTypeCode}_revenue`] || 0) +
          boundTypes.reduce(
            (result, type) => result + (row[`${type.toLocaleLowerCase()}sales`] || 0),
            0
          )

        totalRow[`${nominatedTypeCode}_grossProfit`] =
          (totalRow[`${nominatedTypeCode}_grossProfit`] || 0) +
          boundTypes.reduce(
            (result, type) => result + (row[`${type.toLocaleLowerCase()}profit`] || 0),
            0
          )
        totalRow[`${nominatedTypeCode}_profitShareIncome`] =
          (totalRow[`${nominatedTypeCode}_profitShareIncome`] || 0) +
          boundTypes.reduce(
            (result, type) => result + (row[`${type.toLocaleLowerCase()}ps_income`] || 0),
            0
          )
        totalRow[`${nominatedTypeCode}_profitShareCost`] =
          (totalRow[`${nominatedTypeCode}_profitShareCost`] || 0) +
          boundTypes.reduce(
            (result, type) => result + (row[`${type.toLocaleLowerCase()}ps_cost`] || 0),
            0
          )
        totalRow[`${nominatedTypeCode}_profitShare`] =
          (totalRow[`${nominatedTypeCode}_profitShare`] || 0) +
          boundTypes.reduce((result, type) => result + (row[`${type.toLocaleLowerCase()}ps`] || 0), 0)
        totalRow[`${nominatedTypeCode}_otherProfit`] =
          (totalRow[`${nominatedTypeCode}_otherProfit`] || 0) +
          boundTypes.reduce(
            (result, type) => result + (row[`${type.toLocaleLowerCase()}othprofit`] || 0),
            0
          )
        totalRow[`${nominatedTypeCode}_revenue`] =
          (totalRow[`${nominatedTypeCode}_revenue`] || 0) +
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
      if (l.carrierName !== r.carrierName)
        return l.carrierName.localeCompare(r.carrierName)
      return l.jobMonth.localeCompare(r.jobMonth)
    })

    let result = [] as any[]
    const anyRow = responseBody.find(r => r.officePartyCode === site)
    const currency = anyRow ? anyRow.currency : null
    for (const carrier of carriers) {
      const row: any = { officePartyCode: site, carrierName: carrier, currency }
      const rows = responseBody.filter(r => r.officePartyCode === site && r.carrierName === carrier)

      for (const month of [...months, 'total']) {
        const r = rows.find(r => r.jobMonth === month)
        const monthName = month === 'total' ? month : moment(month, 'YYYY-MM').format('MMMM')
        for (const nominatedTypeCode of ['F', 'R', 'C']) {
          for (const field of ['grossProfit', 'profitShareIncome', 'profitShareCode', 'profitShare', 'otherProfit', 'revenue']) {
            row[`${monthName}_${nominatedTypeCode}_${field}`] = (r && r[`${nominatedTypeCode}_${field}`]) || 0
          }
        }
      }

      result.push(row)
    }

    result = result.sort((l, r) => {
      const l_grossProfit = (l.total_F_grossProfit || 0) + (l.total_R_grossProfit || 0) + (l.total_C_grossProfit || 0)
      const r_grossProfit = (r.total_F_grossProfit || 0) + (r.total_R_grossProfit || 0) + (r.total_C_grossProfit || 0)
      return l_grossProfit < r_grossProfit ? 1 : l_grossProfit > r_grossProfit ? -1 : 0
    })

    /* {
      officePartyCode: string,
      carrierName: string,
      currency: string,

      // by month, by frc
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
