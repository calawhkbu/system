import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceType: 'count',
      dataServiceQuery: ['purchaseOrder', 'purchase_order']
    }
  ],
  columns: [
    { key: 'count' }
  ]
} as JqlDefinition
