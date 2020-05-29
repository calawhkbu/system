import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callAxios',
      injectParams: true,
      axiosConfig: {
        method: 'POST',
        url: 'api/api/query/api',
      },
    },
  ],
  columns: [
    { key: 'id' },
    { key: 'name' },
    { key: 'refreshToken' },
    { key: 'updatedAt' },
  ],
} as JqlDefinition

/* import { Query, FromTable } from 'node-jql'

const query = new Query({
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/api/query/api',
      columns: [
        { name: 'id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'refreshToken', type: 'string' },
        { name: 'updatedAt', type: 'string' },
      ],
    },
    'alert'
  ),
})

export default query.toJson() */
