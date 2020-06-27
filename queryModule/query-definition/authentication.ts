import { QueryDef } from 'classes/query/QueryDef'
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
  IExpression
} from 'node-jql'
import { ExpressionHelperInterface, registerAll } from 'utils/jql-subqueries'

const query = new QueryDef(new Query({$from: new FromTable('authentication', 'authentication')}))

const isActiveConditionExpression = new AndExpressions([
  new IsNullExpression(new ColumnExpression('authentication', 'deletedAt'), false),
  new IsNullExpression(new ColumnExpression('authentication', 'deletedBy'), false)
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

const baseTableName = 'authentication'

const fieldList = [
  'id',
  {
    name : 'activeStatus',
    expression : activeStatusExpression
  }

] as ExpressionHelperInterface[]

registerAll(query, baseTableName, fieldList)

export default query
