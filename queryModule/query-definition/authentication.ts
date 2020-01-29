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
  Unknown
} from 'node-jql'

const query = new QueryDef(new Query({$from: new FromTable('authentication', 'authentication')}))

// fields
query.register('id', {
  expression: new ColumnExpression('authentication', 'id'),
  $as: 'id',
})

// isActive stuff

const isActiveConditionExpression = new AndExpressions([
  new IsNullExpression(new ColumnExpression('authentication', 'deletedAt'), false),
  new IsNullExpression(new ColumnExpression('authentication', 'deletedBy'), false)
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
