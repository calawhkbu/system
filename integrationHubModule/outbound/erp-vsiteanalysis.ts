import { BadRequestException, ForbiddenException, NotImplementedException } from '@nestjs/common'
import moment = require('moment')

const app = {
  consumeError: true,
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
    { query, roles, roleService, partyGroup, party, partyService, user }: any,
    body: any,
    constants: { [key: string]: any },
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

    const months = (constants.months = [])
    const momentStart = moment(datefr).startOf('month')
    while (momentStart.isSameOrBefore(dateto)) {
      months.push(momentStart.format('YYYY-MM'))
      momentStart.add(1, 'month')
    }

    // xmodule
    const availableModuleTypes = helper.getModuleTypes(roleFilters)
    let xmodule: string
    if (availableModuleTypes.length === 0 && subqueries.moduleTypeCode) {
      throw new ForbiddenException('NO_ACCESS_RIGHT')
    } else if (subqueries.moduleTypeCode) {
      // warning : getting the first one only
      xmodule = availableModuleTypes.find(type => type === subqueries.moduleTypeCode.value[0])

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
      // warning : getting the first one only
      xbound = availableBoundTypes.filter(type => type === subqueries.boundTypeCode.value[0])

      if (!xbound) throw new BadRequestException('INVALID_BOUND_TYPE')
    } else {
      xbound = availableBoundTypes
    }
    constants.boundTypes = xbound

    // xsite
    const sites = helper.getOfficeParties('erp-site', party, subqueries.officePartyId)
    if (!sites.length) throw new BadRequestException('MISSING_SITE')
    if (!subqueries.viaHKG && sites.length > 1) throw new BadRequestException('TOO_MANY_SITES')
    let xsite = (constants.site = sites[0])

    // via HKG => xsite = 'HKG'
    if (subqueries.viaHKG) {
      if (helper.findParty('erp-site', party, 'HKG')) {
        xsite = (constants.site = 'HKG')
      }
      else {
        throw new BadRequestException('NO_ACCESS_RIGHT')
      }
    }

    // xdivision
    const availableDivisions = helper.getDivisions(roleFilters)

    // warning : getting the first one only
    const xdivision = subqueries.division
      ? availableDivisions.find(division => subqueries.division.value.indexOf(division) > -1)
      : 'Total'

    // xsalesman
    let xsalesman = ''
    if (user.thirdPartyCode && user.thirdPartyCode.erp) xsalesman = user.thirdPartyCode.erp
    else if (subqueries.salesmanCode) xsalesman = subqueries.salesmanCode.value
    else if (subqueries.rSalesmanCode) xsalesman = subqueries.rSalesmanCode.value

    // xfreehand
    // warning : getting the first one only
    let xfreehand = ''
    if (subqueries.nominatedTypeCode) xfreehand = subqueries.nominatedTypeCode.value[0]

    // xicltype && xigntype
    const xCustomer = {
      xicltype: '',
      xigntype: '',
    }

    if (subqueries.isColoader) {
      // filter isColoader cannot be used together with controllingCustomerIncludeRole OR controllingCustomerExcludeRole
      if (subqueries.controllingCustomerIncludeRole || subqueries.controllingCustomerExcludeRole)
        throw new BadRequestException('ISCOLOADER_INCLUDE_EXCLUDE_CUSTOMER_EITHER_ONE')

      if (subqueries.isColoader.value) {
        xCustomer.xicltype = 'F'
      } else {
        xCustomer.xigntype = 'F'
      }
    }

    if (subqueries.controllingCustomerIncludeRole && subqueries.controllingCustomerExcludeRole)
      throw new BadRequestException('INCLUDE_EXCLUDE_CUSTOMER_EITHER_ONE')
    if (subqueries.controllingCustomerIncludeRole) {
      const values = subqueries.controllingCustomerIncludeRole.value.map(v => helper.getRole(v))
      xCustomer.xicltype = values.join('')
    }
    else if (subqueries.controllingCustomerExcludeRole) {
      const values = subqueries.controllingCustomerExcludeRole.value.map(v => helper.getRole(v))
      xCustomer.xigntype = values.join('')
    }

    // xgrpname
    // warning : getting the first one only
    let xgrpname = ''
    if (subqueries.agentGroup && subqueries.agentGroup.length) xgrpname = JSON.stringify(subqueries.agentGroup.value)

    // inblno && exblno
    const xHouseNo = {
      inblno: '',
      exblno: '',
    }
    if (subqueries.houseNoLike && subqueries.houseNoNotLike)
      throw new BadRequestException('LIKE_NOTLIKE_HOUSENO_EITHER_ONE')
    if (subqueries.houseNoLike) xHouseNo.inblno = subqueries.houseNoLike.value
    if (subqueries.houseNoNotLike) xHouseNo.exblno = subqueries.houseNoNotLike.value

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
        ...xHouseNo,
        grpcarrier: 0,
        grpfreehand: 0,
      }),
    }
  },
  responseHandler: (response: { responseBody: any; responseOptions: any }, { boundTypes, months, site }: any) => {
    // parse results
    let responseBody = JSON.parse(JSON.parse(response.responseBody).d)

    // regroup results
    responseBody = responseBody.reduce((result, row) => {
      const jobMonth = moment(row.yymm, 'YYYYMM').format('YYYY-MM')
      let resultRow = result.find(r => r.officePartyCode === row.xsite && r.jobMonth === jobMonth)
      if (!resultRow)
        result.push((resultRow = { officePartyCode: row.xsite, currency: row.currency, jobMonth }))

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
        boundTypes.reduce((result, type) => result + (row[`${type.toLocaleLowerCase()}ps`] || 0), 0)
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
          grossProfit: 0,
          profitShareIncome: 0,
          profitShareCost: 0,
          profitShare: 0,
          otherProfit: 0,
          revenue: 0,
        }
      row.gpPercent = row.revenue ? row.grossProfit / row.revenue : NaN
      result.push(row)
    }

    /* {
      officePartyCode: string,
      currency: string,
      jobMonth: string,
      grossProfit: number,
      profitShareIncome: number,
      profitShareCost: number,
      profitShare: number,
      otherProfit: number,
      revenue: number,
      gpPercent: number,
    } */

    return { ...response, responseBody: result }
  },
}

export default app
