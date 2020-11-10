import { QueryDef } from 'classes/query/QueryDef'
import {
  BinaryExpression,
  ColumnExpression,
  Query,
  AndExpressions,
  IsNullExpression,
  FromTable,
  Value,
  CaseExpression,
  QueryExpression,
  ResultColumn,
  MathExpression
} from 'node-jql'
import { registerAll } from 'utils/jql-subqueries'

// const productExpression = new QueryExpression(new Query({
//   $select : [
//     new ResultColumn(new ColumnExpression('product','skuCode')),
//     new ResultColumn(new ColumnExpression('product', 'name'))
//   ],
//   $from: new FromTable('product'),
//   $where: [
//     new BinaryExpression(
//       new ColumnExpression('product', 'id'),
//       '=',
//       new ColumnExpression('purchase_order_item', 'productId')
//     )
//   ]
// }))

const purchaseOrderFieldList = [
  'poNo'
]

const purchaseOrderExpressionList = purchaseOrderFieldList.map((field) => {
  return {
    name: field,
    expression: new ColumnExpression('purchase_order', field),
    companion: ['table:purchase_order'] 
  }
})

// const purchaseOrderExpressionList = purchaseOrderFieldList.map((field) => {
//   return {
//     name: field,
//     expression: new ColumnExpression('purchase_order', field),
//     companion: ['table:purchase_order'] 
//   }
// })

const productCategoryDefinition = {
  name: 'definition',
  expression: new ColumnExpression('product_category', 'definition'),
  companion: ['table:purchase_order']
}

const unbookedQuantityExpression = {
  name: 'unbookedQuantity',
  expression: new MathExpression(
    new ColumnExpression('purchase_order_item', 'quantity'),
    '-',
    new ColumnExpression('purchase_order_item', 'bookedQuantity'),
  )
}

const CONSTANTS = {
  tableName: 'purchase_order_item',
  fieldList: [
    'id',
    'poId',
    'itemKey',
    'htsCode',
    'quantity',
    'bookedQuantity',
    unbookedQuantityExpression,
    'quantityUnit',
    'productId',
    {
      name: 'flexData',
      expression: new ColumnExpression('purchase_order_item', 'flexData')
    },
    {
      name: 'skuName',
      expression: new ColumnExpression('product', 'name'),
      companion: ['table:product'] 
    },
    {
      name: 'skuCode',
      expression: new ColumnExpression('product', 'skuCode'),
      companion: ['table:product']
    },
    ... purchaseOrderExpressionList,
    productCategoryDefinition,
    'updatedAt'
  ]
}

const query = new QueryDef(new Query({
  $from: new FromTable(CONSTANTS.tableName, CONSTANTS.tableName)
}))

query.table('purchase_order', new Query({
  $from : new FromTable({
    table: 'purchase_order_item',
    joinClauses: [
      { 
        operator: 'LEFT',
        table: new FromTable('purchase_order', 'purchase_order'),
        $on: [
          new BinaryExpression(
            new ColumnExpression('purchase_order', 'id'),
            '=',
            new ColumnExpression('purchase_order_item', 'poId')
          )
        ]
      },
      {
        operator: 'LEFT',
        table: new FromTable('product_category', 'product_category'),
        $on: [
          new BinaryExpression(
            new ColumnExpression('product_category', 'id'),
            '=',
            new ColumnExpression('purchase_order', 'productCategoryId')
          )
        ]
      }
    ]
  })
}))

query.table('product', new Query({
  $from: new FromTable({
    table: 'purchase_order_item',
    joinClauses: [      { 
      operator: 'LEFT',
      table: new FromTable('product', 'product'),
      $on: [
        new BinaryExpression(
          new ColumnExpression('product', 'id'),
          '=',
          new ColumnExpression('purchase_order_item', 'productId')
        )
      ]
    }]
  })
}))


registerAll(
  query,
  CONSTANTS.tableName,
  [
    ...CONSTANTS.fieldList,
    {
      name : 'activeStatus',
      expression : new CaseExpression({
        cases : [
          {
            $when : new BinaryExpression(
              new AndExpressions([
                new IsNullExpression(new ColumnExpression('purchase_order_item', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('purchase_order_item', 'deletedBy'), false)
              ]),
              '=',
              false
            ),
            $then : new Value('deleted')
          }
        ],
        $else : new Value('active')
      })
    }
  ]
)

export default query
