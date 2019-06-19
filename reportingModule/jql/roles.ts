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
          name: 'roleName',
          type: 'string'
        },
        {
          name: 'roleGroup',
          type: 'string'
        }
			]
    },
    $as: 'role'
  })
})

export default query.toJson()
