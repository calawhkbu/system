import { Query, FromTable } from 'node-jql'

const query = new Query({
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/invitation/query/invitation',
      columns: [
        {
          name: 'id',
          type: 'number',
        },
        {
          name: 'userName',
          type: 'string',
        },
        {
          name: 'status',
          type: 'string',
        },
        {
          name: 'firstName',
          type: 'string',
        },
        {
          name: 'lastName',
          type: 'string',
        },
        {
          name: 'displayName',
          type: 'string',
        },
        {
          name: 'createdAt',
          type: 'string',
        },
        {
          name: 'updatedAt',
          type: 'string',
        },
      ],
    },
    'invitation'
  ),
})

export default query.toJson()
