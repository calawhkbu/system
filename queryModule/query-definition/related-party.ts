import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
  ResultColumn,
  FromTable,
  ColumnExpression,
  BinaryExpression,
  IsNullExpression,
  FunctionExpression,
  ParameterExpression,
  AndExpressions,
  Value,
} from 'node-jql'

const query = new QueryDef(
  new Query({
    $from: new FromTable(
      new Query({
        $select: [
          new ResultColumn('partyAId'),
          new ResultColumn('partyBId'),
          new ResultColumn(new FunctionExpression('GROUP_CONCAT', new ParameterExpression('DISTINCT', new ColumnExpression('partyType'), 'SEPARATOR \', \'')), 'partyTypes'),
        ],
        $from: 'related_party',
        $group: {
          expressions: [
            new ColumnExpression('partyAId'),
            new ColumnExpression('partyBId'),
          ]
        },
        $where: [
          new IsNullExpression(new ColumnExpression('related_party', 'deletedBy'), false),
          new IsNullExpression(new ColumnExpression('related_party', 'deletedBy'), false),
        ],
      }),
      'related_party',
      {
        operator: 'LEFT',
        table: new FromTable('party', 'party'),
        $on: new AndExpressions([
          new IsNullExpression(new ColumnExpression('party', 'deletedAt'), false),
          new IsNullExpression(new ColumnExpression('party', 'deletedBy'), false),
          new BinaryExpression(
            new ColumnExpression('related_party', 'partyAId'),
            '=',
            new ColumnExpression('party', 'id'),
          )
        ])
      },
      {
        operator: 'LEFT',
        table: new FromTable('party', 'partyB'),
        $on: new AndExpressions([
          new IsNullExpression(new ColumnExpression('partyB', 'deletedAt'), false),
          new IsNullExpression(new ColumnExpression('partyB', 'deletedBy'), false),
          new BinaryExpression(
            new ColumnExpression('related_party', 'partyBId'),
            '=',
            new ColumnExpression('partyB', 'id'),
          )
        ])
      }
    )
  })
)

query.register(
  'partyAId',
  new Query({
    $where: new BinaryExpression(new ColumnExpression('related_party', 'partyAId'), '='),
  })
).register('value', 0)

query.register(
  'partyBId',
  new Query({
    $where: new BinaryExpression(new ColumnExpression('related_party', 'partyBId'), '='),
  })
).register('value', 0)

query.register('showDelete', {
  expression: new Value(1),
  $as: 'showDelete'
})

export default query
