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
} from 'node-jql'
import { registerAll } from 'utils/jql-subqueries'

const productCategoryExpression = new QueryExpression(new Query({
  $select : [
    new ResultColumn(new ColumnExpression('product_category','name'))
  ],
  $from: new FromTable('product_category'),
  $where: [
    new BinaryExpression(
      new ColumnExpression('product', 'productCategoryId'),
      '=',
      new ColumnExpression('product_category', 'id')
    )
  ]
}))

const CONSTANTS = {
  tableName: 'product',
  fieldList: [
    'id',
    'productCode',
    'skuCode',
    'name',
    'productCategoryId',
    {
      name: 'productCategory',
      expression: productCategoryExpression
    }
  ]
}

const query = new QueryDef(new Query({
  $from: new FromTable(CONSTANTS.tableName, CONSTANTS.tableName)
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
                new IsNullExpression(new ColumnExpression('product', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('product', 'deletedBy'), false)
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
