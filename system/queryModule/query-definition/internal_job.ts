import { QueryDef } from "classes/query/QueryDef";
import { AndExpressions, BinaryExpression, ColumnExpression, InExpression, IsNullExpression, MathExpression, OrExpressions, Query, Unknown, Value } from "node-jql";
import { IfExpression, IfNullExpression } from "utils/jql-subqueries";

const tableName = 'internal_job'

const query = new QueryDef(new Query({ $from: tableName }))

export default query.useShortcuts([
  // field:id
  {
    type: 'field',
    name: 'id',
    expression: new ColumnExpression(tableName, 'id'),
    registered: true
  },

  // field:category
  {
    type: 'field',
    name: 'category',
    expression: new ColumnExpression(tableName, 'category'),
    registered: true
  },

  // field:job
  {
    type: 'field',
    name: 'job',
    expression: new ColumnExpression(tableName, 'job'),
    registered: true
  },

  // field:status
  {
    type: 'field',
    name: 'status',
    expression: new ColumnExpression(tableName, 'status'),
    registered: true
  },

  // field:progress
  {
    type: 'field',
    name: 'progress',
    expression: re => IfExpression(
      new OrExpressions([
        new BinaryExpression(re['status'], '=', new Value('Pending')),
        new BinaryExpression(re['status'], '=', new Value('Running')),
        new BinaryExpression(re['status'], '=', new Value('Error'))
      ]),
      new ColumnExpression(tableName, 'progress'),
      new Value('--.--')
    )
  },

  // field:elapsed
  {
    type: 'field',
    name: 'elapsed',
    expression: IfNullExpression(
      new ColumnExpression(tableName, 'elapsed'),
      new Value(0)
    )
  },

  // field:createdAt
  {
    type: 'field',
    name: 'createdAt',
    expression: new ColumnExpression(tableName, 'createdAt')
  },

  // field:createdBy
  {
    type: 'field',
    name: 'createdBy',
    expression: new ColumnExpression(tableName, 'createdBy')
  },

  // field:error
  {
    type: 'field',
    name: 'error',
    expression: new MathExpression(new ColumnExpression(tableName, 'flexData'), '->>', new Value('$.error.message'))
  },

  // subquery:category
  {
    type: 'subquery',
    name: 'category',
    expression: re => new BinaryExpression(re['category'], '=', new Unknown()),
    unknowns: true
  },

  // subquery:status
  {
    type: 'subquery',
    name: 'status',
    expression: re => new InExpression(re['status'], false, new Unknown()),
    unknowns: true
  },

  // subquery:notDeleted
  {
    type: 'subquery',
    name: 'notDeleted',
    expression: new AndExpressions([
      new IsNullExpression(new ColumnExpression(tableName, 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression(tableName, 'deletedBy'), false)
    ])
  }
])