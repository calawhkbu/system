import { QueryDef, SubqueryArg } from 'classes/query/QueryDef'
import {
  BinaryExpression,
  ColumnExpression,
  Query,
  AndExpressions,
  IsNullExpression,
  FromTable,
  OrExpressions,
  Value,
  Unknown,
  CaseExpression,
  IExpression,
  InExpression,
  RegexpExpression
} from 'node-jql'
import { IQueryParams } from 'classes/query'
import { ExpressionHelperInterface, registerAll } from 'utils/jql-subqueries'

const query = new QueryDef(new Query({$from: new FromTable('api', 'api')}))

const isActiveConditionExpression = new AndExpressions([
  new IsNullExpression(new ColumnExpression('api', 'deletedAt'), false),
  new IsNullExpression(new ColumnExpression('api', 'deletedBy'), false)
])

const activeStatusExpression = new CaseExpression({
  cases : [
    {
      $when : new BinaryExpression(isActiveConditionExpression, '=', false),
      $then : new Value('deleted')
    }
  ],
  $else : new Value('active')
})

const baseTableName = 'api'

const fieldList = [
  'id',
  {
    name : 'activeStatus',
    expression : activeStatusExpression
  }

] as ExpressionHelperInterface[]

registerAll(query, baseTableName, fieldList)

export default query
