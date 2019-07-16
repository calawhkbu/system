import { QueryDef } from 'classes/query/QueryDef'
import { Query, ResultColumn, FromTable, LikeExpression, ColumnExpression, BinaryExpression, InExpression, IsNullExpression } from 'node-jql'

const query = new QueryDef(new Query({
  $distinct: true,
  $select: new ResultColumn('*'),
  $from: new FromTable('party', 'pa',
    {
      operator: 'LEFT',
      table: new FromTable('party_type', 'pt'),
      $on: new BinaryExpression(new ColumnExpression('pa', 'id'), '=', new ColumnExpression('pt', 'partyId'))
    },
    {
      operator: 'LEFT',
      table: new FromTable('parties_person', 'pp'),
      $on: new BinaryExpression(new ColumnExpression('pa', 'id'), '=', new ColumnExpression('pp', 'partyId'))
    },
    {
      operator: 'LEFT',
      table: new FromTable('person', 'pe'),
      $on: new BinaryExpression(new ColumnExpression('pe', 'id'), '=', new ColumnExpression('pp', 'personId'))
    }
  ),
}))

query.register('id', new Query({
  $where: new BinaryExpression(new ColumnExpression('pa', 'id'), '=')
})).register('value', 0)

query.register('isBranch', new Query({
  $where: new BinaryExpression(new ColumnExpression('pa', 'isBranch'), '=')
})).register('value', 0)

query.register('name', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('pa', 'name'), operator: 'REGEXP' })
})).register('value', 0)

query.register('customCode', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('pa', 'erpCode'), operator: 'REGEXP' })
})).register('value', 0)

query.register('shortName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('pa', 'shortName'), operator: 'REGEXP' })
})).register('value', 0)

query.register('groupName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('pa', 'groupName'), operator: 'REGEXP' })
})).register('value', 0)

query.register('email', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('pa', 'email'), operator: 'REGEXP' })
})).register('value', 0)

query.register('isActive', new Query({
  $where: [
    new IsNullExpression(new ColumnExpression('pa', 'deletedAt')),
    new IsNullExpression(new ColumnExpression('pa', 'deletedBy')),
  ]
}))

query.register('partyTypes', new Query({
  $where: new InExpression(new ColumnExpression('pt', 'type'))
})).register('value', 0)

export default query
