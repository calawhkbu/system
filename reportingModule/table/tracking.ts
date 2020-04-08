import { Query, FromTable } from 'node-jql'

const query = new Query({
  $distinct: true,
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/swivel-tracking/query/tracking',
      columns: [
        {
          name: 'id',
          type: 'string'
        },
        {
          name: 'trackingNo',
          type: 'string',
        },
        {
          name: 'lastStatus',
          type: 'string',
        },
        {
          name: 'lastStatusDate',
          type: 'string',
        },
        {
          name: 'updatedAt',
          type: 'string',
        },
      ],
    },
    'tracking'
  ),
})

export default query.toJson()
