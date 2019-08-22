import { QueryDef } from 'classes/query/QueryDef'
import { Query, ResultColumn, FromTable, RegexpExpression, ColumnExpression, BinaryExpression, InExpression, IsNullExpression } from 'node-jql'

const query = new QueryDef(
  new Query({
    $distinct: true,
    $from: new FromTable('party', {
      operator: 'LEFT',
      table: 'party_type',
      $on: new BinaryExpression(new ColumnExpression('party', 'id'), '=', new ColumnExpression('party_type', 'partyId')),
    }),
  })
)

query
  .register(
    'id',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('party', 'id'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'isBranch',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('party', 'isBranch'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'name',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('party', 'name'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'customCode',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('party', 'erpCode'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'shortName',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('party', 'shortName'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'groupName',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('party', 'groupName'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'email',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('party', 'email'), false),
    })
  )
  .register('value', 0)

query.register(
  'isActive',
  new Query({
    $where: [new IsNullExpression(new ColumnExpression('party', 'deletedAt'), false), new IsNullExpression(new ColumnExpression('party', 'deletedBy'), false)],
  })
)

query
  .register(
    'partyTypes',
    new Query({
      $where: new InExpression(new ColumnExpression('party_type', 'type'), false),
    })
  )
  .register('value', 0)

export default query
