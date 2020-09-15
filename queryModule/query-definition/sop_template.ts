import { QueryDef } from "classes/query/QueryDef";
import { ColumnExpression, ResultColumn, BinaryExpression, FromTable, Unknown, OrExpressions, IsNullExpression, RegexpExpression, QueryExpression, Query, FunctionExpression, AndExpressions } from "node-jql";
import { IShortcut } from "classes/query/Shortcut";

const templateTable = 'sop_template'
const templateTemplateTaskTable = 'sop_template_template_task'

const query = new QueryDef({
  $from: new FromTable({
    table: templateTable
  })
})

const shortcuts: IShortcut[] = [
  // field:id
  {
    type: 'field',
    name: 'id',
    expression: new ColumnExpression(templateTable, 'id'),
    registered: true
  },

  // field:partyGroupCode
  {
    type: 'field',
    name: 'partyGroupCode',
    expression: new ColumnExpression(templateTable, 'partyGroupCode'),
    registered: true
  },

  // field:category
  {
    type: 'field',
    name: 'category',
    expression: new ColumnExpression(templateTable, 'category'),
    registered: true
  },

  // field:tableName
  {
    type: 'field',
    name: 'tableName',
    expression: new ColumnExpression(templateTable, 'tableName'),
    registered: true
  },

  // field:group
  {
    type: 'field',
    name: 'group',
    expression: new ColumnExpression(templateTable, 'group'),
    registered: true
  },

  // field:deletedAt
  {
    type: 'field',
    name: 'deletedAt',
    expression: new ColumnExpression(templateTable, 'deletedAt'),
    registered: true
  },

  // field:deletedBy
  {
    type: 'field',
    name: 'deletedBy',
    expression: new ColumnExpression(templateTable, 'deletedBy'),
    registered: true
  },

  // field:distinct-categories
  {
    type: 'field',
    name: 'distinct-categories',
    queryArg: re => () => ({
      $distinct: true,
      $select: new ResultColumn(re['category'], 'category')
    })
  },

  // field:noOfTasks
  {
    type: 'field',
    name: 'noOfTasks',
    expression: re => new QueryExpression(
      new Query({
        $select: new ResultColumn(new FunctionExpression('COUNT', 'taskId'), 'count'),
        $from: templateTemplateTaskTable,
        $where: [
          new BinaryExpression(new ColumnExpression(templateTemplateTaskTable, 'templateId'), '=', re['id']),
          new IsNullExpression(new ColumnExpression(templateTemplateTaskTable, 'deletedAt'), false),
          new IsNullExpression(new ColumnExpression(templateTemplateTaskTable, 'deletedBy'), false)
        ]
      })
    )
  },

  // subquery:partyGroupCode
  {
    type: 'subquery',
    name: 'partyGroupCode',
    expression: re => new BinaryExpression(re['partyGroupCode'], '=', new Unknown()),
    unknowns: true
  },

  // subquery:tableName
  {
    type: 'subquery',
    name: 'tableName',
    expression: re => new OrExpressions([
      new IsNullExpression(re['tableName'], false),
      new BinaryExpression(re['tableName'], '=', new Unknown())
    ]),
    unknowns: true
  },

  // subquery:category
  {
    type: 'subquery',
    name: 'category',
    expression: re => new BinaryExpression(re['category'], '=', new Unknown()),
    unknowns: true
  },

  // subquery:q
  {
    type: 'subquery',
    name: 'q',
    expression: re => new RegexpExpression(re['group'], false, new Unknown()),
    unknowns: true
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
