import { Query, FromTable } from 'node-jql'

const query = new Query({
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/booking/query/booking',
      columns: [
        {
          name: 'portOfLoadingCode',
          type: 'string',
        },
        {
          name: 'totalBooking',
          type: 'number',
        },
      ],
    },
    'Map'
  ),
})

export default query.toJson()
