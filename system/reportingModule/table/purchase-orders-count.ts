import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceType: 'count',
      dataServiceQuery: ['purchase_order', 'purchase_order']
    }
  ],
  columns: [
    { key: 'count' }
  ]
} as JqlDefinition