import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceType: 'count',
      dataServiceQuery: ['productCategory', 'product_category']
    }
  ],
  columns: [
    { key: 'count' }
  ]
} as JqlDefinition
