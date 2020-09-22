import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceType: 'count',
      dataServiceQuery: ['product', 'product']
    }
  ],
  columns: [
    { key: 'count' }
  ]
} as JqlDefinition