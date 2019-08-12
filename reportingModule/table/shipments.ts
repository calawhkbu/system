import { Query, FromTable } from 'node-jql'

const query = new Query({
  $from: new FromTable({
    method: 'POST',
    url: 'api/shipment/query/shipment',
    columns: [
      // TODO
    ]
  }, 'shipment')
})

export default query.toJson()
