import { QueryDef } from 'classes/query/QueryDef'
import {
  BinaryExpression,
  ColumnExpression,
  InExpression,
  Query,
  OrExpressions,
  RegexpExpression,
  FunctionExpression,
  AndExpressions,
  IsNullExpression,
  Value,
  Unknown,
  CaseExpression,
} from 'node-jql'
import { registerAll, ExpressionHelperInterface } from 'utils/jql-subqueries'

const query = new QueryDef(new Query('location'))

// ------------- fields stuff

const canDeleteExpression = new FunctionExpression(
  'IF',
  new AndExpressions([
    new IsNullExpression(new ColumnExpression('location', 'deletedAt'), false),
    new IsNullExpression(new ColumnExpression('location', 'deletedBy'), false),
  ]),
  1, 0
)

const canRestoreExpression = new FunctionExpression(
  'IF',
  new AndExpressions([
    new IsNullExpression(new ColumnExpression('location', 'deletedAt'), true),
    new IsNullExpression(new ColumnExpression('location', 'deletedBy'), true),
  ]),
  1, 0
)

const isActiveConditionExpression = new AndExpressions([
  new IsNullExpression(new ColumnExpression('location', 'deletedAt'), false),
  new IsNullExpression(new ColumnExpression('location', 'deletedBy'), false)
])

const activeStatusExpression = new CaseExpression({
  cases: [
    {
      $when: new BinaryExpression(isActiveConditionExpression, '=', false),
      $then: new Value('deleted')
    }
  ],
  $else: new Value('active')
})

const baseTableName = 'location'

const fieldList = [
  'id',
  'moduleTypeCode',
  'portCode',
  'name',
  'countryCode',
  {
    name : 'canDelete',
    expression : canDeleteExpression
  },
  {
    name : 'canRestore',
    expression : canRestoreExpression
  },
  {
    name: 'activeStatus',
    expression: activeStatusExpression
  }

] as ExpressionHelperInterface[]

registerAll(query, baseTableName, fieldList)

// warning portCodes and ports are deleted

// -----------------------------------

query
  .register(
    'q',
    new Query({
      $where: new OrExpressions({
        expressions: [
          new RegexpExpression(new ColumnExpression('portCode'), false),
          new RegexpExpression(new ColumnExpression('name'), false),
        ],
      }),
    })
  )
  .register('value', 0)
  .register('value', 1)

export default query
