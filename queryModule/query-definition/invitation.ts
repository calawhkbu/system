import { QueryDef } from 'classes/query/QueryDef'
import { Query, FromTable, BinaryExpression, ColumnExpression, InExpression, LikeExpression, IsNullExpression } from 'node-jql'

const query = new QueryDef(new Query({
  $distinct: true,
  $from: new FromTable('invitation', 'i',
    {
      operator: 'LEFT',
      table: new FromTable('person', 'p'),
      $on: [
        new BinaryExpression(new ColumnExpression('p', 'id'), '=', new ColumnExpression('i', 'personId')),
        new IsNullExpression(new ColumnExpression('p', 'deletedAt')),
        new IsNullExpression(new ColumnExpression('p', 'deletedBy'))
      ]
    },
    {
      operator: 'LEFT',
      table: new FromTable('token', 't'),
      $on: [
        new BinaryExpression(new ColumnExpression('t', 'id'), '=', new ColumnExpression('i', 'tokenId')),
        new IsNullExpression(new ColumnExpression('t', 'deletedAt')),
        new IsNullExpression(new ColumnExpression('t', 'deletedBy'))
      ]
    }
  ),
}))

query.register('status', new Query({
  $where: new BinaryExpression(new ColumnExpression('i', 'status'), '=')
})).register('value', 0)

query.register('statuses', new Query({
  $where: new InExpression(new ColumnExpression('i', 'status'))
})).register('value', 0)

query.register('userName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('p', 'userName'), operator: 'REGEXP' })
})).register('value', 0)

query.register('firstName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('p', 'firstName'), operator: 'REGEXP' })
})).register('value', 0)

query.register('lastName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('p', 'lastName'), operator: 'REGEXP' })
})).register('value', 0)

query.register('displayName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('p', 'displayName'), operator: 'REGEXP' })
})).register('value', 0)

query.register('isActive', new Query({
  $where: [
    new IsNullExpression(new ColumnExpression('i', 'deletedAt')),
    new IsNullExpression(new ColumnExpression('i', 'deletedBy')),
  ]
}))

export default query
