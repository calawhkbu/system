import { Query, FromTable } from 'node-jql'

const query = new Query({
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/schedule/query/schedule',
      columns: [
        { name: 'id', type: 'string' },
        { name: 'routeCode', type: 'string' },
        { name: 'carrierCode', type: 'string' },
        { name: 'routeCode', type: 'string' },
        { name: 'vessel', type: 'string' },
        { name: 'voyage', type: 'string' },
        { name: 'portOfLoadingCode', type: 'string' },
        { name: 'portOfDischargeCode', type: 'string' },
        { name: 'estimatedDepartureDate', type: 'string' },
        { name: 'estimatedArrivalDate', type: 'string' },
        { name: 'isTransit', type: 'boolean' },
        { name: 'cyCutoffDate', type: 'string' }
      ],
    },
    'alert'
  ),
})

export default query.toJson()
