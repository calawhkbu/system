import { QueryDef, SubqueryArg } from 'classes/query/QueryDef'
import {
  Query,
  FromTable,
  FunctionExpression,
  BinaryExpression,
  ColumnExpression,
  OrExpressions,
  RegexpExpression,
  IsNullExpression,
  AndExpressions,
  Unknown,
  Value,
  ExistsExpression,
  IExpression,
  CaseExpression,
  InExpression,
} from 'node-jql'
import { IQueryParams } from 'classes/query'
import { registerAll, ExpressionHelperInterface } from 'utils/jql-subqueries'

const query = new QueryDef(
  new Query({
    $from : new FromTable('code_master'),
    $where : new OrExpressions([
      new IsNullExpression(new ColumnExpression('code_master', 'partyGroupCode'), true),
      new AndExpressions([
        new IsNullExpression(new ColumnExpression('code_master', 'partyGroupCode'), false),
        new ExistsExpression(new Query({
          $from : new FromTable({
            table : 'code_master',
            $as : 'b'
          }),
          $where : [
            new BinaryExpression(new ColumnExpression('b', 'codeType'), '=', new ColumnExpression('code_master', 'codeType')),
            new BinaryExpression(new ColumnExpression('b', 'code'), '=', new ColumnExpression('code_master', 'code')),
            new IsNullExpression(new ColumnExpression('b', 'partyGroupCode'), true)
          ]
        }), true)
      ])
    ])
  })
)

const canResetDefaultExpression = new FunctionExpression(
  'IF',
  new IsNullExpression(new ColumnExpression('code_master', 'partyGroupCode'), true),
  1, 0
)

const isActiveConditionExpression = new AndExpressions([
  new IsNullExpression(new ColumnExpression('code_master', 'deletedAt'), false),
  new IsNullExpression(new ColumnExpression('code_master', 'deletedBy'), false)
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

const baseTableName = 'code_master'

const fieldList = [

  'codeType',
  'code',
  {
    name : 'reportingKey',
    expression : new ColumnExpression('card', 'reportingKey')
  },
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

// -------------- filter

query
  .register(
    'q',
    new Query({
      $where: new OrExpressions([
        new RegexpExpression(new ColumnExpression('code_master', 'code'), false),
        new RegexpExpression(new ColumnExpression('code_master', 'name'), false),
      ]),
    })
  )
  .register('value', 0)
  .register('value', 1)

export default query
