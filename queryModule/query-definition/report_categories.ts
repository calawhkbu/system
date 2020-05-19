import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
  ResultColumn,
  FromTable,
  OrExpressions,
  RegexpExpression,
  ColumnExpression,
  BinaryExpression,
  IsNullExpression,
  AndExpressions,
  InExpression,
  Unknown,
  Value,
} from 'node-jql'
import { registerAll } from 'utils/jql-subqueries'

const query = new QueryDef(
  new Query({
    $distinct: true,
    $select: 'category',
    $from: new FromTable('report', {
      operator: 'LEFT',
      table: 'person',
      $on: new BinaryExpression(new ColumnExpression('username'), '=', new ColumnExpression('report', 'createdBy'))
    })
  })
)

const baseTableName = 'report'
const fieldList = [
  'category',
  'reportingKey'
]

registerAll(query, baseTableName, fieldList)

// special logic of partyGroupCode
query
  .subquery(
    'partyGroupCodeIn',
    new Query({
      $where: new InExpression(
        new Unknown('string'),
        false,
        new Query({
          $distinct: true,
          $select: 'partyGroupCode',
          $from: new FromTable('party', {
            operator: 'LEFT',
            table: 'parties_person',
            $on: new BinaryExpression(new ColumnExpression('partyId'), '=', new ColumnExpression('party', 'id'))
          }),
          $where: new BinaryExpression(new ColumnExpression('personId'), '=', new ColumnExpression('person', 'id'))
        })
      )
    })
  )
  .register('value', 0)

export default query
