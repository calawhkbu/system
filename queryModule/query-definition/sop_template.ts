import { QueryDef } from "classes/query/QueryDef";
import { ColumnExpression, ResultColumn, BinaryExpression, FromTable, Unknown, OrExpressions, IsNullExpression, RegexpExpression } from "node-jql";

const templateTable = 'sop_template'

const columns = [
  [templateTable, 'partyGroupCode'],  // @field partyGroupCode
  [templateTable, 'category'],  // @field category
  [templateTable, 'tableName']  // @field tableName
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





// @field distinct-categories
query.field('distinct-categories', {
  $distinct: true,
  $select: new ResultColumn(columnExpressions['category'], 'category')
})





// @subquery partyGroupCode
query.subquery('partyGroupCode', {
  $where: new BinaryExpression(columnExpressions['partyGroupCode'], '=', new Unknown())
}).register('value', 0)





// @subquery tableName
query.subquery('tableName', {
  $where: new OrExpressions([
    new IsNullExpression(columnExpressions['tableName'], false),
    new BinaryExpression(columnExpressions['tableName'], '=', new Unknown())
  ])
}).register('value', 0)





// @subquery category
query.subquery('category', {
  $where: new BinaryExpression(columnExpressions['category'], '=', new Unknown())
}).register('value', 0)





// @subquery q
query.subquery('q', {
  $where: new RegexpExpression(columnExpressions['group'], false, new Unknown())
}).register('value', 0)





export default query