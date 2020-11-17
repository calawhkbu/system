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
