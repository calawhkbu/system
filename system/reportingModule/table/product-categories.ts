import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceQuery: ['productCategory', 'product_category']
    }
  ],
  columns: [
    { key: 'id' },
    { key: 'productCategoryCode' },
    { key: 'name' },
    { key: 'description' },
    { key: 'updatedAt' },
  ]
} as JqlDefinition
