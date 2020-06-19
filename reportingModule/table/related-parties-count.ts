import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceType: 'count',
      dataServiceQuery: ['party', 'related-party']
    }
  ],
  columns: [
    { key: 'count' },
  ]
} as JqlDefinition

/* import { Query, FromTable } from 'node-jql'

const query = new Query({
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/party/query/related-party',
      columns: [
        {
          name: 'partyAId',
          type: 'number',
        },
        {
          name: 'partyBId',
          type: 'number',
        },
        {
          name: 'partyAName',
          type: 'string',
        },
        {
          name: 'partyBName',
          type: 'string',
        },
        {
          name: 'partyBShortName',
          type: 'string',
        },
        {
          name: 'partyBGroupName',
          type: 'string',
        },
        {
          name: 'partyTypes',
          type: 'string',
        },
        {
          name: 'showDelete',
          type: 'number',
        },
      ],
    },
    'party'
  ),
})

export default query.toJson() */
