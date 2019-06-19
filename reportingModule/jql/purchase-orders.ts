import { Query, TableOrSubquery } from 'node-jql'

const query = new Query({
  $from: new TableOrSubquery({
    table: {
      method: 'POST',
      url: 'api/purchase-order/query/purchase-order',
      columns: [
        {
          name: 'id',
          type: 'number'
        }
			]
    },
    $as: 'purchase_order'
  })
})

export default query.toJson()