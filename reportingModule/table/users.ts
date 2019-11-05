import { Query, FromTable } from 'node-jql'

const query = new Query({
  $distinct: true,
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/person/query/person_invitation',
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
          name: 'status',
          type: 'string',
        },
        {
          name: 'updatedAt',
          type: 'string',
        },
      ],
    },
    'user'
  ),
})

export default query.toJson()
