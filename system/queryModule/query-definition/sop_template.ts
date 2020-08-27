import { QueryDef } from "classes/query/QueryDef";
import { ColumnExpression, ResultColumn, BinaryExpression, FromTable, Unknown, OrExpressions, IsNullExpression, RegexpExpression, QueryExpression, Query, FunctionExpression } from "node-jql";

const templateTable = 'sop_template'
const templateTemplateTaskTable = 'sop_template_template_task'

const columns = [
  [templateTable, 'id'],  // @field id
  [templateTable, 'partyGroupCode'],  // @field partyGroupCode
  [templateTable, 'category'],  // @field category
  [templateTable, 'tableName'], // @field tableName
  [templateTable, 'group'], // @field group
  [templateTable, 'deletedAt'], // @field deletedAt
  [templateTable, 'deletedBy']  // @field deletedBy
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





// @field noOfTasks
const noOfTasksQuery = new Query({
  $select: new ResultColumn(new FunctionExpression('COUNT', 'taskId'), 'count'),
  $from: templateTemplateTaskTable,
  $where: [
    new BinaryExpression(new ColumnExpression(templateTemplateTaskTable, 'templateId'), '=', columnExpressions['id']),
    new IsNullExpression(new ColumnExpression(templateTemplateTaskTable, 'deletedAt'), false),
    new IsNullExpression(new ColumnExpression(templateTemplateTaskTable, 'deletedBy'), false)
  ]
})
query.field('noOfTasks', {
  $select: new ResultColumn(new QueryExpression(noOfTasksQuery), 'noOfTasks')
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





// @subquery notDeleted
// hide deleted
query.subquery('notDeleted', {
  $where: [
    new IsNullExpression(columnExpressions['deletedAt'], false),
    new IsNullExpression(columnExpressions['deletedBy'], false)
  ]
})





export default query