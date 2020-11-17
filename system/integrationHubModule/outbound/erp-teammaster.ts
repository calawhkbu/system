import _ = require('lodash')
import { ERROR } from 'utils/error'

const app = {
  constants: {
    distinct: false,
    siteNames: [] as string[],
  },
  method: 'POST',
  getUrl: ({ api }: { api: any }) => {
    if (!api.erp || (!api.erp.url2 && !api.erp.url)) throw ERROR.ERP_NOT_SETUP()
    return `${api.erp.url2 || api.erp.url}/teammaster`
  },
  requestHandler: async(
    { query = {}, roles, roleService, partyGroup, party, partyService }: any,
    body: any,
    constants: { [key: string]: any },
    helper: { [key: string]: Function }
  ) => {
    // xsite
    constants.siteNames = helper.getOfficeNames('erp-site', party)
    const sites = helper.getOfficeParties('erp-site', party)
    const xsite = sites

    constants.distinct = (query.subqueries || {})['distinct-team'] || false

    return {
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        xsite: xsite.join(','),
      }),
    }
  },
  responseHandler: (response: { responseBody: any; responseOptions: any }, { distinct, siteNames }: any) => {
    // parse results
    const responseBody = JSON.parse(JSON.parse(response.responseBody).d)

    let result: any[] = responseBody.map(r => ({
      officePartyCode: siteNames[r.station],
      team: r.tcode,
      description: r.tdesc
    }))

    if (distinct) {
      result = _.uniqBy(result.map(({ team }) => ({ team })), r => r.team)
    }

    /* {
      officePartyCode: string,
      team: string,
      description: number
    } */

    return { ...response, responseBody: result }
  }
}

export default app