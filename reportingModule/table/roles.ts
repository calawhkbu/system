import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callAxios',
      injectParams: true,
      axiosConfig: {
        method: 'POST',
        url: 'api/role/query/role',
      },
    }
  ],
  columns: [
    { key: 'id' },
    { key: 'roleName' },
    { key: 'roleGroup' },
    { key: 'filter' },
    { key: 'canResetDefault' },
  ]
} as JqlDefinition

/* import { Query, FromTable } from 'node-jql'

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
        { name: 'canResetDefault', type: 'boolean' }
      ],
    },
    'role'
  ),
})

export default query.toJson() */
