import { Query, FromTable, CreateTableJQL } from 'node-jql'

const tempQuery = new CreateTableJQL({
  $temporary: true,
  name: 'temp',
  $as: new Query({
    $from: new FromTable({
      url: 'demo/table',
      columns: [
        {
          name: 'header1',
          type: 'string'
        },
        {
          name: 'header2',
          type: 'string'
        },
        {
          name: 'header3',
          type: 'string'
        }
      ]
    }, 'Test')
  })
})

const query = new Query({ $from: 'temp' })

export default [
  tempQuery.toJson(),
  query.toJson()
]
