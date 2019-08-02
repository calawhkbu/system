import { QueryDef } from 'classes/query/QueryDef'
import { Query, FromTable, BinaryExpression, ColumnExpression, InExpression, RegexpExpression, IsNullExpression } from 'node-jql'

const query = new QueryDef(new Query({
  $distinct: true,
  $from: new FromTable('invitation',
    {
      operator: 'LEFT',
      table: 'person',
      $on: [
        new BinaryExpression(new ColumnExpression('person', 'id'), '=', new ColumnExpression('invitation', 'personId'))
      ]
    },
    {
      operator: 'LEFT',
      table: 'token',
      $on: [
        new BinaryExpression(new ColumnExpression('token', 'id'), '=', new ColumnExpression('invitation', 'tokenId'))
      ]
    }
  ),
}))

query.register('status', new Query({
  $where: new BinaryExpression(new ColumnExpression('invitation', 'status'), '=')
})).register('value', 0)

query.register('statuses', new Query({
  $where: new InExpression(new ColumnExpression('invitation', 'status'), false)
})).register('value', 0)

query.register('userName', new Query({
  $where: new RegexpExpression(new ColumnExpression('person', 'userName'), false)
})).register('value', 0)

query.register('firstName', new Query({
  $where: new RegexpExpression(new ColumnExpression('person', 'firstName'), false)
})).register('value', 0)

query.register('lastName', new Query({
  $where: new RegexpExpression(new ColumnExpression('person', 'lastName'), false)
})).register('value', 0)

query.register('displayName', new Query({
  $where: new RegexpExpression(new ColumnExpression('person', 'displayName'), false)
})).register('value', 0)

query.register('isActive', new Query({
  $where: [
    new IsNullExpression(new ColumnExpression('invitation', 'deletedAt'), false),
    new IsNullExpression(new ColumnExpression('invitation', 'deletedBy'), false),
    new IsNullExpression(new ColumnExpression('person', 'deletedBy'), false),
    new IsNullExpression(new ColumnExpression('person', 'deletedBy'), false),
    new IsNullExpression(new ColumnExpression('token', 'deletedBy'), false),
    new IsNullExpression(new ColumnExpression('token', 'deletedBy'), false),
  ]
}))

export default query
