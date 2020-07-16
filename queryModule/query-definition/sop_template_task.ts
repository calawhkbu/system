import { QueryDef } from "classes/query/QueryDef";
import { ColumnExpression, ResultColumn, IsNullExpression, BinaryExpression, FunctionExpression, FromTable, JoinClause, Value, CaseExpression, Unknown, AndExpressions, MathExpression, OrExpressions, ICase, QueryExpression, Query, ExistsExpression, RegexpExpression } from "node-jql";

const taskTable = 'sop_task'
const templateTaskTable = 'sop_template_task'

const columns = [
  [templateTaskTable, 'id'],
  [templateTaskTable, 'partyGroupCode'],
  [templateTaskTable, 'uniqueId'],
  [templateTaskTable, 'system'],
  [templateTaskTable, 'category'],
  [templateTaskTable, 'name'],
  [templateTaskTable, 'description']
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





query.subquery('notExistsIn', {
  $where: new ExistsExpression(new Query({
    $from: taskTable,
    $where: new AndExpressions([
      new BinaryExpression(new ColumnExpression(taskTable, 'taskId'), '=', columnExpressions['id']),
      new BinaryExpression(new ColumnExpression(taskTable, 'tableName'), '=', new Unknown()),
      new BinaryExpression(new ColumnExpression(taskTable, 'primaryKey'), '=', new Unknown())
    ])
  }), true)
}).register('tableName', 0).register('primaryKey', 0)





query.subquery('q', {
  $where: new OrExpressions([
    new BinaryExpression(new FunctionExpression('CONCAT', columnExpressions['partyGroupCode'], new Value('-'), columnExpressions['uniqueId']), '=', new Unknown()),
    new RegexpExpression(columnExpressions['system'], false, new Unknown()),
    new RegexpExpression(columnExpressions['category'], false, new Unknown()),
    new RegexpExpression(columnExpressions['name'], false, new Unknown()),
    new RegexpExpression(columnExpressions['description'], false, new Unknown()),
  ])
}).register('value', 0).register('value', 1).register('value', 2).register('value', 3).register('value', 4)





export default query