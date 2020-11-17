import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceQuery: ['tracking', 'tracking']
    }
  ],
  columns: [
    { key: 'id' },
    { key: 'trackingNo' },
    { key: 'lastStatus' },
    { key: 'lastStatusDate' },
    { key: 'updatedAt' },
  ]
} as JqlDefinition
