import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceQuery: ['party', 'related-person']
    }
  ],
  columns: [
    { key: 'id' },
    { key: 'personId' },
    { key: 'name' },
    { key: 'email' },
    { key: 'phone' },
    { key: 'showResend' },
    { key: 'showDelete' },
  ]
} as JqlDefinition

/* import { Query, FromTable } from 'node-jql'

const query = new Query({
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/party/query/related-person',
      columns: [
        {
          name: 'id',
          type: 'number',
        },
        {
          name: 'personId',
          type: 'number',
        },
        {
          name: 'name',
          type: 'string',
        },
        {
          name: 'email',
          type: 'string',
        },
        {
          name: 'phone',
          type: 'string',
        },
        {
          name: 'showResend',
          type: 'number',
        },
        {
          name: 'showDelete',
          type: 'number',
        },
      ],
    },
    'person'
  ),
})

export default query.toJson() */
