import { Query, TableOrSubquery } from 'node-jql'

const query = new Query({
  $from: new TableOrSubquery({
    table: {
      method: 'POST',
      url: 'q/invitation',
      columns: [
        {
          name: 'id',
          type: 'number'
        },
        {
          name: 'userName',
          type: 'string'
        },
        {
          name: 'status',
          type: 'string'
        },
        {
          name: 'firstName',
          type: 'string'
        },
        {
          name: 'lastName',
          type: 'string'
        },
        {
          name: 'displayName',
          type: 'string'
        },
        {
          name: 'createdAt',
          type: 'Date'
        },
        {
          name: 'updatedAt',
          type: 'Date'
        }
      ]
    },
    $as: 'invitation'
  })
})

export default query.toJson()