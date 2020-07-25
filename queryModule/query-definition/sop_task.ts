import { QueryDef } from "classes/query/QueryDef";
import { ColumnExpression, ResultColumn, IsNullExpression, BinaryExpression, FunctionExpression, FromTable, JoinClause, Value, CaseExpression, Unknown, AndExpressions, MathExpression, OrExpressions, ICase, QueryExpression, Query, ExistsExpression, IExpression, InExpression, Expression, BinaryOperator } from "node-jql";
import { IfExpression } from 'utils/jql-subqueries'

const taskTable = 'sop_task'
const templateTaskTable = 'sop_template_task'
const selectedTemplateTable = 'sop_selected_template'
const templateTable = 'sop_template'
const bookingTable = 'booking'
const shipmentTable = 'shipment'

function table(name: string): string {
  return `table:${name}`
}

const columns = [
  [taskTable, 'id'],
  [taskTable, 'tableName'],
  [taskTable, 'primaryKey'],
  [taskTable, 'seqNo'],
  [taskTable, 'templateId'],
  [taskTable, 'taskId'],
  [taskTable, 'parentId'],
  [taskTable, 'remark'],
  [taskTable, 'startAt'],
  [taskTable, 'dueAt'],
  [taskTable, 'deadline'],
  [taskTable, 'statusList'],
  [taskTable, 'closedAt'],
  [taskTable, 'closedBy'],
  [taskTable, 'deletedAt'],
  [taskTable, 'deletedBy'],
  [templateTaskTable, 'id', 'originalTaskId', table(templateTaskTable)],
  [templateTaskTable, 'partyGroupCode', 'partyGroupCode', table(templateTaskTable)],
  [templateTaskTable, 'uniqueId', 'partyGroupTaskId', table(templateTaskTable)],
  [templateTaskTable, 'system', 'system', table(templateTaskTable)],
  [templateTaskTable, 'category', 'category', table(templateTaskTable)],
  [templateTaskTable, 'name', 'name', table(templateTaskTable)],
  [templateTaskTable, 'description', 'description', table(templateTaskTable)],
  [selectedTemplateTable, 'id', 'originalSelectedTemplateId', table(selectedTemplateTable)],
  [selectedTemplateTable, 'templateId', 'selectedTemplateId', table(selectedTemplateTable)],
  [templateTable, 'id', 'originalTemplateId', table(templateTable)],
  [templateTable, 'group', 'group', table(templateTable)],
  [bookingTable, 'bookingTeam', 'bookingTeam', table(bookingTable)],
  [shipmentTable, 'shipmentTeam', 'shipmentTeam', table(shipmentTable)]
]

const columnExpressions: { [key: string]: ColumnExpression } = columns.reduce((r, [table, name, as = name]) => {
  r[as] = new ColumnExpression(table, name)
  return r
}, {})





const query = new QueryDef({
  $from: taskTable
})

// table:booking
query.table(bookingTable, {
  $from: new FromTable(taskTable, new JoinClause('LEFT', bookingTable,
    new AndExpressions([
      new BinaryExpression(columnExpressions['tableName'], '=', bookingTable),
      new BinaryExpression(columnExpressions['primaryKey'], '=', new ColumnExpression(bookingTable, 'id'))
    ])
  ))
})

// table:shipment
query.table(shipmentTable, {
  $from: new FromTable(taskTable, new JoinClause('LEFT', shipmentTable,
    new AndExpressions([
      new BinaryExpression(columnExpressions['tableName'], '=', shipmentTable),
      new BinaryExpression(columnExpressions['primaryKey'], '=', new ColumnExpression(shipmentTable, 'id'))
    ])
  ))
})

// table:sop_template_task
query.table(templateTaskTable, {
  $from: new FromTable(taskTable, new JoinClause('LEFT', templateTaskTable,
    new BinaryExpression(columnExpressions['taskId'], '=', columnExpressions['originalTaskId'])
  ))
})

// table:sop_selected_template
query.table(selectedTemplateTable, {
  $from: new FromTable(taskTable, new JoinClause('LEFT', selectedTemplateTable,
    new BinaryExpression(columnExpressions['templateId'], '=', columnExpressions['originalSelectedTemplateId'])
  ))
})

// table:sop_template
query.table(templateTable, {
  $from: new FromTable(taskTable, new JoinClause('LEFT', templateTable,
    new BinaryExpression(columnExpressions['selectedTemplateId'], '=', columnExpressions['originalTemplateId'])
  ))
}, table(selectedTemplateTable))

// declared fields
for (const [table, name, as = name, ...companions] of columns) {
  query.field(as, { $select: new ResultColumn(columnExpressions[as], as) }, ...companions)
}





// party group unique task ID
const uniqueIdExpression = new FunctionExpression(
  'CONCAT',
  columnExpressions['partyGroupCode'],
  new Value('-'),
  columnExpressions['partyGroupTaskId']
)
query.field('uniqueId', {
  $select: new ResultColumn(uniqueIdExpression, 'uniqueId')
}, table(templateTaskTable))





// is deleted
function generalIsDeletedExpression(table = taskTable, not = false) {
  return not
    ? new AndExpressions([
        new IsNullExpression(new ColumnExpression(table, 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression(table, 'deletedBy'), false)
      ])
    : new OrExpressions([
        new IsNullExpression(new ColumnExpression(table, 'deletedAt'), true),
        new IsNullExpression(new ColumnExpression(table, 'deletedBy'), true)
      ])
}
query.field('isDeleted', {
  $select: new ResultColumn(generalIsDeletedExpression(), 'isDeleted')
})





// has sub-tasks
function hasSubTaskQuery(table: string, ...expressions: IExpression[]) {
  return new Query({
    $from: new FromTable(taskTable, table),
    $where: new AndExpressions([
      new BinaryExpression(columnExpressions['tableName'], '=', new ColumnExpression(table, 'tableName')),
      new BinaryExpression(columnExpressions['primaryKey'], '=', new ColumnExpression(table, 'primaryKey')),
      new BinaryExpression(columnExpressions['id'], '=', new ColumnExpression(table, 'parentId')),
      generalIsDeletedExpression(table, true),
      ...expressions
    ])
  })
}
const hasSubTasksExpression = new ExistsExpression(
  hasSubTaskQuery('temp'),
  false
)
query.field('hasSubTasks', {
  $select: new ResultColumn(hasSubTasksExpression, 'hasSubTasks')
})





// is closed
function generalIsClosedExpression(table = taskTable, not = false) {
  return not
    ? new AndExpressions([
      new IsNullExpression(new ColumnExpression(table, 'closedAt'), false),
      new IsNullExpression(new ColumnExpression(table, 'closedBy'), false)
    ])
    : new OrExpressions([
      new IsNullExpression(new ColumnExpression(table, 'closedAt'), true),
      new IsNullExpression(new ColumnExpression(table, 'closedBy'), true)
    ])
}
const isClosedExpression = IfExpression(
  hasSubTasksExpression,
  new ExistsExpression(hasSubTaskQuery('temp', generalIsClosedExpression('temp', true)), true),
  generalIsClosedExpression()
)
query.field('isClosed', {
  $select: new ResultColumn(isClosedExpression, 'isClosed')
})





// is done or is closed, given that closed must come after done
function getLastStatusExpression(status: string, table = taskTable, operator: BinaryOperator = '=') {
  return new BinaryExpression(
    new MathExpression(new ColumnExpression(table, 'statusList'), '->>', new Value('$[0].status')),
    operator, new Value(status)
  )
}
function generalIsDoneExpression(table = taskTable, not = false) {
  return not
    ? new AndExpressions([
        getLastStatusExpression('Closed', table, '<>'),
        getLastStatusExpression('Done', table, '<>')
      ])
    : new OrExpressions([
        getLastStatusExpression('Closed', table),
        getLastStatusExpression('Done', table)
      ])
}
const isDoneExpression = IfExpression(
  hasSubTasksExpression,
  new ExistsExpression(hasSubTaskQuery('temp', generalIsDoneExpression('temp', true)), true),
  generalIsDoneExpression()
)
query.field('isDone', {
  $select: new ResultColumn(isDoneExpression, 'isDone')
})





// is due
const isDueExpression = new BinaryExpression(
  columnExpressions['dueAt'],
  '<',
  new FunctionExpression('UTC_TIMESTAMP')
)
query.field('isDue', {
  $select: new ResultColumn(isDueExpression, 'isDue')
})





// is due today
query.field('isDueToday', params => {
  let expression: Expression
  if (params.subqueries && typeof params.subqueries.today === 'object' && 'from' in params.subqueries.today) {
    expression = new AndExpressions([
      isStartedExpression,
      new BinaryExpression(new Value(params.subqueries.today.from), '<=', columnExpressions['dueAt']),
      new BinaryExpression(columnExpressions['dueAt'], '<=', new Value(params.subqueries.today.to))
    ])
  }
  else {
    expression = new Value(0)
  }
  return { $select: new ResultColumn(expression, 'isDueToday') }
})





// is dead
const isDeadExpression = new BinaryExpression(
  columnExpressions['deadline'],
  '<',
  new FunctionExpression('UTC_TIMESTAMP')
)
query.field('isDead', {
  $select: new ResultColumn(isDeadExpression, 'isDead')
})





// last status
const isStartedExpression = new OrExpressions([
  new IsNullExpression(columnExpressions['startAt'], false),
  new BinaryExpression(
    columnExpressions['startAt'],
    '<',
    new FunctionExpression('UTC_TIMESTAMP')
  )
])
query.field('status', {
  $select: new ResultColumn(
    new CaseExpression(
      [
        {
          $when: generalIsDeletedExpression(),
          $then: new Value('Deleted')
        },
        {
          $when: isClosedExpression,
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
      ],
      new Value('Not Ready')
    ),
  'status')
})





// last status at
const statusAtExpression = new CaseExpression(
  [
    {
      $when: generalIsDeletedExpression(),
      $then: new Value(null)
    },
    {
      $when: isClosedExpression,
      $then: columnExpressions['closedAt']
    }
  ],
  new MathExpression(
    columnExpressions['statusList'],
    '->>',
    new Value('$[0].statusAt')
  )
)
query.field('statusAt', {
  $select: new ResultColumn(statusAtExpression, 'statusAt')
})





// last status by
const statusByExpression = new CaseExpression(
  [
    {
      $when: generalIsDeletedExpression(),
      $then: new Value(null)
    },
    {
      $when: isClosedExpression,
      $then: columnExpressions['closedBy']
    }
  ],
  new MathExpression(
    columnExpressions['statusList'],
    '->>',
    new Value('$[0].statusBy')
  )
)
query.field('statusBy', params => {
  const me = params.subqueries && typeof params.subqueries.user === 'object' && 'value' in params.subqueries.user ? params.subqueries.user.value : ''
  const byMeExpression = new BinaryExpression(statusByExpression, '=', me)
  return { $select: new ResultColumn(IfExpression(byMeExpression, new Value('me'), statusByExpression), 'statusBy') }
})





// number of remarks
const numberRemarksExpression = new FunctionExpression('JSON_LENGTH', columnExpressions['remark'])
query.field('noOfRemarks', {
  $select: new ResultColumn(numberRemarksExpression, 'noOfRemarks')
})





// has remarks
query.field('hasRemark', {
  $select: new ResultColumn(new BinaryExpression(numberRemarksExpression, '>', new Value(0)), 'hasRemark')
})





// last remark
const latestRemarkExpression = new MathExpression(
  columnExpressions['remark'],
  '->>',
  new Value('$[0].message')
)
query.field('latestRemark', {
  $select: new ResultColumn(latestRemarkExpression, 'latestRemark')
})





// last remark at
const latestRemarkAtExpression = new MathExpression(
  columnExpressions['remark'],
  '->>',
  new Value('$[0].messageAt')
)
query.field('latestRemarkAt', {
  $select: new ResultColumn(latestRemarkAtExpression, 'latestRemarkAt')
})





// last remark by
const latestRemarkByExpression = new MathExpression(
  columnExpressions['remark'],
  '->>',
  new Value('$[0].messageBy')
)
query.field('latestRemarkBy', params => {
  const me = typeof params.subqueries.user === 'object' && 'value' in params.subqueries.user ? params.subqueries.user.value : ''
  const byMeExpression = new BinaryExpression(latestRemarkByExpression, '=', me)
  return { $select: new ResultColumn(IfExpression(byMeExpression, new Value('me'), latestRemarkByExpression), 'latestRemarkBy') }
})





// tableName = ?
query.subquery('tableName', {
  $where: new BinaryExpression(columnExpressions['tableName'], '=', new Unknown())
}).register('value', 0)





// primaryKey = ?
query.subquery('primaryKey', {
  $where: new BinaryExpression(columnExpressions['primaryKey'], '=', new Unknown())
}).register('value', 0)





export default query