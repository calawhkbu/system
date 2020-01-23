import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
  FromTable,
  RegexpExpression,
  ColumnExpression,
  InExpression,
  BinaryExpression,
  IsNullExpression,
  Unknown,
  AndExpressions,
  Value,
  FunctionExpression,
  OrExpressions,
  ExistsExpression,
} from 'node-jql'

const query = new QueryDef(
  new Query({
    $from : new FromTable({
      table : 'role'
    }),

    $where : new OrExpressions([

      new IsNullExpression(new ColumnExpression('role', 'partyGroupCode'), true),

      new AndExpressions([
        new IsNullExpression(new ColumnExpression('role', 'partyGroupCode'), false),
        new ExistsExpression(new Query({

          $from : new FromTable({
            table : 'role',
            $as : 'b'
          }),
          $where : [
            new BinaryExpression(new ColumnExpression('b', 'roleGroup'), '=', new ColumnExpression('role', 'roleGroup')),
            new BinaryExpression(new ColumnExpression('b', 'roleName'), '=', new ColumnExpression('role', 'roleName')),
            new IsNullExpression(new ColumnExpression('b', 'partyGroupCode'), true)
          ]

        }), true)

      ])
    ])

  })
)

query.register('canResetDefault',
{
  expression : new FunctionExpression(
    'IF',
    new IsNullExpression(new ColumnExpression('role', 'partyGroupCode'), true),
    1, 0
  ),

  $as: 'canResetDefault'
})

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
  query.register('isActive', new Query({
    $where : new OrExpressions([
      new AndExpressions([
        new BinaryExpression(new Value('active'), '=', new Unknown('string')),
        // active case
        new IsNullExpression(new ColumnExpression('role', 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression('role', 'deletedBy'), false)
      ]),
      new AndExpressions([
        new BinaryExpression(new Value('deleted'), '=', new Unknown('string')),
        // deleted case
        new IsNullExpression(new ColumnExpression('role', 'deletedAt'), true),
        new IsNullExpression(new ColumnExpression('role', 'deletedBy'), true)
      ])
    ])
  }))
  .register('value', 0)
  .register('value', 1)
export default query
