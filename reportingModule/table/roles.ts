import { Query, FromTable } from 'node-jql'

const query = new Query({
  $from: new FromTable({
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
      },
      {
        name: 'filter',
        type: 'string'
      }
    ]
  }, 'role')
})

export default query.toJson()
