import { Query, FromTable } from 'node-jql'

const query = new Query({
  $from: new FromTable({
    url: 'demo',
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
  }, 'Test')
})

export default query.toJson()
