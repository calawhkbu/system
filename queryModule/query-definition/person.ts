import { QueryDef } from 'classes/query/QueryDef'
import { Query, FromTable, BinaryExpression, ColumnExpression, LikeExpression, IsNullExpression } from 'node-jql'

const query = new QueryDef(new Query({
  $distinct: true,
  $from: new FromTable('person', 'pe',
    {
      operator: 'LEFT',
      table: new FromTable('parties_person', 'pp'),
      $on: [
        new BinaryExpression(new ColumnExpression('pe', 'id'), '=', new ColumnExpression('pp', 'personId')),
        new IsNullExpression(new ColumnExpression('pp', 'deletedAt')),
        new IsNullExpression(new ColumnExpression('pp', 'deletedBy'))
      ]
    },
    {
      operator: 'LEFT',
      table: new FromTable('party', 'pa'),
      $on: [
        new BinaryExpression(new ColumnExpression('pa', 'id'), '=', new ColumnExpression('pp', 'partyId')),
        new IsNullExpression(new ColumnExpression('pa', 'deletedAt')),
        new IsNullExpression(new ColumnExpression('pa', 'deletedBy'))
      ]
    },
    {
      operator: 'LEFT',
      table: new FromTable('party_group', 'pg'),
      $on: [
        new BinaryExpression(new ColumnExpression('pg', 'code'), '=', new ColumnExpression('pa', 'partyGroupCode')),
        new IsNullExpression(new ColumnExpression('pg', 'deletedAt')),
        new IsNullExpression(new ColumnExpression('pg', 'deletedBy'))
      ]
    },
    {
      operator: 'LEFT',
      table: new FromTable('person_role', 'pr'),
      $on: new BinaryExpression(new ColumnExpression('pr', 'personId'), '=', new ColumnExpression('pe', 'id'))
    },
    {
      operator: 'LEFT',
      table: new FromTable('role', 'r'),
      $on: [
        new BinaryExpression(new ColumnExpression('r', 'id'), '=', new ColumnExpression('pr', 'roleId')),
        new IsNullExpression(new ColumnExpression('r', 'deletedAt')),
        new IsNullExpression(new ColumnExpression('r', 'deletedBy'))
      ]
    },
    {
      operator: 'LEFT',
      table: new FromTable('person_contact', 'pc'),
      $on: [
        new BinaryExpression(new ColumnExpression('pe', 'id'), '=', new ColumnExpression('pc', 'personId')),
        new IsNullExpression(new ColumnExpression('pc', 'deletedAt')),
        new IsNullExpression(new ColumnExpression('pc', 'deletedBy'))
      ]
    }
  ),
}))

query.register('userName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('pe', 'userName'), operator: 'REGEXP' })
})).register('value', 0)

query.register('firstName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('pe', 'firstName'), operator: 'REGEXP' })
})).register('value', 0)

query.register('lastName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('pe', 'lastName'), operator: 'REGEXP' })
})).register('value', 0)

query.register('displayName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('pe', 'displayName'), operator: 'REGEXP' })
})).register('value', 0)

query.register('isActive', new Query({
  $where: [
    new IsNullExpression(new ColumnExpression('pe', 'deletedAt')),
    new IsNullExpression(new ColumnExpression('pe', 'deletedBy')),
  ]
}))

export default query
