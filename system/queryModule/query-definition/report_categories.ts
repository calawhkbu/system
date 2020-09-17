import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
  FromTable,
  ColumnExpression,
  BinaryExpression,
  IsNullExpression,
  InExpression,
  Unknown,
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
    }),
    $where: new IsNullExpression(new ColumnExpression('category'), true)
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
    'partyGroupCode',
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
