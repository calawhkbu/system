import { QueryDef } from 'classes/query/QueryDef'
import {
  BinaryExpression,
  ColumnExpression,
  Query,
  FunctionExpression,
  AndExpressions,
  IsNullExpression,
  FromTable,
  ResultColumn,
  OrExpressions,
  Value,
  Unknown
} from 'node-jql'

const query = new QueryDef(new Query({

  $select : [

    new ResultColumn(new ColumnExpression('card_access', '*')),
    new ResultColumn(new ColumnExpression('card', 'reportingKey')),
    new ResultColumn(new ColumnExpression('card', 'category')),
    new ResultColumn(new ColumnExpression('card', 'name')),
    new ResultColumn(new ColumnExpression('card', 'description')),
    new ResultColumn(new ColumnExpression('card', 'component')),
    new ResultColumn(new ColumnExpression('card', 'jql')),

  ],

  $from : new FromTable('card_access', {
    operator: 'LEFT',
    table: 'card',
    $on: [
      new BinaryExpression(
        new ColumnExpression('card', 'uuid'),
        '=',
        new ColumnExpression('card_access', 'cardId')
      ),
    ],
  })
}))

query.register('isActive',
{
  expression : new FunctionExpression(
    'IF',
    new AndExpressions([
      new IsNullExpression(new ColumnExpression('card_access', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('card_access', 'deletedBy'), false),
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
      new IsNullExpression(new ColumnExpression('card_access', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('card_access', 'deletedBy'), false),
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
      new IsNullExpression(new ColumnExpression('card_access', 'deletedAt'), true),
      new IsNullExpression(new ColumnExpression('card_access', 'deletedBy'), true),
    ]),
    1, 0
  ),

  $as: 'canRestore'
})

// -----------------------
query
  .register(
    'partyGroupCode',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('partyGroupCode'), '='),
    })
  )
  .register('value', 0)

    // will have 2 options, active and deleted
    query.register('activeStatus', new Query({

      $where : new OrExpressions([

        new AndExpressions([

          new BinaryExpression(new Value('active'), '=', new Unknown('string')),

          // active case
          new IsNullExpression(new ColumnExpression('card_access', 'deletedAt'), false),
          new IsNullExpression(new ColumnExpression('card_access', 'deletedBy'), false)
        ]),

        new AndExpressions([
          new BinaryExpression(new Value('deleted'), '=', new Unknown('string')),
          // deleted case
          new IsNullExpression(new ColumnExpression('card_access', 'deletedAt'), true),
          new IsNullExpression(new ColumnExpression('card_access', 'deletedBy'), true)
        ])

      ])

    }))
    .register('value', 0)
    .register('value', 1)

export default query
