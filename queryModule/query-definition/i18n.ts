import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
  FromTable,
  OrExpressions,
  RegexpExpression,
  ColumnExpression,
  BinaryExpression,
  IsNullExpression,
  AndExpressions,
  FunctionExpression,
  Unknown,
  Value,
  ExistsExpression,
} from 'node-jql'

const query = new QueryDef(
  new Query({
    $from : new FromTable('i18n')
  })
)

query.register('canResetDefault',
{
  expression : new FunctionExpression(
    'IF',
    new IsNullExpression(new ColumnExpression('i18n', 'partyGroupCode'), true),
    1, 0
  ),

  $as: 'canResetDefault'
})
// ------------------- filter

query
  .register(
    'groupParty',
    new Query({
      $where : new OrExpressions([
        new IsNullExpression(new ColumnExpression('i18n', 'partyGroupCode'), true),
        new AndExpressions([
          new IsNullExpression(new ColumnExpression('i18n', 'partyGroupCode'), false),
          new ExistsExpression(new Query({
            $from : new FromTable({
              table : 'i18n',
              $as : 'b'
            }),
            $where : [
              new BinaryExpression(new ColumnExpression('b', 'category'), '=', new ColumnExpression('i18n', 'category')),
              new BinaryExpression(new ColumnExpression('b', 'key'), '=', new ColumnExpression('i18n', 'key')),
              new IsNullExpression(new ColumnExpression('b', 'partyGroupCode'), true)
            ]
          }), true)
        ])
      ])
    })
  )

query
  .register(
    'id',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('i18n', 'id'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'partyGroupCode',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('i18n', 'partyGroupCode'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'categoryLike',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('i18n', 'category'), false, new Unknown('string')),
    })
  )
  .register('value', 0)

  // isActive
  const isActiveConditionExpression = new AndExpressions([
    new IsNullExpression(new ColumnExpression('i18n', 'deletedAt'), false),
    new IsNullExpression(new ColumnExpression('i18n', 'deletedBy'), false)
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
