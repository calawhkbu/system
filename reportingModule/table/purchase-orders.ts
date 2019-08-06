import { Query, FromTable } from 'node-jql'

const query = new Query({
  $from: new FromTable({
    method: 'POST',
    url: 'api/purchase-order/query/purchase-order',
    columns: [
      {
        name: 'id',
        type: 'number'
      }
    ]
  }, 'purchase_order')
})

export default query.toJson()
