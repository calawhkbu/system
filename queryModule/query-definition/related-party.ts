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
  ParameterExpression
} from 'node-jql'
import { registerAll } from 'utils/jql-subqueries'

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

const partyANameExpression = new ColumnExpression('party', 'name')
const partyBNameExpression = new ColumnExpression('partyB', 'name')

const partyBShortNameExpression = new ColumnExpression('partyB', 'shortName')
const partyBGroupNameExpression = new ColumnExpression('partyB', 'groupName')

const partyTypesExpression = new FunctionExpression('GROUP_CONCAT', new ParameterExpression('DISTINCT', new ColumnExpression('partyType'), 'SEPARATOR \', \''))

const baseTableName = 'related_party'
const fieldList = [

  'partyAId',
  'partyBId',
  'partyType',
  {
    name : 'showDelete',
    expression : new Value(1)
  },
  {
    name : 'partyBShortName',
    expression : partyBShortNameExpression
  },
  {
    name : 'partyBGroupName',
    expression : partyBGroupNameExpression

  },
  {
    name : 'partyAName',
    expression : partyANameExpression
  },

  {
    name : 'partyBName',
    expression : partyBNameExpression
  }

]

registerAll(query, baseTableName, fieldList)

// shortName => partyBShortNameLike
// groupBName => partyBGroupNameLike

export default query
