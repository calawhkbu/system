import moment = require('moment')
import { ERROR } from 'utils/error'

const app = {
  constants: {
    sites: [] as string[],
    siteNames: [] as string[],
    departments: [] as string[],
  },
  method: 'POST',
  getUrl: ({ api }: { api: any }) => {
    if (!api.erp || !api.erp.url) throw ERROR.ERP_NOT_SETUP()
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

    // datefr && dateto
    if (!subqueries.date) throw ERROR.MISSING_DATE()
    const datefr = moment(subqueries.date.from, 'YYYY-MM-DD')
    const dateto = moment(subqueries.date.to, 'YYYY-MM-DD')
    if (dateto.diff(datefr, 'years', true) > 1) throw ERROR.DATE_RANGE_TOO_LARGE()

    // xsite
    if (!subqueries.officePartyId) throw ERROR.MISSING_INITIAL_OFFICE()
    constants.siteNames = helper.getOfficeNames('erp-site', party, subqueries.officePartyId)
    const sites = helper.getOfficeParties('erp-site', party, subqueries.officePartyId)
    if (sites.length > 1) throw ERROR.INITIAL_OFFICE_TOO_MANY()
    const xsite = (constants.sites = sites)

    // xdivision (for later use)
    constants.departments = helper.getDivisions(roleFilters, ['AE', 'AI', 'SE', 'SI', 'LOG'])

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
  responseHandler: (response: { responseBody: any; responseOptions: any }, { sites, siteNames, departments }: any) => {
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
        row.officePartyCode = siteNames[row.officePartyCode]
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
