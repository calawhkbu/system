import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
  FromTable,
  BinaryExpression,
  ColumnExpression,
  RegexpExpression,
  IsNullExpression,
  FunctionExpression,
  InExpression,
  AndExpressions,
  Value,
  OrExpressions,
  Unknown,
  CaseExpression,
} from 'node-jql'

const query = new QueryDef(new Query('template'))

// -------------- field stuff

  const canDeleteExpression = new FunctionExpression(
    'IF',
    new AndExpressions([
      new IsNullExpression(new ColumnExpression('template', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('template', 'deletedBy'), false),
    ]),
    1, 0
  )

  const canRestoreExpression = new FunctionExpression(
    'IF',
    new AndExpressions([
      new IsNullExpression(new ColumnExpression('template', 'deletedAt'), true),
      new IsNullExpression(new ColumnExpression('template', 'deletedBy'), true),
    ]),
    1, 0
  )

  const isActiveConditionExpression = new AndExpressions([
    new IsNullExpression(new ColumnExpression('template', 'deletedAt'), false),
    new IsNullExpression(new ColumnExpression('template', 'deletedBy'), false)
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

const fieldList = [
  'id',
  'partyGroupCode',
  'extension',
  'templateName',
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

]

// ----------- filter stuff
query
  .register(
    'templateName',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('template', 'templateName'), false),
    })
  )
  .register('value', 0)

export default query
