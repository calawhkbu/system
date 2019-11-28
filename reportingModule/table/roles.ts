import { Query, FromTable } from 'node-jql'

const query = new Query({
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/role/query/role',
      columns: [
        {
          name: 'id',
          type: 'number',
        },
        {
          name: 'roleName',
          type: 'string',
        },
        {
          name: 'roleGroup',
          type: 'string',
        },
        {
          name: 'filter',
          type: 'string',
        },
        { name: 'isDefault', type: 'boolean' }
      ],
    },
    'role'
  ),
})

export default query.toJson()
