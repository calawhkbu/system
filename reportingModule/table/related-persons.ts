import { Query, FromTable } from 'node-jql'

const query = new Query({
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/party/query/related-person',
      columns: [
        {
          name: 'id',
          type: 'number',
        },
        {
          name: 'personId',
          type: 'number',
        },
        {
          name: 'name',
          type: 'string',
        },
        {
          name: 'email',
          type: 'string',
        },
        {
          name: 'phone',
          type: 'string',
        },
      ],
    },
    'person'
  ),
})

export default query.toJson()
