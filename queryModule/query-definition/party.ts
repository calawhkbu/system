import { QueryDef } from 'classes/query/QueryDef'
import { Query, ResultColumn, FromTable, LikeExpression, ColumnExpression, BinaryExpression, InExpression, IsNullExpression } from 'node-jql'

const query = new QueryDef(new Query({
  $distinct: true,
  $select: new ResultColumn('*'),
  $from: new FromTable('party', 'party',
    {
      operator: 'LEFT',
      table: new FromTable('party_type', 'party_type'),
      $on: new BinaryExpression(new ColumnExpression('party', 'id'), '=', new ColumnExpression('party_type', 'partyId'))
    }
  ),
}))

query.register('id', new Query({
  $where: new BinaryExpression(new ColumnExpression('party', 'id'), '=')
})).register('value', 0)

query.register('isBranch', new Query({
  $where: new BinaryExpression(new ColumnExpression('party', 'isBranch'), '=')
})).register('value', 0)

query.register('name', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('party', 'name'), operator: 'REGEXP' })
})).register('value', 0)

query.register('customCode', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('party', 'erpCode'), operator: 'REGEXP' })
})).register('value', 0)

query.register('shortName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('party', 'shortName'), operator: 'REGEXP' })
})).register('value', 0)

query.register('groupName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('party', 'groupName'), operator: 'REGEXP' })
})).register('value', 0)

query.register('email', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('party', 'email'), operator: 'REGEXP' })
})).register('value', 0)

query.register('isActive', new Query({
  $where: [
    new IsNullExpression(new ColumnExpression('party', 'deletedAt'), false),
    new IsNullExpression(new ColumnExpression('party', 'deletedBy'), false),
  ]
}))

query.register('partyTypes', new Query({
  $where: new InExpression(new ColumnExpression('party_type', 'type'), false)
})).register('value', 0)

export default query
