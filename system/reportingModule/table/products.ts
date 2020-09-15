import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceQuery: ['product', 'product']
    }
  ],
  columns: [
    { key: 'id' },
    { key: 'productCode' },
    { key: 'skuCode' },
    { key: 'name' },
    { key: 'productCategory' }
  ]
} as JqlDefinition
