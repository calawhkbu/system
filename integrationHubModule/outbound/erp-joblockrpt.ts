import { BadRequestException, NotImplementedException } from '@nestjs/common'
import moment = require('moment')

const app = {
  variable: {
    sites: [] as string[],
    departments: [] as string[],
  },
  method: 'POST',
  getUrl: ({ api }: { api: any }) => {
    if (!api.erp || !api.erp.url) throw new NotImplementedException()
    return `${api.erp.url}/joblockrpt`
  },
  requestHandler: async(
    { query, roles, roleService, partyGroup, party, partyService }: any,
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

    const subqueries = query.subqueries || {}
    console.log(subqueries, 'erp-joblockrpt')

    // datefr && dateto
    if (!subqueries.date) throw new BadRequestException('MISSING_DATE_RANGE')
    const datefr = moment(subqueries.date.from, 'YYYY-MM-DD')
    const dateto = moment(subqueries.date.to, 'YYYY-MM-DD')
    if (dateto.diff(datefr, 'years', true) > 1)
      throw new BadRequestException('DATE_RANGE_TOO_LARGE')

    // xsite
    const sites = helper.getOfficeParties('erp-site', party, subqueries.officePartyId)
    if (!sites.length) throw new BadRequestException('MISSING_SITE')
    if (sites.length > 1) throw new BadRequestException('TOO_MANY_SITES')
    const xsite = (app.variable.sites = sites)

    // xdivision (for later use)
    app.variable.departments = helper.getDivisions(roleFilters, ['AE', 'AI', 'SE', 'SI', 'LOG'])

    return {
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        datefr: datefr.format('YYYY/MM/DD'),
        dateto: dateto.format('YYYY/MM/DD'),
        xsite: xsite.join(','),
      }),
    }
  },
  responseHandler: (response: { responseBody: any; responseOptions: any }) => {
    // parse results
    const responseBody = JSON.parse(JSON.parse(response.responseBody).d)

    // rename fields
    for (const row of responseBody) {
      switch (row.type) {
        case 'Sea Export':
          row.departmentCode = 'SE'
          break
        case 'Air Export':
          row.departmentCode = 'AE'
          break
        case 'Sea Import':
          row.departmentCode = 'SI'
          break
        case 'Air Import':
          row.departmentCode = 'AI'
          break
        case 'Logistics':
          row.departmentCode = 'LOG'
          break
        default:
          row.departmentCode = null
          break
      }
      delete row.type
      row.officePartyCode = row.station
      delete row.station
    }

    // filter unauthorized rows
    const { sites, departments } = app.variable
    const result = [] as any[]
    for (const site of sites) {
      for (const department of departments) {
        let row = responseBody.find(
          ({ officePartyCode, departmentCode }) =>
            officePartyCode === site && departmentCode === department
        )
        if (!row)
          row = {
            autolock: 0,
            manuallock: 0,
            unlocked: 0,
            total: 0,
            departmentCode: department,
            officePartyCode: site,
          }
        result.push(row)
      }
    }

    /* {
      officePartyCode: string,
      departmentCode: string,
      autolock: number,
      manuallock: number,
      unlocked: number,
      total: number
    } */

    return { ...response, responseBody: result }
  },
}

export default app
