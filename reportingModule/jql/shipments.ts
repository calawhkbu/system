import { Query, FromTable } from 'node-jql'

const query = new Query({
  $from: new FromTable({
    method: 'POST',
    url: 'api/shipment/query/shipment',
    columns: [
      {
        name: 'id',
        type: 'number'
      },
      {
        name: 'houseNo',
        type: 'string'
      },
      {
        name: 'masterNo',
        type: 'string'
      },
      {
        name: 'jobDate',
        type: 'Date'
      },
      {
        name: 'moduleTypeCode',
        type: 'string'
      },
      {
        name: 'boundTypeCode',
        type: 'string'
      },
      {
        name: 'serviceType',
        type: 'string'
      }
    ]
  }, 'shipment')
})

export default query.toJson()