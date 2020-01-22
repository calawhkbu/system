import { QueryDef } from 'classes/query/QueryDef'
import {
  IsNullExpression,
  ColumnExpression,
  FromTable,
  RegexpExpression,
  AndExpressions,
  Query,
  FunctionExpression
} from 'node-jql'

const query = new QueryDef(
  new Query({
    $from: new FromTable('tracking'),
  })
)

query.register('lastStatus', {
  expression: new FunctionExpression(
    'concat',
    new ColumnExpression('tracking', 'lastStatusCode'),
    ' (',
    new ColumnExpression('tracking', 'lastStatusDescription'),
    ')'
  ),
  $as: 'lastStatus',
})

query
  .register(
    'trackingNo',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('tracking', 'trackingNo'), false),
    })
  )
  .register('value', 0)

  query.register(
    'isActive',
    new Query({
      $where: new AndExpressions({
        expressions: [
          new IsNullExpression(new ColumnExpression('tracking', 'deletedAt'), false),
          new IsNullExpression(new ColumnExpression('tracking', 'deletedBy'), false),
        ],
      }),
    })
  )

export default query
