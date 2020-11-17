import { JqlDefinition } from 'modules/report/interface'
import _ = require('lodash')

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceQuery: ['shipment', 'job']
    },
    {
      type: 'postProcess',
      postProcess(params, result: any[]): any[] {
        const intermediate = _.groupBy(result, row => row.officePartyCode)
        return Object.keys(intermediate).sort((l, r) => l.localeCompare(r)).map(officePartyCode => {
          const row: any = { __id: officePartyCode, __value: officePartyCode }
          row.__rows = intermediate[officePartyCode]
          return row
        })
      }
    }
  ]
} as JqlDefinition
