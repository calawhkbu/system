import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceType: 'count',
      dataServiceQuery: ['booking', 'booking']
    }
  ],
  columns: [
    { key: 'count' },
  ],
} as JqlDefinition
