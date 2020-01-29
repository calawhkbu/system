import { QueryDef } from 'classes/query/QueryDef'
import {
  IsNullExpression,
  ColumnExpression,
  FromTable,
  RegexpExpression,
  AndExpressions,
  Query,
  FunctionExpression,
  OrExpressions,
  Unknown,
  Value,
  BinaryExpression
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

  // will have 2 options, active and deleted
  // isActive
  const isActiveConditionExpression = new AndExpressions([
    new IsNullExpression(new ColumnExpression('tracking', 'deletedAt'), false),
    new IsNullExpression(new ColumnExpression('tracking', 'deletedBy'), false),
  ])

  query.registerBoth('isActive', isActiveConditionExpression)

  query.registerQuery('isActive', new Query({

    $where : new OrExpressions([

      new AndExpressions([

        new BinaryExpression(new Value('active'), '=', new Unknown('string')),
        // active case
        isActiveConditionExpression
      ]),

      new AndExpressions([
        new BinaryExpression(new Value('deleted'), '=', new Unknown('string')),
        // deleted case
        new BinaryExpression(isActiveConditionExpression, '=', false)
      ])

    ])

  }))
  .register('value', 0)
  .register('value', 1)

export default query
