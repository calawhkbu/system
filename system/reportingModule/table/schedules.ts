import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceQuery: ['schedule', 'schedule']
    }
  ],
  columns: [
    { key: 'id' },
    { key: 'carrierName' },
    { key: 'routeCode' },
    { key: 'vessel' },
    { key: 'voyage' },
    { key: 'portOfLoadingName' },
    { key: 'portOfDischargeName' },
    { key: 'cyCutoffDate' },
    { key: 'estimatedDepartureDate' },
    { key: 'estimatedArrivalDate' },
  ]
} as JqlDefinition

/* import { Query, FromTable } from 'node-jql'

const query = new Query({
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/schedule/query/schedule',
      columns: [
        { name: 'id', type: 'string' },
        { name: 'carrierName', type: 'string' },
        { name: 'routeCode', type: 'string' },
        { name: 'vessel', type: 'string' },
        { name: 'voyage', type: 'string' },
        { name: 'portOfLoadingName', type: 'string' },
        { name: 'portOfDischargeName', type: 'string' },
        { name: 'cyCutoffDate', type: 'string' },
        { name: 'estimatedDepartureDate', type: 'string' },
        { name: 'estimatedArrivalDate', type: 'string' }
      ],
    },
    'alert'
  ),
})

export default query.toJson() */
