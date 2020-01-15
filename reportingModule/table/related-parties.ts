import { Query, FromTable } from 'node-jql'

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
          name: 'shortName',
          type: 'string',
        },
        {
          name: 'groupName',
          type: 'string',
        },
        {
          name: 'partyTypes',
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
          name: 'showDelete',
          type: 'number',
        },
      ],
    },
    'party'
  ),
})

export default query.toJson()
