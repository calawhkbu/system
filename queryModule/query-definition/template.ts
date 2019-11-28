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
} from 'node-jql'

const query = new QueryDef(new Query('template'))

// -------------- field stuff

query.register('isActive',
{
  expression : new FunctionExpression(
    'IF',
    new AndExpressions([
      new IsNullExpression(new ColumnExpression('template', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('template', 'deletedBy'), false),
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
      new IsNullExpression(new ColumnExpression('template', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('template', 'deletedBy'), false),
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
      new IsNullExpression(new ColumnExpression('template', 'deletedAt'), true),
      new IsNullExpression(new ColumnExpression('template', 'deletedBy'), true),
    ]),
    1, 0
  ),

  $as: 'can_restore'
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
    'fileType',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('template', 'fileType'), '='),
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

query.register(
  'isActive',
  new Query({
    $where: [
      new IsNullExpression(new ColumnExpression('template', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('template', 'deletedBy'), false),
    ],
  })
)

export default query
