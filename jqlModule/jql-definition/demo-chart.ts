import { Query, TableOrSubquery } from 'node-jql'

const query = new Query({
  $from: new TableOrSubquery({
    table: {
      url: 'demo/chart',
      columns: [
				{
					name: 'group',
					type: 'string'
				},
				{
					name: 'month',
					type: 'string'
				},
				{
					name: 'value',
					type: 'number'
				}
			]
    },
    $as: 'Test'
  })
})

export default query.toJson()