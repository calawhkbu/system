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
        table: 'party',
        $on: new BinaryExpression(
          new ColumnExpression('related_party', 'partyBId'),
          '=',
          new ColumnExpression('party', 'id'),
        )
      }
    )
  })
)

query
  .register(
    'id',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('related_party', 'partyAId'), '='),
    })
  )
  .register('value', 0)

query.register(
  'isActive',
  new Query({
    $where: [
      new IsNullExpression(new ColumnExpression('party', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('party', 'deletedBy'), false),
    ],
  })
)

export default query
