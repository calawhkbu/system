import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
  FromTable,
  BinaryExpression,
  ColumnExpression,
  RegexpExpression,
  IsNullExpression,
  InExpression,
  ResultColumn,
  Value,
  FunctionExpression,
  AndExpressions,
  OrExpressions,
  Unknown,
  JoinClause,
  IExpression,
  LikeExpression
} from 'node-jql'
import { registerAll } from 'utils/jql-subqueries'

const tableName = 'task'
const query = new QueryDef(
  new Query({
    $from: new FromTable(
      tableName
    ),
  })
)

const fieldList = [
  'id',
  'taskId',
  'taskName',
  'data',
  'result',
  'error',
  'workerId',
  'status',
  'registerAt',
  'runAt',
  'closeAt',

  'createdAt',
  'updatedAt',
  'deletedAt',

  'createBy',
  'updatedBy',
  'deletedBy',
]

registerAll(query, tableName, fieldList)

export default query
