import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
  FromTable,
  ColumnExpression,
  BinaryExpression,
  IsNullExpression,
  AndExpressions,
  Value,
  ResultColumn,
  FunctionExpression,
  ParameterExpression,
  RegexpExpression,
  InExpression
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

query.register('showDelete', {
  expression: new Value(1),
  $as: 'showDelete'
})

query.register('partyAId', {
  expression: new ColumnExpression('related_party', 'partyAId'),
  $as: 'partyAId'
})

query.register('partyBId', {
  expression: new ColumnExpression('related_party', 'partyBId'),
  $as: 'partyBId'
})

query.register('partyAName', {
  expression: new ColumnExpression('party', 'name'),
  $as: 'partyAName'
})

query.register('partyBName', {
  expression: new ColumnExpression('partyB', 'name'),
  $as: 'partyBName'
})

query.register('partyBShortName', {
  expression: new ColumnExpression('partyB', 'shortName'),
  $as: 'partyBShortName'
})

query.register('partyBGroupName', {
  expression: new ColumnExpression('partyB', 'groupName'),
  $as: 'partyBGroupName'
})

query.register('partyType', {
  expression: new ColumnExpression('related_party', 'partyType'),
  $as: 'partyType'
})

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

query.register(
  'shortName',
  new Query({
    $where: new RegexpExpression(new ColumnExpression('partyB', 'shortName'), false),
  })
).register('value', 0)

query.register(
  'groupName',
  new Query({
    $where: new RegexpExpression(new ColumnExpression('partyB', 'groupName'), false),
  })
).register('value', 0)

query.register(
  'partyType',
  new Query({
    $where: new InExpression(new ColumnExpression('related_party', 'partyType'), false),
  })
).register('value', 0)

export default query
