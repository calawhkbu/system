import { QueryDef } from "classes/query/QueryDef";
import { ColumnExpression, ResultColumn, OrExpressions, IsNullExpression, BinaryExpression, FunctionExpression, FromTable, JoinClause, Value, CaseExpression, Unknown, AndExpressions } from "node-jql";

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

const statusAtExpression = new FunctionExpression('JSON_EXTRACT',
  columnExpressions['statusList'],
  '$[0].statusAt'
)
query.field('statusAt', {
  $select: new ResultColumn(statusAtExpression, 'statusAt')
})

const statusByExpression = new FunctionExpression('JSON_EXTRACT',
  columnExpressions['statusList'],
  '$[0].statusBy'
)
query.field('statusBy', {
  $select: new ResultColumn(statusByExpression, 'statusBy')
})

const isDoneExpression = new BinaryExpression(
  new FunctionExpression('JSON_EXTRACT',
    columnExpressions['statusList'],
    '$[0].status'
  ),
  '=',
  new Value('Done')
)
query.field('isDone', params => {
  const me = typeof params.subqueries.user === 'object' && 'value' in params.subqueries.user ? params.subqueries.user.value : ''
  const byMeExpression = new BinaryExpression(statusByExpression, '=', me)
  return { $select: new ResultColumn(new CaseExpression(
    [
      {
        $when: new AndExpressions([isDoneExpression, byMeExpression]),
        $then: new Value(1)
      },
      {
        $when: isDoneExpression,
        $then: new Value(2)
      },
      {
        $when: new BinaryExpression(statusExpression, '=', new Value('Not Ready')),
        $then: new Value(-1)
      },
    ],
    new Value(0)
  ), 'isDone') }
})

const isDueExpression = new FunctionExpression('IF',
  new BinaryExpression(columnExpressions['dueAt'], '<', new FunctionExpression('NOW')),
  new Value(1),
  new Value(0)
)
query.field('isDue', {
  $select: new ResultColumn(isDueExpression, 'isDue')
})

const isDeadExpression = new FunctionExpression('IF',
  new BinaryExpression(columnExpressions['deadline'], '<', new FunctionExpression('NOW')),
  new Value(1),
  new Value(0)
)
query.field('isDead', {
  $select: new ResultColumn(isDeadExpression, 'isDead')
})

const isStartedExpression = new FunctionExpression('IF',
  new BinaryExpression(columnExpressions['startAt'], '<', new FunctionExpression('NOW')),
  new Value(1),
  new Value(0)
)
const statusExpression = new CaseExpression(
  [
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
  ],
  new Value('Not Ready')
)
query.field('status', {
  $select: new ResultColumn(statusExpression, 'status')
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

const latestRemarkExpression = new FunctionExpression('JSON_EXTRACT',
  columnExpressions['remark'],
  new Value('$[0].message')
)
query.field('latestRemark', {
  $select: new ResultColumn(latestRemarkExpression, 'latestRemark')
})

const latestRemarkAtExpression = new FunctionExpression('JSON_EXTRACT',
  columnExpressions['remark'],
  new Value('$[0].messageAt')
)
query.field('latestRemarkAt', {
  $select: new ResultColumn(latestRemarkAtExpression, 'latestRemarkAt')
})

const latestRemarkByExpression = new FunctionExpression('JSON_EXTRACT',
  columnExpressions['remark'],
  new Value('$[0].messageBy')
)
query.field('latestRemarkBy', {
  $select: new ResultColumn(latestRemarkByExpression, 'latestRemarkBy')
})

query.subquery('tableName', {
  $where: new BinaryExpression(columnExpressions['tableName'], '=', new Unknown())
}).register('value', 0)

query.subquery('primaryKey', {
  $where: new BinaryExpression(columnExpressions['primaryKey'], '=', new Unknown())
}).register('value', 0)

export default query