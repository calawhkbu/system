import { QueryDef } from "classes/query/QueryDef";
import { ColumnExpression, ResultColumn, BinaryExpression, FromTable, Unknown, OrExpressions, IsNullExpression } from "node-jql";

const templateTable = 'sop_template'

const columns = [
  [templateTable, 'partyGroupCode'],
  [templateTable, 'category'],
  [templateTable, 'tableName']
]

const columnExpressions: { [key: string]: ColumnExpression } = columns.reduce((r, [table, name, as = name]) => {
  r[as] = new ColumnExpression(table, name)
  return r
}, {})





const query = new QueryDef({
  $from: new FromTable({
    table: templateTable
  })
})

for (const [table, name, as = name] of columns) {
  query.field(as, { $select: new ResultColumn(columnExpressions[as], as) })
}





query.field('distinct-categories', {
  $distinct: true,
  $select: new ResultColumn(columnExpressions['category'], 'category')
})





query.subquery('partyGroupCode', {
  $where: new BinaryExpression(columnExpressions['partyGroupCode'], '=', new Unknown())
}).register('value', 0)





query.subquery('tableName', {
  $where: new OrExpressions([
    new IsNullExpression(columnExpressions['tableName'], false),
    new BinaryExpression(columnExpressions['tableName'], '=', new Unknown())
  ])
}).register('value', 0)





export default query