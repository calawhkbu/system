import { QueryDef, SubqueryArg } from 'classes/query/QueryDef'
import {
  BinaryExpression,
  ColumnExpression,
  Query,
  FunctionExpression,
  AndExpressions,
  IsNullExpression,
  FromTable,
  ResultColumn,
  OrExpressions,
  Value,
  Unknown,
  IExpression,
  InExpression,
  RegexpExpression,
  CaseExpression
} from 'node-jql'
import { IQueryParams } from 'classes/query'
import { ExpressionHelperInterface, registerAll } from 'utils/jql-subqueries'

const query = new QueryDef(new Query({
  $select : [
    new ResultColumn(new ColumnExpression('card_access', '*')),
    new ResultColumn(new ColumnExpression('card', 'reportingKey')),
    new ResultColumn(new ColumnExpression('card', 'category')),
    new ResultColumn(new ColumnExpression('card', 'name')),
    new ResultColumn(new ColumnExpression('card', 'description')),
    new ResultColumn(new ColumnExpression('card', 'component')),
    new ResultColumn(new ColumnExpression('card', 'jql')),
  ],
  $from : new FromTable('card_access', {
    operator: 'LEFT',
    table: 'card',
    $on: [
      new BinaryExpression(
        new ColumnExpression('card', 'uuid'),
        '=',
        new ColumnExpression('card_access', 'cardId')
      ),
    ],
  })
}))

  // all expression in here

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
    new IsNullExpression(new ColumnExpression('card_access', 'deletedAt'), false),
    new IsNullExpression(new ColumnExpression('card_access', 'deletedBy'), false)
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

  //  ============================

  // finally register here

  const baseTableName = 'card_access'

  const fieldList = [
    'id',
    'partyGroupCode',
    {
      name : 'reportingKey',
      expression : new ColumnExpression('card', 'reportingKey')
    },

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

export default query
