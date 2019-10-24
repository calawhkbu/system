import { BadRequestException, ForbiddenException, NotImplementedException } from '@nestjs/common'
import moment = require('moment')

const app = {
  constants: {
    months: [] as string[],
    site: '' as string,
    boundTypes: [] as string[],
  },
  method: 'POST',
  getUrl: ({ api }: { api: any }) => {
    if (!api.erp || !api.erp.url) throw new NotImplementedException()
    return `${api.erp.url}/vsiteanalysis`
  },
  requestHandler: async(
    { query, roleService, roles, partyGroup, partyService, party }: any,
    body: any,
    helper: { [key: string]: Function }
  ) => {
    // resolve role filters
    roles = await helper.resolveRoles(roleService, partyGroup, roles)
    const roleFilters = roles
      .map(({ filter }) => filter.shipment && filter.shipment.outbound)
      .filter(f => f)

    // resolve parties
    party = await helper.resolveParties(partyService, partyGroup, party)
    if (!party.length) throw new ForbiddenException('NO_ACCESS_RIGHT')

    const subqueries = query.subqueries || {}

    // datefr && dateto
    if (!subqueries.date) throw new BadRequestException('MISSING_DATE_RANGE')
    const datefr = moment(subqueries.date.from, 'YYYY-MM-DD')
    const dateto = moment(subqueries.date.to, 'YYYY-MM-DD')
    if (dateto.diff(datefr, 'years', true) > 1)
      throw new BadRequestException('DATE_RANGE_TOO_LARGE')

    const months = (app.constants.months = [])
    const momentStart = moment(datefr).startOf('month')
    while (momentStart.isSameOrBefore(dateto)) {
      months.push(momentStart.format('YYYY-MM'))
      momentStart.add(1, 'month')
    }

    // xmodule
    const availableModuleTypes = helper.getModuleTypes(roleFilters)
    let xmodule: string
    if (availableModuleTypes.length === 0) {
      throw new ForbiddenException('NO_ACCESS_RIGHT')
    } else if (subqueries.moduleTypeCode) {
      xmodule = availableModuleTypes.find(type => type === subqueries.moduleTypeCode.value)
      if (!xmodule) throw new BadRequestException('INVALID_MODULE_TYPE')
    } else if (availableModuleTypes.length === 1) {
      xmodule = availableModuleTypes[0]
    } else {
      xmodule = ''
    }

    // xbound
    const availableBoundTypes = helper.getBoundType(roleFilters)
    let xbound: string[]
    if (availableBoundTypes.length === 0) {
      throw new ForbiddenException('NO_ACCESS_RIGHT')
    } else if (subqueries.boundTypeCode) {
      xbound = availableBoundTypes.filter(type => type === subqueries.boundTypeCode.value)
      if (!xbound) throw new BadRequestException('INVALID_BOUND_TYPE')
    } else {
      xbound = availableBoundTypes
    }
    app.constants.boundTypes = xbound

    // xsite
    const sites = helper.getOfficeParties('erp', party, subqueries.officePartyId)
    if (!sites.length) throw new BadRequestException('MISSING_SITE')
    if (sites.length > 1) throw new BadRequestException('TOO_MANY_SITES')
    const xsite = (app.constants.site = sites[0])

    // xdivision
    const availableDivisions = helper.getDivisions(roleFilters)
    const xdivision = subqueries.division
      ? availableDivisions.find(division => division === subqueries.division.value)
      : availableDivisions.find(division => division === 'Total')
    if (!xdivision) throw new BadRequestException('MISSING_DIVISION')

    // xsalesman
    let xsalesman = ''
    if (subqueries.salesmanCode) xsalesman = subqueries.salesmanCode.value

    // xfreehand
    let xfreehand = ''
    if (subqueries.nominatedTypeCode)
      xfreehand = Array.isArray(subqueries.nominatedTypeCode.value)
        ? subqueries.nominatedTypeCode.value[0]
        : subqueries.nominatedTypeCode.value

    // xicltype && xigntype
    const xCustomer = {
      xicltype: '',
      xigntype: '',
    }

    if (subqueries.isColoader)
    {
      // filter isColoader cannot be used together with includeCustomer OR excludeCustomer
      if (subqueries.includeCustomer || subqueries.excludeCustomer)
        throw new BadRequestException('ISCOLOADER_INCLUDE_EXCLUDE_CUSTOMER_CANNOT_EXIST_BOTH')

      if (subqueries.isColoader.value)
      {
        xCustomer.xicltype = 'F'
      }
      else{

        xCustomer.xigntype = 'F'
      }

    }

    if (subqueries.includeCustomer && subqueries.excludeCustomer)
      throw new BadRequestException('INCLUDE_EXCLUDE_CUSTOMER_EITHER_ONE')

    if (subqueries.includeCustomer)
      xCustomer.xicltype = (Array.isArray(subqueries.includeCustomer.value)
        ? subqueries.includeCustomer.value
        : [subqueries.includeCustomer.value]
      ).join('')

    if (subqueries.excludeCustomer)
      xCustomer.xigntype = (Array.isArray(subqueries.excludeCustomer.value)
        ? subqueries.excludeCustomer.value
        : [subqueries.excludeCustomer.value]
      ).join('')

    // xgrpname
    let xgrpname = ''
    if (subqueries.agentGroup) xgrpname = subqueries.agentGroup.value

    return {
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        datefr: datefr.format('YYYY/MM/DD'),
        dateto: dateto.format('YYYY/MM/DD'),
        curr: '',
        xmodule,
        xbound: xbound.join(''),
        xsite,
        xdivision: helper.getDivision(xdivision),
        xsalesman,
        xfreehand,
        ...xCustomer,
        xgrpname,
      }),
    }
  },
  responseHandler: (response: { responseBody: any; responseOptions: any }) => {
    // parse results
    let responseBody = JSON.parse(JSON.parse(response.responseBody).d)

    const { boundTypes, site, months } = app.constants

    // regroup results
    responseBody = responseBody.reduce((result, row) => {
      const jobMonth = moment(row.yymm, 'YYYYMM').format('YYYY-MM')
      let resultRow = result.find(r => r.officePartyCode === row.xsite && r.jobMonth === jobMonth)
      if (!resultRow)
        result.push((resultRow = { officePartyCode: row.xsite, currency: row.currency, jobMonth }))

      resultRow.revenue =
        (resultRow.revenue || 0) +
        boundTypes.reduce(
          (result, type) => result + (row[`${type.toLocaleLowerCase()}sales`] || 0),
          0
        )
      resultRow.cost =
        (resultRow.cost || 0) +
        boundTypes.reduce(
          (result, type) => result + (row[`${type.toLocaleLowerCase()}cost`] || 0),
          0
        )
      resultRow.grossProfit =
        (resultRow.grossProfit || 0) +
        boundTypes.reduce(
          (result, type) => result + (row[`${type.toLocaleLowerCase()}profit`] || 0),
          0
        )

      return result
    }, [])

    responseBody.sort((l, r) => {
      if (l.officePartyCode !== r.officePartyCode)
        return l.officePartyCode.localeCompare(r.officePartyCode)
      return l.jobMonth.localeCompare(r.jobMonth)
    })

    const result = [] as any[]
    const anyRow = responseBody.find(r => r.officePartyCode === site)
    const currency = anyRow ? anyRow.currency : 'HKD'
    for (const month of months) {
      let row = responseBody.find(r => r.officePartyCode === site && r.jobMonth === month)
      if (!row)
        row = {
          officePartyCode: site,
          currency,
          jobMonth: month,
          revenue: 0,
          cost: 0,
          grossProfit: 0,
        }
      result.push(row)
    }

    /* {
      officePartyCode: string,
      currency: string,
      jobMonth: string,
      revenue: number,
      cost: number,
      grossProfit: number
    } */

    return { ...response, responseBody: result }
  },
}

export default app
