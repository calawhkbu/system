import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
  FromTable,
  RegexpExpression,
  ColumnExpression,
  InExpression,
  BinaryExpression,
  IsNullExpression,
} from 'node-jql'

const query = new QueryDef(
  new Query({
    $from: new FromTable('role', {
      operator: 'LEFT',
      table: 'flex_data',
      $on: [
        new BinaryExpression(new ColumnExpression('flex_data', 'tableName'), '=', 'role'),
        new BinaryExpression(
          new ColumnExpression('role', 'id'),
          '=',
          new ColumnExpression('flex_data', 'primaryKey')
        ),
      ],
    }),
  })
)

// ----------------- filter stuff
query
  .register(
    'id',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('role', 'id'), '='),
    })
  )
  .register('value', 0)

  query
  .register(
    'partyGroupCode',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('role', 'partyGroupCode'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'partyGroupCode',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('role', 'partyGroupCode'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'name',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('role', 'roleName'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'group',
    new Query({
      $where: new InExpression(new ColumnExpression('role', 'roleGroup'), null),
    })
  )
  .register('value', 0)

  query
  .register(
    'shareable',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('role', 'shareable'), '='),
    })
  )
  .register('value', 0)

  query
  .register(
    'hidden',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('role', 'hidden'), '='),
    })
  )
  .register('value', 0)

  query
  .register(
    'canMultiSelect',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('role', 'canMultiSelect'), '='),
    })
  )
  .register('value', 0)

query.register(
  'isActive',
  new Query({
    $where: [
      new IsNullExpression(new ColumnExpression('code_master', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('code_master', 'deletedBy'), false),
      new IsNullExpression(new ColumnExpression('flex_data', 'deletedBy'), false),
      new IsNullExpression(new ColumnExpression('flex_data', 'deletedBy'), false),
    ],
  })
)

export default query
