import { Query, TableOrSubquery, ResultColumn } from 'node-jql'

const query = new Query({
  $from: new TableOrSubquery({
    table: {
      method: 'POST',
      url: 'api/booking/query/booking',
      columns: [
        {
          name: 'portOfLoadingCode',
          type: 'string'
        },
        {
          name: 'noOfBookings',
          type: 'number'
        }
      ]
    },
    $as: 'Map'
  })
})

export default query.toJson()
