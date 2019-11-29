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
} from 'node-jql'

const query = new QueryDef(new Query('location'))

// ------------- fields stuff

query.register('isActive',
{
  expression : new FunctionExpression(
    'IF',
    new AndExpressions([
      new IsNullExpression(new ColumnExpression('location', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('location', 'deletedBy'), false),
    ]),
    1, 0
  ),

  $as: 'isActive'
})

query.register('can_delete',
{

  expression : new FunctionExpression(
    'IF',
    new AndExpressions([
      new IsNullExpression(new ColumnExpression('location', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('location', 'deletedBy'), false),
    ]),
    1, 0
  ),

  $as: 'can_delete'
})

query.register('can_restore',
{

  expression : new FunctionExpression(
    'IF',
    new AndExpressions([
      new IsNullExpression(new ColumnExpression('location', 'deletedAt'), true),
      new IsNullExpression(new ColumnExpression('location', 'deletedBy'), true),
    ]),
    1, 0
  ),

  $as: 'can_restore'
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
    'portCode',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('portCode'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'ports',
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

  query.register(
    'isActive',
    new Query({
      $where: [
        new IsNullExpression(new ColumnExpression('location', 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression('location', 'deletedBy'), false),
      ],
    })
  )

export default query
