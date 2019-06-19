import { Query, TableOrSubquery } from 'node-jql'

const query = new Query({
  $from: new TableOrSubquery({
    table: {
      url: 'demo/table',
      columns: [
				{
					name: 'header 1',
					type: 'string'
				},
				{
					name: 'header 2',
					type: 'string'
				},
				{
					name: 'header 3',
					type: 'string'
				}
			]
    },
    $as: 'Test'
  })
})

export default query.toJson()