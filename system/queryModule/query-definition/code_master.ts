import {
  QueryDef,
  SubqueryArg
} from 'classes/query/QueryDef'
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
  LikeExpression,
  OrderBy,
  MathExpression
} from 'node-jql'
import { IQueryParams } from 'classes/query'
import { registerAll, ExpressionHelperInterface } from 'utils/jql-subqueries'

const baseTableName = 'code_master'

const query = new QueryDef(
  new Query({
    $from : new FromTable(baseTableName, baseTableName),
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
query.orderBy('qOrder', (params: IQueryParams) => {
  return {
    $order: new OrderBy({
      expression: new CaseExpression({
        cases: [
          {
            $when: new LikeExpression(new ColumnExpression('code_master', 'name'), false, `${params.subqueries.q.value}%`),
            $then: new Value(6)
          },
          {
            $when: new LikeExpression(new ColumnExpression('code_master', 'code'), false, `${params.subqueries.q.value}%`),
            $then: new Value(5)
          },
          {
            $when: new LikeExpression(new ColumnExpression('code_master', 'name'), false, `%${params.subqueries.q.value}`),
            $then: new Value(4)
          },
          {
            $when: new LikeExpression(new ColumnExpression('code_master', 'code'), false, `%${params.subqueries.q.value}`),
            $then: new Value(3)
          },
          {
            $when: new LikeExpression(new ColumnExpression('code_master', 'name'), false, `%${params.subqueries.q.value}%`),
            $then: new Value(2)
          },
          {
            $when: new LikeExpression(new ColumnExpression('code_master', 'code'), false, `%${params.subqueries.q.value}%`),
            $then: new Value(1)
          },
        ],
        $else: new Value(0)
      }),
      order: 'DESC'
    })
  }
})
query
  .register(
    'q',
    new Query({
      $where: new OrExpressions([
        new RegexpExpression(new ColumnExpression('code_master', 'code'), false),
        new RegexpExpression(new ColumnExpression('code_master', 'name'), false),
      ]),
    }),
    ...['orderBy:qOrder']
  )
  .register('value', 0)
  .register('value', 1)

query.subquery(
'flexDataFilter',
new Query({
  $where: new BinaryExpression(new MathExpression(
    new ColumnExpression('code_master', 'flexData'),
    '->>',
    new Unknown()
  ), '=', new Unknown())
})
).register('type', 0).register('value', 1)

export default query
