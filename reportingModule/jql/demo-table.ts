import { Query, TableOrSubquery } from 'node-jql'

const tempQuery = new Query({
	$createTempTable: 'temp',
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

const query = new Query({
	$from: 'temp'
})

export default [
	tempQuery.toJson(),
	query.toJson()
]