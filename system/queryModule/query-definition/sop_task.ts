import { QueryDef } from "classes/query/QueryDef";
import { ColumnExpression, ResultColumn, IsNullExpression, BinaryExpression, FunctionExpression, FromTable, JoinClause, Value, CaseExpression, Unknown, AndExpressions, MathExpression, OrExpressions, ICase, QueryExpression, Query, ExistsExpression, IExpression, InExpression, Expression, BinaryOperator, IQuery, ParameterExpression } from "node-jql";
import { IfExpression, alwaysTrueExpression, table, IfNullExpression } from 'utils/jql-subqueries'
import { generalIsDeletedExpression, hasSubTaskQuery, generalIsDoneExpression, generalIsClosedExpression, inChargeExpression, getEntityField, getEntityTable } from "utils/sop-task";
import { IShortcut } from 'classes/query/Shortcut'

const taskTable = 'sop_task'
const templateTaskTable = 'sop_template_task'
const templateTemplateTaskTable = 'sop_template_template_task'
const selectedTemplateTable = 'sop_selected_template'
const templateTable = 'sop_template'
const bookingTable = 'booking'
const bookingDateTable = 'booking_date'
const bookingPartyTable = 'booking_party'
const shipmentTable = 'shipment'
const shipmentDateTable = 'shipment_date'
const shipmentPartyTable = 'shipment_party'

const query = new QueryDef({
  $from: new FromTable(taskTable,
    new JoinClause('LEFT', new FromTable(taskTable, 'parent'),
      new AndExpressions([
        new BinaryExpression(new ColumnExpression(taskTable, 'parentId'), '=', new ColumnExpression('parent', 'id')),
        new IsNullExpression(new ColumnExpression('parent', 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression('parent', 'deletedBy'), false)
      ])
    )
  )
})

const shortcuts: IShortcut[] = [
  // table:booking
  {
    type: 'table',
    name: 'booking',
    fromTable: new FromTable(taskTable, new JoinClause('LEFT', bookingTable,
      new AndExpressions([
        new BinaryExpression(new ColumnExpression(taskTable, 'tableName'), '=', bookingTable),
        new BinaryExpression(new ColumnExpression(taskTable, 'primaryKey'), '=', new ColumnExpression(bookingTable, 'id')),
        new IsNullExpression(new ColumnExpression(bookingTable, 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression(bookingTable, 'deletedBy'), false)
      ])
    ))
  },

  // table:booking_date
  {
    type: 'table',
    name: 'booking_date',
    fromTable: new FromTable(taskTable, new JoinClause('LEFT', bookingDateTable,
      new AndExpressions([
        new BinaryExpression(new ColumnExpression(bookingTable, 'id'), '=', new ColumnExpression(bookingDateTable, 'bookingId')),
        new IsNullExpression(new ColumnExpression(bookingDateTable, 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression(bookingDateTable, 'deletedBy'), false)
      ])
    )),
    companions: ['table:booking']
  },

  // table:booking_party
  {
    type: 'table',
    name: 'booking_party',
    fromTable: new FromTable(taskTable, new JoinClause('LEFT', bookingPartyTable,
      new AndExpressions([
        new BinaryExpression(new ColumnExpression(bookingTable, 'id'), '=', new ColumnExpression(bookingPartyTable, 'bookingId')),
        new IsNullExpression(new ColumnExpression(bookingPartyTable, 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression(bookingPartyTable, 'deletedBy'), false)
      ])
    )),
    companions: ['table:booking']
  },

  // table:shipment
  {
    type: 'table',
    name: 'shipment',
    fromTable: new FromTable(taskTable, new JoinClause('LEFT', shipmentTable,
      new AndExpressions([
        new BinaryExpression(new ColumnExpression(taskTable, 'tableName'), '=', shipmentTable),
        new BinaryExpression(new ColumnExpression(taskTable, 'primaryKey'), '=', new ColumnExpression(shipmentTable, 'id')),
        new IsNullExpression(new ColumnExpression(shipmentTable, 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression(shipmentTable, 'deletedBy'), false)
      ])
    ))
  },

  // table:shipment_date
  {
    type: 'table',
    name: 'shipment_date',
    fromTable: new FromTable(taskTable, new JoinClause('LEFT', shipmentDateTable,
      new AndExpressions([
        new BinaryExpression(new ColumnExpression(shipmentTable, 'id'), '=', new ColumnExpression(shipmentDateTable, 'shipmentId')),
        new IsNullExpression(new ColumnExpression(shipmentDateTable, 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression(shipmentDateTable, 'deletedBy'), false)
      ])
    )),
    companions: ['table:shipment']
  },

  // table:shipment_party
  {
    type: 'table',
    name: 'shipment_party',
    fromTable: new FromTable(taskTable, new JoinClause('LEFT', shipmentPartyTable,
      new AndExpressions([
        new BinaryExpression(new ColumnExpression(shipmentTable, 'id'), '=', new ColumnExpression(shipmentPartyTable, 'shipmentId')),
        new IsNullExpression(new ColumnExpression(shipmentPartyTable, 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression(shipmentPartyTable, 'deletedBy'), false)
      ])
    )),
    companions: ['table:shipment']
  },

  // table:sop_template_task
  {
    type: 'table',
    name: 'sop_template_task',
    queryArg: re => params => ({
      $from: new FromTable(taskTable, new JoinClause('LEFT', templateTaskTable,
        new AndExpressions([
          new BinaryExpression(new ColumnExpression(taskTable, 'taskId'), '=', new ColumnExpression(templateTaskTable, 'id')),
          new BinaryExpression(new ColumnExpression(templateTaskTable, 'partyGroupCode'), '=', params.subqueries.partyGroupCode.value)
        ])
      ))
    })
  },

  // table:sop_template_template_task
  {
    type: 'table',
    name: 'sop_template_template_task',
    queryArg: re => params => ({
      $from: new FromTable(taskTable, new JoinClause('LEFT', templateTemplateTaskTable,
        new AndExpressions([
          new BinaryExpression(new ColumnExpression(templateTaskTable, 'id'), '=', new ColumnExpression(templateTemplateTaskTable, 'taskId')),
          new BinaryExpression(new ColumnExpression(templateTable, 'id'), '=', new ColumnExpression(templateTemplateTaskTable, 'templateId'))
        ])
      ))
    }),
    companions: ['table:sop_template_task', 'table:sop_template']
  },

  // table:sop_template
  {
    type: 'table',
    name: 'sop_template',
    fromTable: new FromTable(taskTable, new JoinClause('LEFT', templateTable,
      new AndExpressions([
        new BinaryExpression(new ColumnExpression(taskTable, 'templateId'), '=', new ColumnExpression(templateTable, 'id')),
        new IsNullExpression(new ColumnExpression(templateTable, 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression(templateTable, 'deletedBy'), false)
      ])
    ))
  },

  // field:id
  {
    type: 'field',
    name: 'id',
    expression: new ColumnExpression(taskTable, 'id'),
    registered: true
  },

  // field:id
  {
    type: 'field',
    name: 'noOfTasks',
    expression: re => new FunctionExpression('COUNT', new ParameterExpression('DISTINCT', re['id']))
  },

  // field:tableName
  {
    type: 'field',
    name: 'tableName',
    expression: new ColumnExpression(taskTable, 'tableName'),
    registered: true
  },

  // field:primaryKey
  {
    type: 'field',
    name: 'primaryKey',
    expression: new ColumnExpression(taskTable, 'primaryKey'),
    registered: true
  },

  // field:templateId
  {
    type: 'field',
    name: 'templateId',
    expression: new ColumnExpression(taskTable, 'templateId'),
    registered: true
  },

  // field:taskId
  {
    type: 'field',
    name: 'taskId',
    expression: new ColumnExpression(taskTable, 'taskId'),
    registered: true
  },

  // field:parentId
  {
    type: 'field',
    name: 'parentId',
    expression: new ColumnExpression(taskTable, 'parentId'),
    registered: true
  },

  // field:remark
  {
    type: 'field',
    name: 'remark',
    expression: new ColumnExpression(taskTable, 'remark'),
    registered: true
  },

  // field:calculatedStartAt
  {
    type: 'field',
    name: 'calculatedStartAt',
    expression: new ColumnExpression(taskTable, 'startAt'),
    registered: true
  },

  // field:inputStartAt
  {
    type: 'field',
    name: 'inputStartAt',
    expression: new ColumnExpression(taskTable, 'inputStartAt'),
    registered: true
  },

  // field:calculatedDueAt
  {
    type: 'field',
    name: 'calculatedDueAt',
    expression: new ColumnExpression(taskTable, 'dueAt'),
    registered: true
  },

  // field:inputDueAt
  {
    type: 'field',
    name: 'inputDueAt',
    expression: new ColumnExpression(taskTable, 'inputDueAt'),
    registered: true
  },

  // field:dueScore
  {
    type: 'field',
    name: 'dueScore',
    expression: new ColumnExpression(taskTable, 'dueScore'),
    registered: true
  },

  // field:calculatedDeadline
  {
    type: 'field',
    name: 'calculatedDeadline',
    expression: new ColumnExpression(taskTable, 'deadline'),
    registered: true
  },

  // field:inputDeadline
  {
    type: 'field',
    name: 'inputDeadline',
    expression: new ColumnExpression(taskTable, 'inputDeadline'),
    registered: true
  },

  // field:deadlineScore
  {
    type: 'field',
    name: 'deadlineScore',
    expression: new ColumnExpression(taskTable, 'deadlineScore'),
    registered: true
  },

  // field:statusList
  {
    type: 'field',
    name: 'statusList',
    expression: new ColumnExpression(taskTable, 'statusList'),
    registered: true
  },

  // field:closedAt
  {
    type: 'field',
    name: 'closedAt',
    expression: new ColumnExpression(taskTable, 'closedAt'),
    registered: true
  },

  // field:closedBy
  {
    type: 'field',
    name: 'closedBy',
    expression: new ColumnExpression(taskTable, 'closedBy'),
    registered: true
  },

  // field:deletedAt
  {
    type: 'field',
    name: 'deletedAt',
    expression: new ColumnExpression(taskTable, 'deletedAt'),
    registered: true
  },

  // field:deletedBy
  {
    type: 'field',
    name: 'deletedBy',
    expression: new ColumnExpression(taskTable, 'deletedBy'),
    registered: true
  },

  // field:partyGroupCode
  {
    type: 'field',
    name: 'partyGroupCode',
    expression: new ColumnExpression(templateTaskTable, 'partyGroupCode'),
    registered: true,
    companions: ['table:sop_template_task']
  },

  // field:partyGroupTaskId
  {
    type: 'field',
    name: 'partyGroupTaskId',
    expression: new ColumnExpression(templateTaskTable, 'uniqueId'),
    registered: true,
    companions: ['table:sop_template_task']
  },

  // field:system
  {
    type: 'field',
    name: 'system',
    expression: new ColumnExpression(templateTaskTable, 'system'),
    registered: true,
    companions: ['table:sop_template_task']
  },

  // field:category
  {
    type: 'field',
    name: 'category',
    expression: new ColumnExpression(templateTaskTable, 'category'),
    registered: true,
    companions: ['table:sop_template_task']
  },

  // field:name
  {
    type: 'field',
    name: 'name',
    expression: new ColumnExpression(templateTaskTable, 'name'),
    registered: true,
    companions: ['table:sop_template_task']
  },

  // field:description
  {
    type: 'field',
    name: 'description',
    expression: new ColumnExpression(templateTaskTable, 'description'),
    registered: true,
    companions: ['table:sop_template_task']
  },

  // field:group
  {
    type: 'field',
    name: 'group',
    expression: new ColumnExpression(templateTable, 'group'),
    registered: true,
    companions: ['table:sop_template']
  },

  // field:order
  {
    type: 'field',
    name: 'order',
    expression: new ColumnExpression(templateTemplateTaskTable, 'order'),
    companions: ['table:sop_template_template_task']
  },

  // field:seqNo
  {
    type: 'field',
    name: 'seqNo',
    expression: new ColumnExpression(templateTemplateTaskTable, 'seqNo'),
    companions: ['table:sop_template_template_task']
  },

  // field:count
  {
    type: 'field',
    name: 'count',
    expression: re => new FunctionExpression('COUNT', new ParameterExpression('DISTINCT', re['id']))
  },

  // field:uniqueId
  {
    type: 'field',
    name: 'uniqueId',
    expression: re => new FunctionExpression('CONCAT', re['partyGroupCode'], new Value('-'), re['partyGroupTaskId']) ,
    companions: ['table:sop_template_task']
  },

  // field:bookingNo
  {
    type: 'field',
    name: 'bookingNo',
    expression: re => new CaseExpression([
      {
        $when: new BinaryExpression(re['tableName'], '=', new Value(bookingTable)),
        $then: new ColumnExpression(bookingTable, 'bookingNo')
      },
      {
        $when: new BinaryExpression(re['tableName'], '=', new Value(shipmentTable)),
        $then: new ColumnExpression(shipmentTable, 'bookingNo')
      }
    ]),
    registered: true,
    companions: ['table:booking', 'table:shipment']
  },

  // field:masterNo
  {
    type: 'field',
    name: 'masterNo',
    expression: new ColumnExpression(shipmentTable, 'masterNo'),
    companions: ['table:shipment']
  },

  // field:houseNo
  {
    type: 'field',
    name: 'houseNo',
    expression: new ColumnExpression(shipmentTable, 'houseNo'),
    companions: ['table:shipment']
  },

  // field:primaryNo
  {
    type: 'field',
    name: 'primaryNo',
    queryArg: () => getEntityField('primaryNo', [bookingTable, 'bookingNo'], [shipmentTable, 'houseNo']),
    companions: getEntityTable([], [bookingTable], [shipmentTable])
  },

  // field:vesselName
  {
    type: 'field',
    name: 'vesselName',
    queryArg: () => getEntityField('vesselName', [bookingTable], [shipmentTable, 'vessel']),
    companions: getEntityTable([], [bookingTable], [shipmentTable])
  },

  // field:voyageFlightNumber
  {
    type: 'field',
    name: 'voyageFlightNumber',
    queryArg: () => getEntityField('voyageFlightNumber', [bookingTable], [shipmentTable]),
    companions: getEntityTable([], [bookingTable], [shipmentTable])
  },

  // field:portOfLoadingCode
  {
    type: 'field',
    name: 'portOfLoadingCode',
    queryArg: () => getEntityField('portOfLoadingCode', [bookingTable], [shipmentTable]),
    companions: getEntityTable([], [bookingTable], [shipmentTable])
  },

  // field:portOfDischargeCode
  {
    type: 'field',
    name: 'portOfDischargeCode',
    queryArg: () => getEntityField('portOfDischargeCode', [bookingTable], [shipmentTable]),
    companions: getEntityTable([], [bookingTable], [shipmentTable])
  },

  // field:departureDate
  {
    type: 'field',
    name: 'departureDate',
    queryArg: () => getEntityField(
      'departureDate',
      ([tableName, dateTable, field]) => IfNullExpression(new ColumnExpression(dateTable, `${field}Actual`), new ColumnExpression(dateTable, `${field}Estimated`)),
      [bookingTable, bookingDateTable, 'departureDate'],
      [shipmentTable, shipmentDateTable, 'departureDate']
    ),
    companions: getEntityTable([], [bookingTable, bookingDateTable], [shipmentTable, shipmentDateTable])
  },

  // field:arrivalDate
  {
    type: 'field',
    name: 'arrivalDate',
    queryArg: () => getEntityField(
      'arrivalDate',
      ([tableName, dateTable, field]) => IfNullExpression(new ColumnExpression(dateTable, `${field}Actual`), new ColumnExpression(dateTable, `${field}Estimated`)),
      [bookingTable, bookingDateTable, 'arrivalDate'],
      [shipmentTable, shipmentDateTable, 'arrivalDate']
    ),
    companions: getEntityTable([], [bookingTable, bookingDateTable], [shipmentTable, shipmentDateTable])
  },

  // field:shipper
  {
    type: 'field',
    name: 'shipper',
    queryArg: () => getEntityField('shipper', [bookingTable, bookingPartyTable, 'shipperPartyName'], [shipmentTable, shipmentPartyTable, 'shipperPartyName']),
    companions: getEntityTable([], [bookingTable, bookingPartyTable], [shipmentTable, shipmentPartyTable])
  },

  // field:consignee
  {
    type: 'field',
    name: 'consignee',
    queryArg: () => getEntityField('consignee', [bookingTable, bookingPartyTable, 'consigneePartyName'], [shipmentTable, shipmentPartyTable, 'consigneePartyName']),
    companions: getEntityTable([], [bookingTable, bookingPartyTable], [shipmentTable, shipmentPartyTable])
  },

  // field:agent
  {
    type: 'field',
    name: 'agent',
    queryArg: () => getEntityField('agent', [bookingTable, bookingPartyTable, 'agentPartyName'], [shipmentTable, shipmentPartyTable, 'agentPartyName']),
    companions: getEntityTable([], [bookingTable, bookingPartyTable], [shipmentTable, shipmentPartyTable])
  },

  // field:picEmail
  {
    type: 'field',
    name: 'picEmail',
    queryArg: () => getEntityField('picEmail', [bookingTable], [shipmentTable]),
    companions: getEntityTable([], [bookingTable], [shipmentTable])
  },

  // field:team
  {
    type: 'field',
    name: 'team',
    queryArg: () => getEntityField('team', [bookingTable], [shipmentTable]),
    companions: getEntityTable([], [bookingTable], [shipmentTable])
  },

  // field:startAt,
  {
    type: 'field',
    name: 'startAt',
    expression: re => IfNullExpression(
      IfNullExpression(re['inputStartAt'], re['calculatedStartAt']),
      IfNullExpression(new ColumnExpression('parent', 'inputStartAt'), new ColumnExpression('parent', 'startAt'))
    ),
    registered: true
  },

  // field:defaultStartAt,
  {
    type: 'field',
    name: 'defaultStartAt',
    expression: re => IfNullExpression(
      re['calculatedStartAt'],
      IfNullExpression(new ColumnExpression('parent', 'inputStartAt'), new ColumnExpression('parent', 'startAt'))
    )
  },

  // field:dueAt,
  {
    type: 'field',
    name: 'dueAt',
    expression: re => IfNullExpression(
      IfNullExpression(re['inputDueAt'], re['calculatedDueAt']),
      IfNullExpression(new ColumnExpression('parent', 'inputDueAt'), new ColumnExpression('parent', 'dueAt'))
    ),
    registered: true
  },

  // field:defaultDueAt,
  {
    type: 'field',
    name: 'defaultDueAt',
    expression: re => IfNullExpression(
      re['calculatedDueAt'],
      IfNullExpression(new ColumnExpression('parent', 'inputDueAt'), new ColumnExpression('parent', 'dueAt'))
    )
  },

  // field:deadline,
  {
    type: 'field',
    name: 'deadline',
    expression: re => IfNullExpression(
      IfNullExpression(re['inputDeadline'], re['calculatedDeadline']),
      IfNullExpression(new ColumnExpression('parent', 'inputDeadline'), new ColumnExpression('parent', 'deadline'))
    ),
    registered: true
  },

  // field:defaultDeadline,
  {
    type: 'field',
    name: 'defaultDeadline',
    expression: re => IfNullExpression(
      re['calculatedDeadline'],
      IfNullExpression(new ColumnExpression('parent', 'inputDeadline'), new ColumnExpression('parent', 'deadline'))
    )
  },

  // field:hasSubTasks
  {
    type: 'field',
    name: 'hasSubTasks',
    expression: new ExistsExpression(hasSubTaskQuery('temp'), false),
    registered: true
  },

  // field:noOfRemarks
  {
    type: 'field',
    name: 'noOfRemarks',
    expression: re => new FunctionExpression('JSON_LENGTH', re['remark']),
    registered: true
  },

  // field:hasRemark
  {
    type: 'field',
    name: 'hasRemark',
    expression: re => new BinaryExpression(re['noOfRemarks'], '>', new Value(0))
  },

  // field:latestRemark
  {
    type: 'field',
    name: 'latestRemark',
    expression: re => new MathExpression(re['remark'], '->>', new Value('$[0].message'))
  },

  // field:latestRemarkAt
  {
    type: 'field',
    name: 'latestRemarkAt',
    expression: re => new MathExpression(re['remark'], '->>', new Value('$[0].messageAt'))
  },

  // field:latestRemarkBy
  {
    type: 'field',
    name: 'latestRemarkBy',
    queryArg: re => params => {
      const latestRemarkByExpression = new MathExpression(re['remark'], '->>', new Value('$[0].messageBy'))
      const me = typeof params.subqueries.user === 'object' && 'value' in params.subqueries.user ? params.subqueries.user.value : ''
      const byMeExpression = new BinaryExpression(latestRemarkByExpression, '=', me)
      return { $select: new ResultColumn(IfExpression(byMeExpression, new Value('me'), latestRemarkByExpression), 'latestRemarkBy') }
    }
  },

  // field:isDone
  {
    type: 'field',
    name: 'isDone',
    expression: re => IfExpression(re['hasSubTasks'], new ExistsExpression(hasSubTaskQuery('temp', generalIsDoneExpression('temp', true)), true), generalIsDoneExpression()),
    registered: true
  },

  // field:isDue
  {
    type: 'field',
    name: 'isDue',
    expression: re => new BinaryExpression(re['dueAt'], '<', new FunctionExpression('UTC_TIMESTAMP')),
    registered: true
  },

  // field:isStarted
  {
    type: 'field',
    name: 'isStarted',
    expression: re => new OrExpressions([
      new IsNullExpression(re['startAt'], false),
      new BinaryExpression(re['startAt'], '<', new FunctionExpression('UTC_TIMESTAMP'))
    ]),
    registered: true
  },

  // field:isDueToday
  {
    type: 'field',
    name: 'isDueToday',
    queryArg: re => params => {
      let expression: Expression
      if (params.subqueries && typeof params.subqueries.today === 'object' && 'from' in params.subqueries.today) {
        expression = new AndExpressions([
          re['isStarted'],
          new BinaryExpression(new Value(params.subqueries.today.from), '<=', re['dueAt']),
          new BinaryExpression(re['dueAt'], '<=', new Value(params.subqueries.today.to))
        ])
      }
      else {
        expression = new Value(0)
      }
      return { $select: new ResultColumn(expression, 'isDueToday') }
    }
  },

  // field:isDead
  {
    type: 'field',
    name: 'isDead',
    expression: re => new BinaryExpression(re['deadline'], '<', new FunctionExpression('UTC_TIMESTAMP')),
    registered: true
  },

  // field:isClosed
  {
    type: 'field',
    name: 'isClosed',
    expression: re => IfExpression(re['hasSubTasks'], new ExistsExpression(hasSubTaskQuery('temp', generalIsClosedExpression('temp', true)), true), generalIsClosedExpression()),
    registered: true
  },

  // field:isDeleted
  {
    type: 'field',
    name: 'isDeleted',
    expression: generalIsDeletedExpression(),
    registered: true
  },

  // field:status
  {
    type: 'field',
    name: 'status',
    expression: re => new CaseExpression(
      [
        { $when: re['isDeleted'], $then: new Value('Deleted') },
        { $when: re['isClosed'], $then: new Value('Closed') },
        { $when: re['isDone'], $then: new Value('Done') },
        { $when: re['isDead'], $then: new Value('Dead') },
        { $when: re['isDue'], $then: new Value('Due') },
        { $when: re['isStarted'], $then: new Value('Open') }
      ],
      new Value('Not Ready')
    )
  },

  // field:statusAt
  {
    type: 'field',
    name: 'statusAt',
    expression: re => new CaseExpression(
      [
        { $when: re['isDeleted'], $then: new Value(null) },
        { $when: re['isClosed'], $then: re['closedAt'] }
      ],
      new MathExpression(re['statusList'], '->>', new Value('$[0].statusAt'))
    )
  },

  // field:statusBy
  {
    type: 'field',
    name: 'statusBy',
    queryArg: re => params => {
      const statusByExpression = new CaseExpression(
        [
          { $when: re['isDeleted'], $then: new Value(null) },
          { $when: re['isClosed'], $then: re['closedBy'] }
        ],
        new MathExpression(re['statusList'], '->>', new Value('$[0].statusBy'))
      )
      const me = params.subqueries && typeof params.subqueries.user === 'object' && 'value' in params.subqueries.user ? params.subqueries.user.value : ''
      const byMeExpression = new BinaryExpression(statusByExpression, '=', me)
      return { $select: new ResultColumn(IfExpression(byMeExpression, new Value('me'), statusByExpression), 'statusBy') }
    }
  },

  // field:deduct
  {
    type: 'field',
    name: 'deduct',
    expression: re => new FunctionExpression('SUM', new CaseExpression([
      {
        $when: re['isDead'],
        $then: IfNullExpression(new ColumnExpression('sop_task', 'deadlineScore'), new Value(0))
      },
      {
        $when: re['isDue'],
        $then: IfNullExpression(new ColumnExpression('sop_task', 'dueScore'), new Value(0))
      }
    ], new Value(0)))
  },

  // subquery:partyGroupCode
  {
    type: 'subquery',
    name: 'partyGroupCode',
    expression: re => new BinaryExpression(re['partyGroupCode'], '=', new Unknown()),
    unknowns: [['value', 0]],
    companions: ['table:sop_template_task']
  },

  // subquery:tableName
  {
    type: 'subquery',
    name: 'tableName',
    expression: re => new BinaryExpression(re['tableName'], '=', new Unknown()),
    unknowns: [['value', 0]]
  },

  // subquery:primaryKey
  {
    type: 'subquery',
    name: 'primaryKey',
    expression: re => new BinaryExpression(re['primaryKey'], '=', new Unknown()),
    unknowns: [['value', 0]]
  },

  // subquery:bookingNo
  {
    type: 'subquery',
    name: 'bookingNo',
    expression: re => new BinaryExpression(re['bookingNo'], '=', new Unknown()),
    unknowns: [['value', 0]],
    companions: ['table:booking']
  },

  // subquery:date
  {
    type: 'subquery',
    name: 'date',
    expression: re => new AndExpressions([
      new OrExpressions([
        new IsNullExpression(re['startAt'], false),
        new BinaryExpression(re['startAt'], '<', new Unknown())
      ]),
      new OrExpressions([
        new IsNullExpression(re['deadline'], false),
        new BinaryExpression(new Unknown(), '<', re['deadline'])
      ])
    ]),
    unknowns: [['from', 0], ['to', 1]],
  },

  // subquery:teams
  {
    type: 'subquery',
    name: 'teams',
    subqueryArg: re => ({ value }, params) => {
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
            $when: new BinaryExpression(re['tableName'], '=', new Value(bookingTable)),
            $then: inChargeExpression(bookingTable, me, value)
          },
          {
            $when: new BinaryExpression(re['tableName'], '=', new Value(shipmentTable)),
            $then: inChargeExpression(shipmentTable, me, value)
          }
        ], alwaysTrueExpression)
      }
      return result
    },
    companions: getEntityTable(['table:sop_template_task'], [bookingTable], [shipmentTable])
  },

  // subquery:notDone
  {
    type: 'subquery',
    name: 'notDone',
    expression: re => new BinaryExpression(re['isDone'], '=', new Value(0))
  },

  // subquery:isDue
  {
    type: 'subquery',
    name: 'isDue',
    expression: re => new BinaryExpression(re['isDue'], '=', new Value(1))
  },

  // subquery:isDead
  {
    type: 'subquery',
    name: 'isDead',
    expression: re => new BinaryExpression(re['isDead'], '=', new Value(1))
  },

  // subquery:notClosed
  {
    type: 'subquery',
    name: 'notClosed',
    expression: re => new BinaryExpression(re['isClosed'], '=', new Value(0))
  },

  // subquery:notSubTask
  {
    type: 'subquery',
    name: 'notSubTask',
    expression: re => new IsNullExpression(re['parentId'], false)
  },

  // subquery:notDeleted
  {
    type: 'subquery',
    name: 'notDeleted',
    expression: re => new BinaryExpression(re['isDeleted'], '=', new Value(0))
  },

  // subquery:notReferencedIn
  {
    type: 'subquery',
    name: 'notReferencedIn',
    subqueryArg: re => value => {
      if (Array.isArray(value.value) && value.value.length > 0) {
        return {
          $where: [
            new IsNullExpression(re['templateId'], true),
            new InExpression(re['taskId'], true, new Query({
              $distinct: true,
              $select: new ResultColumn(new ColumnExpression(templateTaskTable, 'id')),
              $from: new FromTable(templateTable,
                new JoinClause('LEFT', templateTemplateTaskTable,
                  new AndExpressions([
                    new BinaryExpression(new ColumnExpression(templateTemplateTaskTable, 'templateId'), '=', new ColumnExpression(templateTable, 'id')),
                    new IsNullExpression(new ColumnExpression(templateTemplateTaskTable, 'deletedAt'), false),
                    new IsNullExpression(new ColumnExpression(templateTemplateTaskTable, 'deletedBy'), false)
                  ])
                ),
                new JoinClause('LEFT', templateTaskTable,
                  new AndExpressions([
                    new BinaryExpression(new ColumnExpression(templateTemplateTaskTable, 'taskId'), '=', new ColumnExpression(templateTaskTable, 'id')),
                    new IsNullExpression(new ColumnExpression(templateTaskTable, 'deletedAt'), false),
                    new IsNullExpression(new ColumnExpression(templateTaskTable, 'deletedBy'), false)
                  ])
                )
              ),
              $where: [
                new InExpression(new ColumnExpression(templateTable, 'id'), false, new Value(value.value)),
                new IsNullExpression(new ColumnExpression(templateTable, 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression(templateTable, 'deletedBy'), false)
              ]
            }))
          ]
        }
      }
      else {
        return {
          $where: new IsNullExpression(re['templateId'], true)
        }
      }
    }
  },

  // subquery:notReferenced
  {
    type: 'subquery',
    name: 'notReferenced',
    subqueryArg: re => () => ({
      $where: new AndExpressions([
        new IsNullExpression(re['templateId'], true),
        new InExpression(re['taskId'], true, new Query({
          $distinct: true,
          $select: new ResultColumn(new ColumnExpression(templateTaskTable, 'id')),
          $from: new FromTable(selectedTemplateTable,
            new JoinClause('LEFT', templateTable, new AndExpressions([
              new BinaryExpression(new ColumnExpression(selectedTemplateTable, 'templateId'), '=', new ColumnExpression(templateTable, 'id')),
              new IsNullExpression(new ColumnExpression(templateTable, 'deletedAt'), false),
              new IsNullExpression(new ColumnExpression(templateTable, 'deletedBy'), false)
            ])),
            new JoinClause('LEFT', templateTemplateTaskTable, new AndExpressions([
              new BinaryExpression(new ColumnExpression(templateTemplateTaskTable, 'templateId'), '=', new ColumnExpression(templateTable, 'id')),
              new IsNullExpression(new ColumnExpression(templateTemplateTaskTable, 'deletedAt'), false),
              new IsNullExpression(new ColumnExpression(templateTemplateTaskTable, 'deletedBy'), false)
            ])),
            new JoinClause('LEFT', templateTaskTable, new AndExpressions([
              new BinaryExpression(new ColumnExpression(templateTemplateTaskTable, 'taskId'), '=', new ColumnExpression(templateTaskTable, 'id')),
              new IsNullExpression(new ColumnExpression(templateTaskTable, 'deletedAt'), false),
              new IsNullExpression(new ColumnExpression(templateTaskTable, 'deletedBy'), false)
            ]))
          ),
          $where: [
            new BinaryExpression(new ColumnExpression(selectedTemplateTable, 'tableName'), '=', re['tableName']),
            new BinaryExpression(new ColumnExpression(selectedTemplateTable, 'primaryKey'), '=', re['primaryKey']),
            new IsNullExpression(new ColumnExpression(selectedTemplateTable, 'deletedAt'), false),
            new IsNullExpression(new ColumnExpression(selectedTemplateTable, 'deletedBy'), false)
          ]
        }))
      ])
    })
  },

  // subquery:activeStatus
  {
    type: 'subquery',
    name: 'activeStatus',
    expression: re => new BinaryExpression(IfExpression(new BinaryExpression(re['isDeleted'], '=', new Value(1)), new Value('deleted'), new Value('active')), '=', new Unknown()),
    unknowns: [['value', 0]]
  }
]

export default query.useShortcuts(shortcuts)
