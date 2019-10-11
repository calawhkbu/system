import { Query, FromTable, ResultColumn, ColumnExpression } from 'node-jql'

const query = new Query({
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/shipment/query/shipment-count',
      columns: [{ name: 'count', type: 'number' }],
    },
    'shipment'
  ),
})

export default query.toJson()
