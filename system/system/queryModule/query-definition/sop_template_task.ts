import { QueryDef } from "classes/query/QueryDef";
import { ColumnExpression, ResultColumn, IsNullExpression, BinaryExpression, FunctionExpression, FromTable, JoinClause, Value, CaseExpression, Unknown, AndExpressions, MathExpression, OrExpressions, ICase, QueryExpression, Query, ExistsExpression, RegexpExpression } from "node-jql";
import { IShortcut } from "classes/query/Shortcut";

const taskTable = 'sop_task'
const templateTaskTable = 'sop_template_task'

const query = new QueryDef({
  $from: new FromTable({
    table: templateTaskTable
  })
})

const shortcuts: IShortcut[] = [
  // field:id
  {
    type: 'field',
    name: 'id',
    expression: new ColumnExpression(templateTaskTable, 'id'),
    registered: true
  },

  // field:partyGroupCode
  {
    type: 'field',
    name: 'partyGroupCode',
    expression: new ColumnExpression(templateTaskTable, 'partyGroupCode'),
    registered: true
  },

  // field:uniqueId
  {
    type: 'field',
    name: 'uniqueId',
    expression: new ColumnExpression(templateTaskTable, 'uniqueId'),
    registered: true
  },

  // field:parentId
  {
    type: 'field',
    name: 'parentId',
    expression: new ColumnExpression(templateTaskTable, 'parentId'),
    registered: true
  },

  // field:system
  {
    type: 'field',
    name: 'system',
    expression: new ColumnExpression(templateTaskTable, 'system'),
    registered: true
  },

  // field:category
  {
    type: 'field',
    name: 'category',
    expression: new ColumnExpression(templateTaskTable, 'category'),
    registered: true
  },

  // field:name
  {
    type: 'field',
    name: 'name',
    expression: new ColumnExpression(templateTaskTable, 'name'),
    registered: true
  },

  // field:description
  {
    type: 'field',
    name: 'description',
    expression: new ColumnExpression(templateTaskTable, 'description'),
    registered: true
  },

  // field:deletedAt
  {
    type: 'field',
    name: 'deletedAt',
    expression: new ColumnExpression(templateTaskTable, 'deletedAt'),
    registered: true
  },

  // field:deletedBy
  {
    type: 'field',
    name: 'deletedBy',
    expression: new ColumnExpression(templateTaskTable, 'deletedBy'),
    registered: true
  },

  // subquery:partyGroupCode
  {
    type: 'subquery',
    name: 'partyGroupCode',
    expression: re => new BinaryExpression(re['partyGroupCode'], '=', new Unknown()),
    unknowns: true
  },

  // subquery:category
  {
    type: 'subquery',
    name: 'category',
    expression: re => new BinaryExpression(re['category'], '=', new Unknown()),
    unknowns: true
  },

  // subquery:notExistsIn
  {
    type: 'subquery',
    name: 'notExistsIn',
    expression: re => new ExistsExpression(new Query({
      $from: taskTable,
      $where: new AndExpressions([
        new BinaryExpression(new ColumnExpression(taskTable, 'taskId'), '=', re['id']),
        new BinaryExpression(new ColumnExpression(taskTable, 'tableName'), '=', new Unknown()),
        new BinaryExpression(new ColumnExpression(taskTable, 'primaryKey'), '=', new Unknown()),
        new IsNullExpression(new ColumnExpression(taskTable, 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression(taskTable, 'deletedBy'), false)
      ])
    }), true),
    unknowns: [['tableName', 0], ['primaryKey', 1]]
  },

  // subquery:noSubTasks
  {
    type: 'subquery',
    name: 'noSubTasks',
    expression: re => new IsNullExpression(re['parentId'], false)
  },
  
  // subquery:subTasksOf
  {
    type: 'subquery',
    name: 'subTasksOf',
    expression: re => new BinaryExpression(re['parentId'], '=', new Unknown()),
    unknowns: true
  },

  // subquery:q
  {
    type: 'subquery',
    name: 'q',
    expression: re => new OrExpressions([
      new BinaryExpression(new FunctionExpression('CONCAT', re['partyGroupCode'], new Value('-'), re['uniqueId']), '=', new Unknown()),
      new RegexpExpression(re['system'], false, new Unknown()),
      new RegexpExpression(re['category'], false, new Unknown()),
      new RegexpExpression(re['name'], false, new Unknown()),
      new RegexpExpression(re['description'], false, new Unknown()),
    ]),
    unknowns: { noOfUnknowns: 5 }
  },

  // subquery:notDeleted
  {
    type: 'subquery',
    name: 'notDeleted',
    expression: re => new AndExpressions([
      new IsNullExpression(re['deletedAt'], false),
      new IsNullExpression(re['deletedBy'], false)
    ])
  }
]
export default query.useShortcuts(shortcuts)
