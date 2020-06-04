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

/* import {
  Query,
  FromTable,
  ResultColumn,
  FunctionExpression,
  ColumnExpression,
  GroupBy,
} from 'node-jql'

const query = new Query({
  $select: [
    new ResultColumn('officePartyCode', '__id'),
    new ResultColumn('officePartyCode', '__value'),
    new ResultColumn(new FunctionExpression('ROWS', new ColumnExpression('*')), '__rows'),
  ],
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/shipment/query/job',
      columns: [
        {
          name: 'officePartyCode',
          type: 'string',
        },
        {
          name: 'departmentCode',
          type: 'string',
        },
        {
          name: 'autolock',
          type: 'number',
        },
        {
          name: 'manuallock',
          type: 'number',
        },
        {
          name: 'unlocked',
          type: 'number',
        },
        {
          name: 'total',
          type: 'number',
        },
      ],
    },
    'job'
  ),
  $group: 'officePartyCode',
  $order: 'officePartyCode',
})

export default query.toJson() */
