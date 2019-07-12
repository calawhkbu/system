import { Query, TableOrSubquery } from 'node-jql'

const query = new Query({
  $from: new TableOrSubquery({
    table: {
      method: 'POST',
      url: 'api/shipment/query/fm3k-joblockrpt',
      columns: [
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
    },
    $as: 'purchase_order'
  })
})

export default query.toJson()