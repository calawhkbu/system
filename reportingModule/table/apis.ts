import { Query, FromTable } from 'node-jql'

const query = new Query({
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/api/query/api',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'refreshToken', type: 'string' },
        { name: 'updatedAt', type: 'string' },
      ],
    },
    'alert'
  ),
})

export default query.toJson()
