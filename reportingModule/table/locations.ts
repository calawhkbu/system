import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callAxios',
      injectParams: true,
      axiosConfig: {
        method: 'POST',
        url: 'api/location/query/location',
      },
    }
  ],
  columns: [
    { key: 'id' },
    { key: 'countryCode' },
    { key: 'portCode' },
    { key: 'moduleTypeCode' },
    { key: 'name' },
    { key: 'canDelete' },
    { key: 'canRestore' }
  ]
} as JqlDefinition

/* import { Query, FromTable } from 'node-jql'

const query = new Query({
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/location/query/location',
      columns: [
        { name: 'id', type: 'number' },
        { name: 'countryCode', type: 'string' },
        { name: 'portCode', type: 'string' },
        { name: 'moduleTypeCode', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'canDelete', type: 'boolean' },
        { name: 'canRestore', type: 'boolean' }
      ],
    },
    'location'
  ),
})

export default query.toJson() */
