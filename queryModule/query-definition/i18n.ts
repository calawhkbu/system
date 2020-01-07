import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
  ResultColumn,
  FromTable,
  OrExpressions,
  RegexpExpression,
  ColumnExpression,
  BinaryExpression,
  InExpression,
  IsNullExpression,
  AndExpressions,
  FunctionExpression,
  Unknown,
  Value,
  JoinClause,
  GroupBy,
  QueryExpression,
  ExistsExpression,
} from 'node-jql'

const query = new QueryDef(
  new Query({
    $from : new FromTable('i18n'),

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

export default query
