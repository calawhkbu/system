import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callAxios',
      injectParams: true,
      axiosConfig: {
        method: 'POST',
        url: 'api/party/query/party',
      },
    }
  ],
  columns: [
    { key: 'id' },
    { key: 'name' },
    { key: 'shortName' },
    { key: 'groupName' },
  ]
} as JqlDefinition

/* import { Query, FromTable } from 'node-jql'

const query = new Query({
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/party/query/party',
      columns: [
        {
          name: 'id',
          type: 'number',
        },
        {
          name: 'name',
          type: 'string',
        },
        {
          name: 'shortName',
          type: 'string',
        },
        {
          name: 'groupName',
          type: 'string',
        },
        // {
        //   name: 'partyTypes',
        //   type: 'string',
        // },
        // {
        //   name: 'parties',
        //   type: 'number',
        // },
        // {
        //   name: 'contacts',
        //   type: 'number',
        // },
        // {
        //   name: 'showInfo',
        //   type: 'number',
        // },
      ],
    },
    'party'
  ),
})

export default query.toJson() */
