import { Query, TableOrSubquery } from 'node-jql'

const query = new Query({
  $from: new TableOrSubquery({
    table: {
      method: 'POST',
      url: 'q/role',
      columns: [
        {
          name: 'id',
          type: 'number'
        },
        {
          name: 'name',
          type: 'string'
        },
        {
          name: 'group',
          type: 'string'
        }
			]
    },
    $as: 'role'
  })
})

export default query.toJson()