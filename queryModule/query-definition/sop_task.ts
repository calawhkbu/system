import { QueryDef } from "classes/query/QueryDef";
import { ColumnExpression, ResultColumn, IsNullExpression, BinaryExpression, FunctionExpression, FromTable, JoinClause, Value, CaseExpression, Unknown, AndExpressions, MathExpression, OrExpressions, ICase } from "node-jql";

const mainTable = 'sop_task'
const joinTable = 'sop_template_task'

const columns = [
  [mainTable, 'id'],
  [mainTable, 'tableName'],
  [mainTable, 'primaryKey'],
  [mainTable, 'seqNo'],
  [mainTable, 'taskId'],
  [mainTable, 'remark'],
  [mainTable, 'startAt'],
  [mainTable, 'dueAt'],
  [mainTable, 'deadline'],
  [mainTable, 'statusList'],
  [mainTable, 'closed', 'isClosed'],
  [mainTable, 'deletedBy'],
  [mainTable, 'deletedAt'],
  [joinTable, 'id', 'templateTaskId'],
  [joinTable, 'partyGroupCode'],
  [joinTable, 'uniqueId', 'partyGroupTaskId'],
  [joinTable, 'system'],
  [joinTable, 'category'],
  [joinTable, 'group'],
  [joinTable, 'name'],
  [joinTable, 'description']
]

const columnExpressions: { [key: string]: ColumnExpression } = columns.reduce((r, [table, name, as = name]) => {
  r[as] = new ColumnExpression(table, name)
  return r
}, {})





const query = new QueryDef({
  $from: new FromTable({
    table: mainTable,
    joinClauses: new JoinClause('LEFT', joinTable,
      new BinaryExpression(columnExpressions['taskId'], '=', columnExpressions['templateTaskId'])
    )
  })
})

for (const [table, name, as = name] of columns) {
  query.field(as, { $select: new ResultColumn(columnExpressions[as], as) })
}





const uniqueIdExpression = new FunctionExpression(
  'CONCAT',
  new Value('T-'),
  columnExpressions['partyGroupTaskId']
)
query.field('uniqueId', {
  $select: new ResultColumn(uniqueIdExpression, 'uniqueId')
})





const statusAtExpression = new MathExpression(
  columnExpressions['statusList'],
  '->>',
  new Value('$[0].statusAt')
)
query.field('statusAt', {
  $select: new ResultColumn(statusAtExpression, 'statusAt')
})





const statusByExpression = new MathExpression(
  columnExpressions['statusList'],
  '->>',
  new Value('$[0].statusBy')
)
query.field('statusBy', params => {
  const me = params.subqueries && typeof params.subqueries.user === 'object' && 'value' in params.subqueries.user ? params.subqueries.user.value : ''
  const byMeExpression = new BinaryExpression(statusByExpression, '=', me)
  return { $select: new ResultColumn(new FunctionExpression('IF',
    byMeExpression,
    new Value('me'),
    statusByExpression,
  ), 'statusBy') }
})





// is done or is closed, given that closed must come after done
const isDoneExpression = new BinaryExpression(
  new MathExpression(
    columnExpressions['statusList'],
    '->>',
    new Value('$[0].status')
  ),
  '=',
  new Value('Done')
)
query.field('isDone', {
  $select: new ResultColumn(new FunctionExpression('IF',
    new OrExpressions([isDoneExpression, columnExpressions['isClosed']]),
    new Value(1),
    new Value(0)
  ), 'isDone')
})





const isDueExpression = new FunctionExpression('IF',
  new BinaryExpression(
    columnExpressions['dueAt'],
    '<',
    new FunctionExpression('UTC_TIMESTAMP')
  ),
  new Value(1),
  new Value(0)
)
query.field('isDue', {
  $select: new ResultColumn(isDueExpression, 'isDue')
})





const isDeadExpression = new FunctionExpression('IF',
  new BinaryExpression(
    columnExpressions['deadline'],
    '<',
    new FunctionExpression('UTC_TIMESTAMP')
  ),
  new Value(1),
  new Value(0)
)
query.field('isDead', {
  $select: new ResultColumn(isDeadExpression, 'isDead')
})





const isDeletedExpression = new OrExpressions([
  new IsNullExpression(columnExpressions['deletedBy'], true),
  new IsNullExpression(columnExpressions['deletedAt'], true)
])
query.field('isDeleted', {
  $select: new ResultColumn(isDeletedExpression, 'isDeleted')
})





const isStartedExpression = new FunctionExpression('IF',
  new BinaryExpression(
    columnExpressions['startAt'],
    '<',
    new FunctionExpression('UTC_TIMESTAMP')
  ),
  new Value(1),
  new Value(0)
)
query.field('status', params => {
  const cases: ICase[] = [
    {
      $when: isDeletedExpression,
      $then: new Value('Deleted')
    },
    {
      $when: columnExpressions['isClosed'],
      $then: new Value('Closed')
    },
    {
      $when: isDoneExpression,
      $then: new Value('Done')
    },
    {
      $when: isDeadExpression,
      $then: new Value('Dead')
    },
    {
      $when: isDueExpression,
      $then: new Value('Due')
    },
    {
      $when: isStartedExpression,
      $then: new Value('Open')
    }
  ]
  if (params.subqueries && typeof params.subqueries.today === 'object' && 'from' in params.subqueries.today) {
    cases.splice(5, 0, {
      $when: new AndExpressions([
        isStartedExpression,
        new BinaryExpression(new Value(params.subqueries.today.from), '<=', columnExpressions['dueAt']),
        new BinaryExpression(columnExpressions['dueAt'], '<=', new Value(params.subqueries.today.to))
      ]),
      $then: new Value('Due Today')
    })
  }
  const statusExpression = new CaseExpression(cases, new Value('Not Ready'))
  return {
    $select: new ResultColumn(statusExpression, 'status')
  }
})





const hasRemarkExpression = new FunctionExpression('IF',
  new IsNullExpression(columnExpressions['remark'], true),
  new Value(1),
  new Value(0)
)
query.field('hasRemark', {
  $select: new ResultColumn(hasRemarkExpression, 'hasRemark')
})





const numberRemarksExpression = new FunctionExpression('JSON_LENGTH', columnExpressions['remark'])
query.field('noOfRemarks', {
  $select: new ResultColumn(numberRemarksExpression, 'noOfRemarks')
})





const latestRemarkExpression = new MathExpression(
  columnExpressions['remark'],
  '->>',
  new Value('$[0].message')
)
query.field('latestRemark', {
  $select: new ResultColumn(latestRemarkExpression, 'latestRemark')
})





const latestRemarkAtExpression = new MathExpression(
  columnExpressions['remark'],
  '->>',
  new Value('$[0].messageAt')
)
query.field('latestRemarkAt', {
  $select: new ResultColumn(latestRemarkAtExpression, 'latestRemarkAt')
})





const latestRemarkByExpression = new MathExpression(
  columnExpressions['remark'],
  '->>',
  new Value('$[0].messageBy')
)
query.field('latestRemarkBy', params => {
  const me = typeof params.subqueries.user === 'object' && 'value' in params.subqueries.user ? params.subqueries.user.value : ''
  const byMeExpression = new BinaryExpression(latestRemarkByExpression, '=', me)
  return { $select: new ResultColumn(new FunctionExpression('IF',
    byMeExpression,
    new Value('me'),
    latestRemarkByExpression,
  ), 'latestRemarkBy') }
})





query.subquery('tableName', {
  $where: new BinaryExpression(columnExpressions['tableName'], '=', new Unknown())
}).register('value', 0)





query.subquery('primaryKey', {
  $where: new BinaryExpression(columnExpressions['primaryKey'], '=', new Unknown())
}).register('value', 0)





export default query