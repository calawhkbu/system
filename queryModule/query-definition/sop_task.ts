import { QueryDef } from "classes/query/QueryDef";
import { ColumnExpression, ResultColumn, IsNullExpression, BinaryExpression, FunctionExpression, FromTable, JoinClause, Value, CaseExpression, Unknown, AndExpressions, MathExpression, OrExpressions, ICase, QueryExpression, Query, ExistsExpression, IExpression, InExpression, Expression, BinaryOperator, IQuery } from "node-jql";
import { IfExpression, alwaysTrueExpression, alwaysFalseExpression } from 'utils/jql-subqueries'

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
  [taskTable, 'id'],  // @field id
  [taskTable, 'tableName'], // @field tableName
  [taskTable, 'primaryKey'],  // @field primaryKey
  [taskTable, 'seqNo'], // @field seqNo
  [taskTable, 'templateId'],  // @field templateId
  [taskTable, 'taskId'],  // @field taskId
  [taskTable, 'parentId'],  // @field parentId
  [taskTable, 'remark'],  // @field remark
  [taskTable, 'startAt'], // @field startAt
  [taskTable, 'dueAt'], // @field dueAt
  [taskTable, 'dueScore'],  // @field dueScore
  [taskTable, 'deadline'],  // @field deadline
  [taskTable, 'deadlineScore'], // @field deadlineScore
  [taskTable, 'statusList'],  // @statusList
  [taskTable, 'closedAt'],  // @field closedAt
  [taskTable, 'closedBy'],  // @field closedBy
  [taskTable, 'deletedAt'], // @field deletedAt
  [taskTable, 'deletedBy'], // @field deletedBy
  [templateTaskTable, 'id', 'originalTaskId', table(templateTaskTable)],  // @field originalTaskId
  [templateTaskTable, 'partyGroupCode', 'partyGroupCode', table(templateTaskTable)],  // @field partyGroupCode
  [templateTaskTable, 'uniqueId', 'partyGroupTaskId', table(templateTaskTable)],  // @field partyGroupTaskId
  [templateTaskTable, 'system', 'system', table(templateTaskTable)],  // @field system
  [templateTaskTable, 'category', 'category', table(templateTaskTable)],  // @field category
  [templateTaskTable, 'name', 'name', table(templateTaskTable)],  // @field name
  [templateTaskTable, 'description', 'description', table(templateTaskTable)],  // @field description
  [selectedTemplateTable, 'id', 'originalSelectedTemplateId', table(selectedTemplateTable)],  // @field originalSelectedTemplateId
  [selectedTemplateTable, 'templateId', 'selectedTemplateId', table(selectedTemplateTable)],  // @field selectedTemplateId
  [templateTable, 'id', 'originalTemplateId', table(templateTable)],  // @field originalTemplateId
  [templateTable, 'group', 'group', table(templateTable)],  // @field group
]

const columnExpressions: { [key: string]: ColumnExpression } = columns.reduce((r, [table, name, as = name]) => {
  r[as] = new ColumnExpression(table, name)
  return r
}, {})





const query = new QueryDef({
  $from: taskTable
})

// @table booking
const joinBooking = new JoinClause('LEFT', bookingTable,
  new AndExpressions([
    new BinaryExpression(columnExpressions['tableName'], '=', bookingTable),
    new BinaryExpression(columnExpressions['primaryKey'], '=', new ColumnExpression(bookingTable, 'id'))
  ])
)
query.table(bookingTable, {
  $from: new FromTable(taskTable, joinBooking)
})

// @table shipment
const joinShipment = new JoinClause('LEFT', shipmentTable,
  new AndExpressions([
    new BinaryExpression(columnExpressions['tableName'], '=', shipmentTable),
    new BinaryExpression(columnExpressions['primaryKey'], '=', new ColumnExpression(shipmentTable, 'id'))
  ])
)
query.table(shipmentTable, {
  $from: new FromTable(taskTable, joinShipment)
})

// @table sop_template_task
query.table(templateTaskTable, {
  $from: new FromTable(taskTable, new JoinClause('LEFT', templateTaskTable,
    new BinaryExpression(columnExpressions['taskId'], '=', columnExpressions['originalTaskId'])
  ))
})

// @table sop_selected_template
query.table(selectedTemplateTable, {
  $from: new FromTable(taskTable, new JoinClause('LEFT', selectedTemplateTable,
    new BinaryExpression(columnExpressions['templateId'], '=', columnExpressions['originalSelectedTemplateId'])
  ))
})

// @table sop_template
query.table(templateTable, {
  $from: new FromTable(taskTable, new JoinClause('LEFT', templateTable,
    new BinaryExpression(columnExpressions['selectedTemplateId'], '=', columnExpressions['originalTemplateId'])
  ))
}, table(selectedTemplateTable))

// declared fields
for (const [table, name, as = name, ...companions] of columns) {
  query.field(as, { $select: new ResultColumn(columnExpressions[as], as) }, ...companions)
}





// @field uniqueId
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





// @field bookingNo
// booking number
const bookingNoExpression = new CaseExpression([
  {
    $when: new BinaryExpression(columnExpressions['tableName'], '=', new Value(bookingTable)),
    $then: new ColumnExpression(bookingTable, 'bookingNo')
  },
  {
    $when: new BinaryExpression(columnExpressions['tableName'], '=', new Value(shipmentTable)),
    $then: new ColumnExpression(shipmentTable, 'bookingNo')
  }
])
query.field('bookingNo', {
  $select: new ResultColumn(bookingNoExpression, 'bookingNo')
}, table(bookingTable), table(shipmentTable))





// @field masterNo
// master number
query.field('masterNo', {
  $select: new ResultColumn(new ColumnExpression(shipmentTable, 'masterNo'), 'masterNo')
}, table(shipmentTable))





// @field houseNo
// house number
query.field('houseNo', {
  $select: new ResultColumn(new ColumnExpression(shipmentTable, 'houseNo'), 'houseNo')
}, table(shipmentTable))





// @field primaryNo
// booking number or house number
query.field('primaryNo', params => {
  const result: Partial<IQuery> = {}
  if (params.subqueries.tableName) {
    switch (params.subqueries.tableName.value) {
      case 'booking':
        result.$select = new ResultColumn(new ColumnExpression(bookingTable, 'bookingNo'), 'primaryNo')
        break
      case 'shipment':
        result.$select = new ResultColumn(new ColumnExpression(shipmentTable, 'houseNo'), 'primaryNo')
        break
      default:
        return result
    }
  }
  else {
    result.$select = new ResultColumn(new CaseExpression([
      {
        $when: new BinaryExpression(columnExpressions['tableName'], '=', new Value(bookingTable)),
        $then: new ColumnExpression(bookingTable, 'bookingNo')
      },
      {
        $when: new BinaryExpression(columnExpressions['tableName'], '=', new Value(shipmentTable)),
        $then: new ColumnExpression(shipmentTable, 'houseNo')
      }
    ], alwaysTrueExpression), 'primaryNo')
  }
  return result
}, params => {
  const result: string[] = [table(templateTaskTable)]
  if (params.subqueries.tableName) {
    switch (params.subqueries.tableName.value) {
      case 'booking':
        result.push(table(bookingTable))
        break
      case 'shipment':
        result.push(table(shipmentTable))
        break
    }
  }
  else {
    result.push(table(bookingTable), table(shipmentTable))
  }
  return result
})





// @field isDeleted
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





// @field hasSubTasks
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





// @field isClosed
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





// @field isDone
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





// @field isDue
// is due
const isDueExpression = new BinaryExpression(
  columnExpressions['dueAt'],
  '<',
  new FunctionExpression('UTC_TIMESTAMP')
)
query.field('isDue', {
  $select: new ResultColumn(isDueExpression, 'isDue')
})





// @field isDueToday -> require @subquery today
// is due today (depends on user's timezone)
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





// @field isDead
// is dead
const isDeadExpression = new BinaryExpression(
  columnExpressions['deadline'],
  '<',
  new FunctionExpression('UTC_TIMESTAMP')
)
query.field('isDead', {
  $select: new ResultColumn(isDeadExpression, 'isDead')
})





// @field status
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





// @field statusAt
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





// @field statusBy -> require @subquery user
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





// @field noOfRemarks
// number of remarks
const numberRemarksExpression = new FunctionExpression('JSON_LENGTH', columnExpressions['remark'])
query.field('noOfRemarks', {
  $select: new ResultColumn(numberRemarksExpression, 'noOfRemarks')
})





// @field hasRemark
// has remarks
query.field('hasRemark', {
  $select: new ResultColumn(new BinaryExpression(numberRemarksExpression, '>', new Value(0)), 'hasRemark')
})





// @field latestRemark
// last remark
const latestRemarkExpression = new MathExpression(
  columnExpressions['remark'],
  '->>',
  new Value('$[0].message')
)
query.field('latestRemark', {
  $select: new ResultColumn(latestRemarkExpression, 'latestRemark')
})





// @field latestRemarkAt
// last remark at
const latestRemarkAtExpression = new MathExpression(
  columnExpressions['remark'],
  '->>',
  new Value('$[0].messageAt')
)
query.field('latestRemarkAt', {
  $select: new ResultColumn(latestRemarkAtExpression, 'latestRemarkAt')
})





// @field latestRemarkBy -> require @subquery user
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





// @subquery partyGroupCode
// partyGroupCode = ?
query.subquery('partyGroupCode', {
  $where: new BinaryExpression(columnExpressions['partyGroupCode'], '=', new Unknown())
}, table(templateTaskTable)).register('value', 0)





// @subquery tableName
// tableName = ?
query.subquery('tableName', {
  $where: new BinaryExpression(columnExpressions['tableName'], '=', new Unknown())
}).register('value', 0)





// @subquery primaryKey
// primaryKey = ?
query.subquery('primaryKey', {
  $where: new BinaryExpression(columnExpressions['primaryKey'], '=', new Unknown())
}).register('value', 0)





// @subquery bookingNo
// bookingNo = ?
query.subquery('bookingNo', {
  $where: new BinaryExpression(bookingNoExpression, '=', new Unknown())
}, table(bookingTable)).register('value', 0)





// @subquery notDone
// hide done
query.subquery('notDone', {
  $where: new BinaryExpression(isDoneExpression, '=', new Value(0))
})





// @subquery notClosed
// hide closed
query.subquery('notClosed', {
  $where: new BinaryExpression(isClosedExpression, '=', new Value(0))
})





// @subquery notDeleted
// hide deleted
query.subquery('notDeleted', {
  $where: new BinaryExpression(generalIsDeletedExpression(), '=', new Value(0))
})





// @subquery isDue
// task is due
query.subquery('isDue', {
  $where: new BinaryExpression(isDueExpression, '=', new Value(1))
})





// @subquery isDead
// task is dead
query.subquery('isDead', {
  $where: new BinaryExpression(isDeadExpression, '=', new Value(1))
})





// @subquery date
// date
query.subquery('date', {
  $where: [
    new OrExpressions([
      new IsNullExpression(columnExpressions['startAt'], false),
      new BinaryExpression(columnExpressions['startAt'], '<', new Unknown())
    ]),
    new OrExpressions([
      new IsNullExpression(columnExpressions['deadline'], false),
      new BinaryExpression(new Unknown(), '<', columnExpressions['deadline'])
    ])
  ]
}).register('from', 0).register('to', 1)





// @subquery teams -> require @subquery user -> enabled without @subquery showAllTasks
// my tasks only
function inChargeExpression(table: string, user: string, teams: Array<{ name: string, categories: string[] }>): Expression {
  return new OrExpressions([
    new BinaryExpression(new ColumnExpression(table, 'picEmail'), '=', new Value(user)),
    ...teams.map(({ name, categories }) => {
      const expressions: Expression[] = [
        new BinaryExpression(new ColumnExpression(table, 'team'), '=', new Value(name))
      ]
      if (categories && categories.length) {
        expressions.push(new OrExpressions(categories.map(c => new BinaryExpression(columnExpressions['category'], '=', new Value(c)))))
      }
      return new AndExpressions(expressions)
    })
  ])
}
query.subquery('teams', ({ value }, params) => {
  const me = typeof params.subqueries.user === 'object' && 'value' in params.subqueries.user ? params.subqueries.user.value : ''
  const result: Partial<IQuery> = {}
  if (params.subqueries.tableName) {
    switch (params.subqueries.tableName.value) {
      case 'booking':
        result.$where = inChargeExpression(bookingTable, me, value)
        break
      case 'shipment':
        result.$where = inChargeExpression(shipmentTable, me, value)
        break
      default:
        return result
    }
  }
  else {
    result.$where = new CaseExpression([
      {
        $when: new BinaryExpression(columnExpressions['tableName'], '=', new Value(bookingTable)),
        $then: inChargeExpression(bookingTable, me, value)
      },
      {
        $when: new BinaryExpression(columnExpressions['tableName'], '=', new Value(shipmentTable)),
        $then: inChargeExpression(shipmentTable, me, value)
      }
    ], alwaysTrueExpression)
  }
  return result
}, params => {
  const result: string[] = [table(templateTaskTable)]
  if (params.subqueries.tableName) {
    switch (params.subqueries.tableName.value) {
      case 'booking':
        result.push(table(bookingTable))
        break
      case 'shipment':
        result.push(table(shipmentTable))
        break
    }
  }
  else {
    result.push(table(bookingTable), table(shipmentTable))
  }
  return result
})





export default query