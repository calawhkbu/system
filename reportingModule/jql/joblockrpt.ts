import { Query, FromTable, ResultColumn, FunctionExpression, ColumnExpression, GroupBy } from 'node-jql'

const query = new Query({
  $select: [
    new ResultColumn('officePartyCode', '__id'),
    new ResultColumn('officePartyCode', '__value'),
    new ResultColumn(new FunctionExpression('ROWS', new ColumnExpression('*')), '__rows')
  ],
  $from: new FromTable({
    method: 'POST',
    url: 'api/shipment/query/fm3k-joblockrpt',
    columns: [
      {
        name: 'officePartyCode',
        type: 'string'
      },
      {
        name: 'departmentCode',
        type: 'string'
      },
      {
        name: 'autolock',
        type: 'number'
      },
      {
        name: 'manuallock',
        type: 'number'
      },
      {
        name: 'unlocked',
        type: 'number'
      },
      {
        name: 'total',
        type: 'number'
      }
    ]
  }, 'job'),
  $group: 'officePartyCode',
  $order: 'officePartyCode'
})

export default query.toJson()