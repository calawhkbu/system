import { QueryDef } from "classes/query/QueryDef";
import { ColumnExpression, ResultColumn, IsNullExpression, BinaryExpression, FunctionExpression, FromTable, JoinClause, Value, CaseExpression, Unknown, AndExpressions, MathExpression, OrExpressions, ICase, QueryExpression, Query, ExistsExpression, IExpression, InExpression, Expression, BinaryOperator, IQuery, ParameterExpression } from "node-jql";
import { IfExpression, alwaysTrueExpression, table, IfNullExpression } from 'utils/jql-subqueries'
import { generalIsDeletedExpression, hasSubTaskQuery, generalIsDoneExpression, generalIsClosedExpression, inChargeExpression, getEntityField, getEntityTable } from "utils/sop-task";

const taskTable = 'sop_task'
const templateTaskTable = 'sop_template_task'
const selectedTemplateTable = 'sop_selected_template'
const templateTable = 'sop_template'
const bookingTable = 'booking'
const bookingDateTable = 'booking_date'
const bookingPartyTable = 'booking_party'
const shipmentTable = 'shipment'
const shipmentDateTable = 'shipment_date'
const shipmentPartyTable = 'shipment_party'

const columns = [
  [taskTable, 'id'],  // @field id
  [taskTable, 'tableName'], // @field tableName
  [taskTable, 'primaryKey'],  // @field primaryKey
  [taskTable, 'seqNo'], // @field seqNo
  [taskTable, 'templateId'],  // @field templateId
  [taskTable, 'taskId'],  // @field taskId
  [taskTable, 'parentId'],  // @field parentId
  [taskTable, 'remark'],  // @field remark
  [taskTable, 'startAt', 'calculatedStartAt'],  // @field calculatedStartAt
  [taskTable, 'inputStartAt'],  // @field inputStartAt
  [taskTable, 'dueAt', 'calculatedDueAt'],  // @field calculatedDueAt
  [taskTable, 'inputDueAt'],  // @field inputDueAt
  [taskTable, 'dueScore'],  // @field dueScore
  [taskTable, 'deadline', 'calculatedDeadline'],  // @field calculatedDeadline
  [taskTable, 'inputDeadline'],  // @field inputDeadline
  [taskTable, 'deadlineScore'], // @field deadlineScore
  [taskTable, 'statusList'],  // @statusList
  [taskTable, 'closedAt'],  // @field closedAt
  [taskTable, 'closedBy'],  // @field closedBy
  [taskTable, 'deletedAt'], // @field deletedAt
  [taskTable, 'deletedBy'], // @field deletedBy
  [templateTaskTable, 'partyGroupCode', 'partyGroupCode', table(templateTaskTable)],  // @field partyGroupCode
  [templateTaskTable, 'uniqueId', 'partyGroupTaskId', table(templateTaskTable)],  // @field partyGroupTaskId
  [templateTaskTable, 'system', 'system', table(templateTaskTable)],  // @field system
  [templateTaskTable, 'category', 'category', table(templateTaskTable)],  // @field category
  [templateTaskTable, 'name', 'name', table(templateTaskTable)],  // @field name
  [templateTaskTable, 'description', 'description', table(templateTaskTable)],  // @field description
  [selectedTemplateTable, 'templateId', 'selectedTemplateId', table(selectedTemplateTable)],  // @field selectedTemplateId
  [templateTable, 'group', 'group', table(templateTable)],  // @field group
]

const columnExpressions: { [key: string]: ColumnExpression } = columns.reduce((r, [table, name, as = name]) => {
  r[as] = new ColumnExpression(table, name)
  return r
}, {})





const query = new QueryDef({
  $from: new FromTable(taskTable,
    new JoinClause('LEFT', new FromTable(taskTable, 'parent'),
      new BinaryExpression(columnExpressions['parentId'], '=', new ColumnExpression('parent', 'id'))
    )
  )
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

// @table bookingDate
const joinBookingDate = new JoinClause('LEFT', bookingDateTable,
  new BinaryExpression(new ColumnExpression(bookingTable, 'id'), '=', new ColumnExpression(bookingDateTable, 'bookingId'))
)
query.table(bookingDateTable, {
  $from: new FromTable(taskTable, joinBookingDate)
})

// @table bookingParty
const joinBookingParty = new JoinClause('LEFT', bookingPartyTable,
  new BinaryExpression(new ColumnExpression(bookingTable, 'id'), '=', new ColumnExpression(bookingPartyTable, 'bookingId'))
)
query.table(bookingPartyTable, {
  $from: new FromTable(taskTable, joinBookingParty)
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

// @table shipmentDate
const joinShipmentDate = new JoinClause('LEFT', shipmentDateTable,
  new BinaryExpression(new ColumnExpression(shipmentTable, 'id'), '=', new ColumnExpression(shipmentDateTable, 'shipmentId'))
)
query.table(shipmentDateTable, {
  $from: new FromTable(taskTable, joinShipmentDate)
})

// @table shipmentParty
const joinShipmentParty = new JoinClause('LEFT', shipmentPartyTable,
  new BinaryExpression(new ColumnExpression(shipmentTable, 'id'), '=', new ColumnExpression(shipmentPartyTable, 'shipmentId'))
)
query.table(shipmentPartyTable, {
  $from: new FromTable(taskTable, joinShipmentParty)
})

// @table sop_template_task
query.table(templateTaskTable, {
  $from: new FromTable(taskTable, new JoinClause('LEFT', templateTaskTable,
    new BinaryExpression(columnExpressions['taskId'], '=', new ColumnExpression(templateTaskTable, 'id'))
  ))
})

// @table sop_selected_template
query.table(selectedTemplateTable, {
  $from: new FromTable(taskTable, new JoinClause('LEFT', selectedTemplateTable,
    new BinaryExpression(columnExpressions['templateId'], '=', new ColumnExpression(selectedTemplateTable, 'id'))
  ))
})

// @table sop_template
query.table(templateTable, {
  $from: new FromTable(taskTable, new JoinClause('LEFT', templateTable,
    new BinaryExpression(columnExpressions['selectedTemplateId'], '=', new ColumnExpression(templateTable, 'id'))
  ))
}, table(selectedTemplateTable))

// declared fields
for (const [table, name, as = name, ...companions] of columns) {
  query.field(as, { $select: new ResultColumn(columnExpressions[as], as) }, ...companions)
}





// @field count
query.field('count', {
  $select: new ResultColumn(new FunctionExpression('COUNT', new ParameterExpression('DISTINCT', new ColumnExpression('sop_task', 'id'))), 'count')
})





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
query.field('primaryNo',
  getEntityField('primaryNo', [bookingTable, 'bookingNo'], [shipmentTable, 'houseNo']),
  getEntityTable([], [bookingTable], [shipmentTable])
)





// @field vesselName
query.field('vesselName',
  getEntityField('vesselName', [bookingTable], [shipmentTable, 'vessel']),
  getEntityTable([], [bookingTable], [shipmentTable])
)





// @field portOfLoadingCode
query.field('portOfLoadingCode',
  getEntityField('portOfLoadingCode', [bookingTable], [shipmentTable]),
  getEntityTable([], [bookingTable], [shipmentTable])
)





// @field portOfDischargeCode
query.field('portOfDischargeCode',
  getEntityField('portOfDischargeCode', [bookingTable], [shipmentTable]),
  getEntityTable([], [bookingTable], [shipmentTable])
)





// @field voyageFlightNumber
query.field('voyageFlightNumber',
  getEntityField('voyageFlightNumber', [bookingTable], [shipmentTable]),
  getEntityTable([], [bookingTable], [shipmentTable])
)





// @field departureDate
query.field('departureDate',
  getEntityField(
    'departureDate',
    ([tableName, dateTable, field]) => {
      return IfNullExpression(new ColumnExpression(dateTable, `${field}Actual`), new ColumnExpression(dateTable, `${field}Estimated`))
    },
    [bookingTable, bookingDateTable, 'departureDate'],
    [shipmentTable, shipmentDateTable, 'departureDate']
  ),
  getEntityTable([], [bookingTable, bookingDateTable], [shipmentTable, shipmentDateTable])
)





// @field arrivalDate
query.field('arrivalDate',
  getEntityField(
    'arrivalDate',
    ([tableName, dateTable, field]) => {
      return IfNullExpression(new ColumnExpression(dateTable, `${field}Actual`), new ColumnExpression(dateTable, `${field}Estimated`))
    },
    [bookingTable, bookingDateTable, 'arrivalDate'],
    [shipmentTable, shipmentDateTable, 'arrivalDate']
  ),
  getEntityTable([], [bookingTable, bookingDateTable], [shipmentTable, shipmentDateTable])
)





// @field shipper
query.field('shipper',
  getEntityField('shipper',
    [bookingTable, bookingPartyTable, 'shipperPartyName'],
    [shipmentTable, shipmentPartyTable, 'shipperPartyName']
  ),
  getEntityTable([], [bookingTable, bookingPartyTable], [shipmentTable, shipmentPartyTable])
)





// @field consignee
query.field('consignee',
  getEntityField('consignee',
    [bookingTable, bookingPartyTable, 'consigneePartyName'],
    [shipmentTable, shipmentPartyTable, 'consigneePartyName']
  ),
  getEntityTable([], [bookingTable, bookingPartyTable], [shipmentTable, shipmentPartyTable])
)





// @field agent
query.field('agent',
  getEntityField('agent',
    [bookingTable, bookingPartyTable, 'agentPartyName'],
    [shipmentTable, shipmentPartyTable, 'agentPartyName']
  ),
  getEntityTable([], [bookingTable, bookingPartyTable], [shipmentTable, shipmentPartyTable])
)





// @field pic
query.field('picEmail',
  getEntityField('picEmail', [bookingTable], [shipmentTable]),
  getEntityTable([], [bookingTable], [shipmentTable])
)





// @field team
query.field('team',
  getEntityField('team', [bookingTable], [shipmentTable]),
  getEntityTable([], [bookingTable], [shipmentTable])
)





// @field startAt
const startAtExpression = IfNullExpression(
  IfNullExpression(
    columnExpressions['inputStartAt'],
    columnExpressions['calculatedStartAt']
  ),
  IfNullExpression(
    new ColumnExpression('parent', 'inputStartAt'),
    new ColumnExpression('parent', 'startAt')
  )
)
query.field('startAt', {
  $select: new ResultColumn(startAtExpression, 'startAt')
})





// @field dueAt
const dueAtExpression = IfNullExpression(
  IfNullExpression(
    columnExpressions['inputDueAt'],
    columnExpressions['calculatedDueAt']
  ),
  IfNullExpression(
    new ColumnExpression('parent', 'inputDueAt'),
    new ColumnExpression('parent', 'dueAt')
  )
)
query.field('dueAt', {
  $select: new ResultColumn(dueAtExpression, 'dueAt')
})





// @field deadline
const deadlineExpression = IfNullExpression(
  IfNullExpression(
    columnExpressions['inputDeadline'],
    columnExpressions['calculatedDeadline']
  ),
  IfNullExpression(
    new ColumnExpression('parent', 'inputDeadline'),
    new ColumnExpression('parent', 'deadline')
  )
)
query.field('deadline', {
  $select: new ResultColumn(deadlineExpression, 'deadline')
})





// @field isDeleted
// is deleted
query.field('isDeleted', {
  $select: new ResultColumn(generalIsDeletedExpression(), 'isDeleted')
})





// @field hasSubTasks
// has sub-tasks
const hasSubTasksExpression = new ExistsExpression(
  hasSubTaskQuery('temp'),
  false
)
query.field('hasSubTasks', {
  $select: new ResultColumn(hasSubTasksExpression, 'hasSubTasks')
})





// @field isClosed
// is closed

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
  dueAtExpression,
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
      new BinaryExpression(new Value(params.subqueries.today.from), '<=', dueAtExpression),
      new BinaryExpression(dueAtExpression, '<=', new Value(params.subqueries.today.to))
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
  deadlineExpression,
  '<',
  new FunctionExpression('UTC_TIMESTAMP')
)
query.field('isDead', {
  $select: new ResultColumn(isDeadExpression, 'isDead')
})





// @field status
// last status
const isStartedExpression = new OrExpressions([
  new IsNullExpression(startAtExpression, false),
  new BinaryExpression(
    startAtExpression,
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
      new IsNullExpression(startAtExpression, false),
      new BinaryExpression(startAtExpression, '<', new Unknown())
    ]),
    new OrExpressions([
      new IsNullExpression(deadlineExpression, false),
      new BinaryExpression(new Unknown(), '<', deadlineExpression)
    ])
  ]
}).register('from', 0).register('to', 1)





// @subquery teams -> require @subquery user -> enabled without @subquery showAllTasks
// my tasks only
query.subquery('teams', ({ value }, params) => {
  const me = typeof params.subqueries.user === 'object' && 'value' in params.subqueries.user ? params.subqueries.user.value : ''
  const result: Partial<IQuery> = {}
  if (params.subqueries.tableName) {
    switch (params.subqueries.tableName.value) {
      case bookingTable:
        result.$where = inChargeExpression(bookingTable, me, value)
        break
      case shipmentTable:
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
}, getEntityTable([table(templateTaskTable)], [bookingTable], [shipmentTable]))





// @subquery notReferencedIn
query.subquery('notReferencedIn', value => {
  if (Array.isArray(value.value) && value.value.length > 0) {
    return {
      $where: [
        new IsNullExpression(columnExpressions['templateId'], true),
        new InExpression(columnExpressions['taskId'], true, new Query({
          $distinct: true,
          $select: new ResultColumn(new ColumnExpression('sop_template_task', 'id')),
          $from: new FromTable('sop_template',
            new JoinClause('LEFT', 'sop_template_template_task', new BinaryExpression(new ColumnExpression('sop_template_template_task', 'templateId'), '=', new ColumnExpression('sop_template', 'id'))),
            new JoinClause('LEFT', 'sop_template_task', new BinaryExpression(new ColumnExpression('sop_template_template_task', 'taskId'), '=', new ColumnExpression('sop_template_task', 'id')))
          ),
          $where: new InExpression(new ColumnExpression('sop_template', 'id'), false, new Value(value.value))
        }))
      ]
    }
  }
  else {
    return {
      $where: new IsNullExpression(columnExpressions['templateId'], true)
    }
  }
})





// @subquery notReferenced
query.subquery('notReferenced', {
  $where: [
    new IsNullExpression(columnExpressions['templateId'], true),
    new InExpression(columnExpressions['taskId'], true, new Query({
      $distinct: true,
      $select: new ResultColumn(new ColumnExpression('sop_template_task', 'id')),
      $from: new FromTable('sop_selected_template',
        new JoinClause('LEFT', 'sop_template', new BinaryExpression(new ColumnExpression('sop_selected_template', 'templateId'), '=', new ColumnExpression('sop_template', 'id'))),
        new JoinClause('LEFT', 'sop_template_template_task', new BinaryExpression(new ColumnExpression('sop_template_template_task', 'templateId'), '=', new ColumnExpression('sop_template', 'id'))),
        new JoinClause('LEFT', 'sop_template_task', new BinaryExpression(new ColumnExpression('sop_template_template_task', 'taskId'), '=', new ColumnExpression('sop_template_task', 'id')))
      ),
      $where: [
        new BinaryExpression(new ColumnExpression('sop_selected_template', 'tableName'), '=', columnExpressions['tableName']),
        new BinaryExpression(new ColumnExpression('sop_selected_template', 'primaryKey'), '=', columnExpressions['primaryKey']),
      ]
    }))
  ]
})





export default query