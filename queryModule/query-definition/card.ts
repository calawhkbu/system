import { QueryDef } from 'classes/query/QueryDef'
import {
  BinaryExpression,
  ColumnExpression,
  Query,
  FunctionExpression,
  AndExpressions,
  IsNullExpression,
  FromTable,
  RegexpExpression,
  OrExpressions,
  Value,
  Unknown,
} from 'node-jql'

const query = new QueryDef(new Query({
  $from : new FromTable('card')
}))

query.register('isActive',
{
  expression : new FunctionExpression(
    'IF',
    new AndExpressions([
      new IsNullExpression(new ColumnExpression('card', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('card', 'deletedBy'), false),
    ]),
    1, 0
  ),

  $as: 'isActive'
})

query.register('canDelete',
{

  expression : new FunctionExpression(
    'IF',
    new AndExpressions([
      new IsNullExpression(new ColumnExpression('card', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('card', 'deletedBy'), false),
    ]),
    1, 0
  ),

  $as: 'canDelete'
})

query.register('canRestore',
{

  expression : new FunctionExpression(
    'IF',
    new AndExpressions([
      new IsNullExpression(new ColumnExpression('card', 'deletedAt'), true),
      new IsNullExpression(new ColumnExpression('card', 'deletedBy'), true),
    ]),
    1, 0
  ),

  $as: 'canRestore'
})

// ------------- filter stuff

query
  .register(
    'uuid',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('card', 'uuid'), '=')
    })
  )
  .register('value', 0)

query
  .register(
    'category',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('card', 'category'), '=')
    })
  )
  .register('value', 0)

  query
  .register(
    'jql',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('card', 'jql'), '=')
    })
  )
  .register('value', 0)

query
  .register(
    'q',
    new Query({
      $where: new OrExpressions([
        new RegexpExpression(new ColumnExpression('card', 'uuid'), false),
        new RegexpExpression(new ColumnExpression('card', 'name'), false),
        new RegexpExpression(new ColumnExpression('card', 'jql'), false),
      ]),
    })
  )
  .register('value', 0)
  .register('value', 1)

// -----------------------

  // isActive
  const isActiveConditionExpression = new AndExpressions([
    new IsNullExpression(new ColumnExpression('card', 'deletedAt'), false),
    new IsNullExpression(new ColumnExpression('card', 'deletedBy'), false)
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
