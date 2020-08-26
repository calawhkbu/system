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
} from 'node-jql'
import { registerAll } from 'utils/jql-subqueries'

const CONSTANTS = {
  tableName: 'product_category',
  fieldList: [
    'id',
    'productCategoryCode',
    'name',
    'description',
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
                new IsNullExpression(new ColumnExpression('api', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('api', 'deletedBy'), false)
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
