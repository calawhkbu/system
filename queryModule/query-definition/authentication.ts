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

// query
query.register('isActive', new Query({
  $where : new OrExpressions([
    new AndExpressions([
      new BinaryExpression(new Value('active'), '=', new Unknown('string')),
      // active case
      new IsNullExpression(new ColumnExpression('authentication', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('authentication', 'deletedBy'), false)
    ]),
    new AndExpressions([
      new BinaryExpression(new Value('deleted'), '=', new Unknown('string')),
      // deleted case
      new IsNullExpression(new ColumnExpression('authentication', 'deletedAt'), true),
      new IsNullExpression(new ColumnExpression('authentication', 'deletedBy'), true)
    ])
  ])
}))
.register('value', 0)
.register('value', 1)

export default query
