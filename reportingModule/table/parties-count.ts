import { Query, FromTable } from 'node-jql'

const query = new Query({
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/party/query/party/count',
      columns: [{ name: 'count', type: 'number' }],
    },
    'party'
  ),
})

export default query.toJson()
