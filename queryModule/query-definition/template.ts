import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
  FromTable,
  BinaryExpression,
  ColumnExpression,
  RegexpExpression,
  IsNullExpression,
  FunctionExpression,
  InExpression,
  AndExpressions,
  Value,
  OrExpressions,
  Unknown,
} from 'node-jql'

const query = new QueryDef(new Query('template'))

// -------------- field stuff

query.register('isActive',
  {
    expression: new FunctionExpression(
      'IF',
      new AndExpressions([
        new IsNullExpression(new ColumnExpression('template', 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression('template', 'deletedBy'), false),
      ]),
      1, 0
    ),

    $as: 'isActive'
  })

query.register('canDelete',
  {

    expression: new FunctionExpression(
      'IF',
      new AndExpressions([
        new IsNullExpression(new ColumnExpression('template', 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression('template', 'deletedBy'), false),
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
        new IsNullExpression(new ColumnExpression('template', 'deletedAt'), true),
        new IsNullExpression(new ColumnExpression('template', 'deletedBy'), true),
      ]),
      1, 0
    ),

    $as: 'canRestore'
  })

// ----------- filter stuff

query
  .register(
    'partyGroupCode',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('template', 'partyGroupCode'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'extension',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('template', 'extension'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'templateName',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('template', 'templateName'), false),
    })
  )
  .register('value', 0)

// will have 2 options, active and deleted
query.register('isActive', new Query({

  $where: new OrExpressions([

    new AndExpressions([

      new BinaryExpression(new Value('active'), '=', new Unknown('string')),

      // active case
      new IsNullExpression(new ColumnExpression('template', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('template', 'deletedBy'), false)
    ]),

    new AndExpressions([
      new BinaryExpression(new Value('deleted'), '=', new Unknown('string')),
      // deleted case
      new IsNullExpression(new ColumnExpression('template', 'deletedAt'), true),
      new IsNullExpression(new ColumnExpression('template', 'deletedBy'), true)
    ])

  ])

}))
  .register('value', 0)
  .register('value', 1)

export default query
