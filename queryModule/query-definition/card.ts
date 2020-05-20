import { QueryDef } from 'classes/query/QueryDef'
import {
  BinaryExpression,
  ColumnExpression,
  Query,
  FunctionExpression,
  AndExpressions,
  IsNullExpression,
  FromTable,
  RegexpExpression,
  OrExpressions,
  Value,
  Unknown,
  CaseExpression,
} from 'node-jql'
import { registerAll, ExpressionHelperInterface } from 'utils/jql-subqueries'

const query = new QueryDef(new Query({
  $from : new FromTable('card')
}))

const canDeleteExpression = new FunctionExpression(
  'IF',
  new AndExpressions([
    new IsNullExpression(new ColumnExpression('card_access', 'deletedAt'), false),
    new IsNullExpression(new ColumnExpression('card_access', 'deletedBy'), false),
  ]),
  1, 0
)

const canRestoreExpression = new FunctionExpression(
  'IF',
  new AndExpressions([
    new IsNullExpression(new ColumnExpression('card_access', 'deletedAt'), true),
    new IsNullExpression(new ColumnExpression('card_access', 'deletedBy'), true),
  ]),
  1, 0
)

const isActiveConditionExpression = new AndExpressions([
  new IsNullExpression(new ColumnExpression('i18n', 'deletedAt'), false),
  new IsNullExpression(new ColumnExpression('i18n', 'deletedBy'), false)
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

const baseTableName = 'card'
const fieldList = [
  'id',
  'uuid',
  'category',
  'jql',
  {
    name : 'canDelete',
    expression : canDeleteExpression
  },
  {
    name : 'canRestore',
    expression : canRestoreExpression
  },
  {
    name : 'activeStatus',
    expression : activeStatusExpression
  }

] as ExpressionHelperInterface[]

registerAll(query, baseTableName, fieldList)

// ------------- filter stuff

query
  .register(
    'q',
    new Query({
      $where: new OrExpressions([
        new RegexpExpression(new ColumnExpression('card', 'uuid'), false),
        new RegexpExpression(new ColumnExpression('card', 'name'), false),
        new RegexpExpression(new ColumnExpression('card', 'jql'), false),
      ]),
    })
  )
  .register('value', 0)
  .register('value', 1)
  .register('value', 2)

// -----------------------

export default query
