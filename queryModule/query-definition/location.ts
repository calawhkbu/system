import { QueryDef } from 'classes/query/QueryDef'
import {
  BinaryExpression,
  ColumnExpression,
  InExpression,
  Query,
  OrExpressions,
  RegexpExpression,
  FunctionExpression,
  AndExpressions,
  IsNullExpression,
  Value,
  Unknown,
} from 'node-jql'

const query = new QueryDef(new Query('location'))

// ------------- fields stuff

query.register('canDelete',
  {

    expression: new FunctionExpression(
      'IF',
      new AndExpressions([
        new IsNullExpression(new ColumnExpression('location', 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression('location', 'deletedBy'), false),
      ]),
      1, 0
    ),

    $as: 'canDelete'
  })

query.register('canRestore',
  {

    expression: new FunctionExpression(
      'IF',
      new AndExpressions([
        new IsNullExpression(new ColumnExpression('location', 'deletedAt'), true),
        new IsNullExpression(new ColumnExpression('location', 'deletedBy'), true),
      ]),
      1, 0
    ),

    $as: 'canRestore'
  })

// -----------------------------------

query
  .register(
    'moduleTypeCode',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('moduleTypeCode'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'ports',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('portCode'), false),
    })
  )
  .register('value', 0)

  query
  .register(
    'portCode',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('portCode'), '='),
    })
  )
  .register('value', 0)

  query
  .register(
    'portCodes',
    new Query({
      $where: new InExpression(new ColumnExpression('portCode'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'q',
    new Query({
      $where: new OrExpressions({
        expressions: [
          new RegexpExpression(new ColumnExpression('portCode'), false),
          new RegexpExpression(new ColumnExpression('name'), false),
        ],
      }),
    })
  )
  .register('value', 0)
  .register('value', 1)

// will have 2 options, active and deleted
  // isActive
  const isActiveConditionExpression = new AndExpressions([
    new IsNullExpression(new ColumnExpression('location', 'deletedAt'), false),
    new IsNullExpression(new ColumnExpression('location', 'deletedBy'), false)
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
