import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceType: 'count',
      dataServiceQuery: ['party', 'party']
    }
  ],
  columns: [
    { key: 'count' }
  ]
} as JqlDefinition
