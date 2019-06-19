import { Query, TableOrSubquery } from 'node-jql'

const query = new Query({
  $from: new TableOrSubquery({
    table: {
      method: 'POST',
      url: 'q/person',
      columns: [
        {
          name: 'pe.id',
          type: 'number'
        },
        {
          name: 'userName',
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
        }
			]
    },
    $as: 'user'
  })
})

export default query.toJson()