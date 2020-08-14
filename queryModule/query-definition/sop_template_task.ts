import { QueryDef } from "classes/query/QueryDef";
import { ColumnExpression, ResultColumn, IsNullExpression, BinaryExpression, FunctionExpression, FromTable, JoinClause, Value, CaseExpression, Unknown, AndExpressions, MathExpression, OrExpressions, ICase, QueryExpression, Query, ExistsExpression, RegexpExpression } from "node-jql";

const taskTable = 'sop_task'
const templateTaskTable = 'sop_template_task'

const columns = [
  [templateTaskTable, 'id'],  // @field id
  [templateTaskTable, 'partyGroupCode'],  // @field partyGroupCode
  [templateTaskTable, 'uniqueId'],  // @field uniqueId
  [templateTaskTable, 'parentId'],  // @field parentId
  [templateTaskTable, 'system'],  // @field system
  [templateTaskTable, 'category'],  // @field category
  [templateTaskTable, 'name'],  // @field name
  [templateTaskTable, 'description'], // @field description
  [templateTaskTable, 'deletedAt'], // @field deletedAt
  [templateTaskTable, 'deletedBy']  // @field deletedBy
]

const columnExpressions: { [key: string]: ColumnExpression } = columns.reduce((r, [table, name, as = name]) => {
  r[as] = new ColumnExpression(table, name)
  return r
}, {})





const query = new QueryDef({
  $from: new FromTable({
    table: templateTaskTable
  })
})

for (const [table, name, as = name] of columns) {
  query.field(as, { $select: new ResultColumn(columnExpressions[as], as) })
}





// @subquery notExistsIn
query.subquery('notExistsIn', {
  $where: new ExistsExpression(new Query({
    $from: taskTable,
    $where: new AndExpressions([
      new BinaryExpression(new ColumnExpression(taskTable, 'taskId'), '=', columnExpressions['id']),
      new BinaryExpression(new ColumnExpression(taskTable, 'tableName'), '=', new Unknown()),
      new BinaryExpression(new ColumnExpression(taskTable, 'primaryKey'), '=', new Unknown()),
      new IsNullExpression(new ColumnExpression(taskTable, 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression(taskTable, 'deletedBy'), false)
    ])
  }), true)
}).register('tableName', 0).register('primaryKey', 0)





// @subquery q
query.subquery('q', {
  $where: new OrExpressions([
    new BinaryExpression(new FunctionExpression('CONCAT', columnExpressions['partyGroupCode'], new Value('-'), columnExpressions['uniqueId']), '=', new Unknown()),
    new RegexpExpression(columnExpressions['system'], false, new Unknown()),
    new RegexpExpression(columnExpressions['category'], false, new Unknown()),
    new RegexpExpression(columnExpressions['name'], false, new Unknown()),
    new RegexpExpression(columnExpressions['description'], false, new Unknown()),
  ])
}).register('value', 0).register('value', 1).register('value', 2).register('value', 3).register('value', 4)





// @subquery notDeleted
// hide deleted
query.subquery('notDeleted', {
  $where: [
    new IsNullExpression(columnExpressions['deletedAt'], false),
    new IsNullExpression(columnExpressions['deletedBy'], false)
  ]
})





// @subquery noSubTasks
// hide sub tasks
query.subquery('noSubTasks', {
  $where: new IsNullExpression(columnExpressions['parentId'], false)
})





// @subquery subTasksOf
query.subquery('subTasksOf', {
  $where: new BinaryExpression(columnExpressions['parentId'], '=', new Unknown())
}).register('value', 0)





export default query