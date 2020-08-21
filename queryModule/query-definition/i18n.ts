import { QueryDef, SubqueryArg } from 'classes/query/QueryDef'
import {
  Query,
  FromTable,
  OrExpressions,
  RegexpExpression,
  ColumnExpression,
  BinaryExpression,
  IsNullExpression,
  AndExpressions,
  FunctionExpression,
  Unknown,
  Value,
  ExistsExpression,
  CaseExpression,
  InExpression,
} from 'node-jql'
import { IQueryParams } from 'classes/query'

import { registerAll, ExpressionHelperInterface } from 'utils/jql-subqueries'

const query = new QueryDef(
  new Query({
    $from : new FromTable('i18n')
  })
)

const canResetDefaultExpression = new FunctionExpression(
  'IF',
  new IsNullExpression(new ColumnExpression('i18n', 'partyGroupCode'), true),
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

const baseTableName = 'i18n'
const fieldList = [
  'id',
  'partyGroupCode',
  'key',
  'category',
  {
    name : 'canResetDefault',
    expression : canResetDefaultExpression
  },
  {
    name : 'activeStatus',
    expression : activeStatusExpression
  }
] as ExpressionHelperInterface[]

registerAll(query, baseTableName, fieldList)

// ------------------- filter
query
  .register(
    'groupParty',
    new Query({
      $where : new OrExpressions([
        new IsNullExpression(new ColumnExpression('i18n', 'partyGroupCode'), true),
        new AndExpressions([
          new IsNullExpression(new ColumnExpression('i18n', 'partyGroupCode'), false),
          new ExistsExpression(new Query({
            $from : new FromTable({
              table : 'i18n',
              $as : 'b'
            }),
            $where : [
              new BinaryExpression(new ColumnExpression('b', 'category'), '=', new ColumnExpression('i18n', 'category')),
              new BinaryExpression(new ColumnExpression('b', 'key'), '=', new ColumnExpression('i18n', 'key')),
              new IsNullExpression(new ColumnExpression('b', 'partyGroupCode'), true)
            ]
          }), true)
        ])
      ])
    })
  )

export default query
