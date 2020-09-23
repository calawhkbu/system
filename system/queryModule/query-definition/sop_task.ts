import { QueryDef } from "classes/query/QueryDef";
import { ColumnExpression, ResultColumn, IsNullExpression, BinaryExpression, FunctionExpression, FromTable, JoinClause, Value, CaseExpression, Unknown, AndExpressions, MathExpression, OrExpressions, ICase, QueryExpression, Query, ExistsExpression, IExpression, InExpression, Expression, BinaryOperator, IQuery, ParameterExpression, OrderBy, BetweenExpression } from "node-jql";
import { IfExpression, alwaysTrueExpression, wrapOrder, IfNullExpression } from 'utils/jql-subqueries'
import { generalIsDeletedExpression, hasSubTaskQuery, generalIsDoneExpression, generalIsClosedExpression, inChargeExpression, getEntityExpression } from "utils/sop-task";
import { IShortcut } from 'classes/query/Shortcut'
import { IQueryParams } from "classes/query";

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
const shipmentBookingTable = 'shipment_booking'

const statusList = ['Dead', 'Due', 'Open', 'Not Ready', 'Done', 'Closed', 'Deleted']

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

  // table:shipment_booking
  {
    type: 'table',
    name: 'shipment_booking',
    fromTable: new FromTable(taskTable, new JoinClause('LEFT', shipmentBookingTable,
      new AndExpressions([
        new BinaryExpression(new ColumnExpression(shipmentTable, 'id'), '=', new ColumnExpression(shipmentBookingTable, 'shipmentId')),
        new IsNullExpression(new ColumnExpression(shipmentBookingTable, 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression(shipmentBookingTable, 'deletedBy'), false)
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

  // field:startAtLocale
  {
    type: 'field',
    name: 'startAtLocale',
    expression: new ColumnExpression(taskTable, 'startAtLocale')
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

  // field:dueAtLocale
  {
    type: 'field',
    name: 'dueAtLocale',
    expression: new ColumnExpression(taskTable, 'dueAtLocale')
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

  // field:deadlineLocale
  {
    type: 'field',
    name: 'deadlineLocale',
    expression: new ColumnExpression(taskTable, 'deadlineLocale')
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

  // field:defaultSeqNo
  {
    type: 'field',
    name: 'defaultSeqNo',
    expression: new ColumnExpression(templateTemplateTaskTable, 'seqNo'),
    registered: true,
    companions: ['table:sop_template_template_task']
  },

  // field:seqNo
  {
    type: 'field',
    name: 'seqNo',
    expression: re => IfExpression(new BinaryExpression(new ColumnExpression(taskTable, 'seqNo'), '=', new Value(0)), re['defaultSeqNo'], new ColumnExpression(taskTable, 'seqNo')),
    registered: true
  },

  // field:categorySeqNo
  {
    type: 'field',
    name: 'categorySeqNo',
    expression: re => new QueryExpression(new Query({
      $select: new ResultColumn(new ColumnExpression('temp_template', 'seqNo'), 'seqNo'),
      $from: new FromTable(templateTable, 'temp_template', new JoinClause('LEFT', new FromTable(selectedTemplateTable, 'temp_selected_template'), new AndExpressions([
        new BinaryExpression(new ColumnExpression('temp_selected_template', 'templateId'), '=', new ColumnExpression('temp_template', 'id')),
        new IsNullExpression(new ColumnExpression('temp_selected_template', 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression('temp_selected_template', 'deletedBy'), false)
      ]))),
      $where: [
        new BinaryExpression(new ColumnExpression('temp_selected_template', 'tableName'), '=', re['tableName']),
        new BinaryExpression(new ColumnExpression('temp_selected_template', 'primaryKey'), '=', re['primaryKey']),
        new IsNullExpression(new ColumnExpression('temp_template', 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression('temp_template', 'deletedBy'), false),
        new BinaryExpression(new ColumnExpression('temp_template', 'category'), '=', re['category'])
      ],
      $limit: 1
    }))
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
    expression: re => new FunctionExpression('CONCAT', re['partyGroupCode'], new Value('-'), re['partyGroupTaskId'])
  },

  // field:bookingNo
  {
    type: 'field',
    name: 'bookingNo',
    expression: re => new ColumnExpression(bookingTable, 'bookingNo'),
    registered: true,
    companions: ['table:booking']
  },

  // field:masterNo
  {
    type: 'field',
    name: 'masterNo',
    expression: new ColumnExpression(shipmentTable, 'masterNo'),
    companions: ['table:shipment'],
    registered: true
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
    expression: getEntityExpression('primaryNo', [bookingTable, 'bookingNo'], [shipmentTable, 'houseNo']),
    companions: ['table:booking', 'table:shipment'],
    registered: true
  },

  // field:vesselName
  {
    type: 'field',
    name: 'vesselName',
    expression: getEntityExpression('vesselName', [bookingTable], [shipmentTable, 'vessel']),
    registered: true,
    companions: ['table:booking', 'table:shipment']
  },

  // field:voyageFlightNumber
  {
    type: 'field',
    name: 'voyageFlightNumber',
    expression: getEntityExpression('voyageFlightNumber', [bookingTable], [shipmentTable]),
    registered: true,
    companions: ['table:booking', 'table:shipment']
  },

  // field:portOfLoadingCode
  {
    type: 'field',
    name: 'portOfLoadingCode',
    expression: getEntityExpression('portOfLoadingCode', [bookingTable], [shipmentTable]),
    companions: ['table:booking', 'table:shipment']
  },

  // field:portOfDischargeCode
  {
    type: 'field',
    name: 'portOfDischargeCode',
    expression: getEntityExpression('portOfDischargeCode', [bookingTable], [shipmentTable]),
    companions: ['table:booking', 'table:shipment']
  },

  // field:departureDate
  {
    type: 'field',
    name: 'departureDate',
    expression: getEntityExpression(
      'departureDate',
      ([tableName, dateTable, field]) => IfNullExpression(new ColumnExpression(dateTable, `${field}Actual`), new ColumnExpression(dateTable, `${field}Estimated`)),
      [bookingTable, bookingDateTable, 'departureDate'],
      [shipmentTable, shipmentDateTable, 'departureDate']
    ),
    companions: ['table:booking_date', 'table:shipment_date']
  },

  // field:arrivalDate
  {
    type: 'field',
    name: 'arrivalDate',
    expression: getEntityExpression(
      'arrivalDate',
      ([tableName, dateTable, field]) => IfNullExpression(new ColumnExpression(dateTable, `${field}Actual`), new ColumnExpression(dateTable, `${field}Estimated`)),
      [bookingTable, bookingDateTable, 'arrivalDate'],
      [shipmentTable, shipmentDateTable, 'arrivalDate']
    ),
    companions: ['table:booking_date', 'table:shipment_date']
  },

  // field:officePartyId
  {
    type: 'field',
    name: 'officePartyId',
    expression: getEntityExpression('officePartyId', [bookingTable, bookingPartyTable, 'forwarderPartyId'], [shipmentTable, shipmentPartyTable]),
    registered: true,
    companions: ['table:booking_party', 'table:shipment_party']
  },

  // field:shipperPartyId
  {
    type: 'field',
    name: 'shipperPartyId',
    expression: getEntityExpression('shipperPartyId', [bookingTable, bookingPartyTable], [shipmentTable, shipmentPartyTable]),
    registered: true,
    companions: ['table:booking_party', 'table:shipment_party']
  },

  // field:shipper
  {
    type: 'field',
    name: 'shipper',
    expression: getEntityExpression('shipper', [bookingTable, bookingPartyTable, 'shipperPartyName'], [shipmentTable, shipmentPartyTable, 'shipperPartyName']),
    companions: ['table:booking_party', 'table:shipment_party']
  },

  // field:consigneePartyId
  {
    type: 'field',
    name: 'consigneePartyId',
    expression: getEntityExpression('consigneePartyId', [bookingTable, bookingPartyTable], [shipmentTable, shipmentPartyTable]),
    registered: true,
    companions: ['table:booking_party', 'table:shipment_party']
  },

  // field:consignee
  {
    type: 'field',
    name: 'consignee',
    expression: getEntityExpression('consignee', [bookingTable, bookingPartyTable, 'consigneePartyName'], [shipmentTable, shipmentPartyTable, 'consigneePartyName']),
    companions: ['table:booking_party', 'table:shipment_party']
  },

  // field:agentPartyId
  {
    type: 'field',
    name: 'agentPartyId',
    expression: getEntityExpression('agentPartyId', [bookingTable, bookingPartyTable], [shipmentTable, shipmentPartyTable]),
    registered: true,
    companions: ['table:booking_party', 'table:shipment_party']
  },

  // field:agent
  {
    type: 'field',
    name: 'agent',
    expression: getEntityExpression('agent', [bookingTable, bookingPartyTable, 'agentPartyName'], [shipmentTable, shipmentPartyTable, 'agentPartyName']),
    companions: ['table:booking_party', 'table:shipment_party']
  },

  // field:roAgentPartyId
  {
    type: 'field',
    name: 'roAgentPartyId',
    expression: getEntityExpression('roAgentPartyId', [bookingTable, bookingPartyTable], [shipmentTable, shipmentPartyTable]),
    registered: true,
    companions: ['table:booking_party', 'table:shipment_party']
  },

  // field:linerAgentPartyId
  {
    type: 'field',
    name: 'linerAgentPartyId',
    expression: getEntityExpression('linerAgentPartyId', [bookingTable, bookingPartyTable], [shipmentTable, shipmentPartyTable]),
    registered: true,
    companions: ['table:booking_party', 'table:shipment_party']
  },

  // field:controllingCustomerPartyId
  {
    type: 'field',
    name: 'controllingCustomerPartyId',
    expression: getEntityExpression('controllingCustomerPartyId', [bookingTable, bookingPartyTable], [shipmentTable, shipmentPartyTable]),
    registered: true,
    companions: ['table:booking_party', 'table:shipment_party']
  },

  // field:picEmail
  {
    type: 'field',
    name: 'picEmail',
    expression: getEntityExpression('picEmail', [bookingTable], [shipmentTable]),
    registered: true,
    companions: ['table:booking', 'table:shipment']
  },

  // field:team
  {
    type: 'field',
    name: 'team',
    expression: getEntityExpression('team', [bookingTable], [shipmentTable]),
    registered: true,
    companions: ['table:booking', 'table:shipment']
  },

  // field:startAt
  {
    type: 'field',
    name: 'startAt',
    expression: re => IfNullExpression(
      IfNullExpression(re['inputStartAt'], re['calculatedStartAt']),
      IfNullExpression(new ColumnExpression('parent', 'inputStartAt'), new ColumnExpression('parent', 'startAt'))
    ),
    registered: true
  },

  // field:defaultStartAt
  {
    type: 'field',
    name: 'defaultStartAt',
    expression: re => IfNullExpression(
      re['calculatedStartAt'],
      IfNullExpression(new ColumnExpression('parent', 'inputStartAt'), new ColumnExpression('parent', 'startAt'))
    )
  },

  // field:dueAt
  {
    type: 'field',
    name: 'dueAt',
    expression: re => IfNullExpression(
      IfNullExpression(re['inputDueAt'], re['calculatedDueAt']),
      IfNullExpression(new ColumnExpression('parent', 'inputDueAt'), new ColumnExpression('parent', 'dueAt'))
    ),
    registered: true
  },

  // field:defaultDueAt
  {
    type: 'field',
    name: 'defaultDueAt',
    expression: re => IfNullExpression(
      re['calculatedDueAt'],
      IfNullExpression(new ColumnExpression('parent', 'inputDueAt'), new ColumnExpression('parent', 'dueAt'))
    )
  },

  // field:deadline
  {
    type: 'field',
    name: 'deadline',
    expression: re => IfNullExpression(
      IfNullExpression(re['inputDeadline'], re['calculatedDeadline']),
      IfNullExpression(new ColumnExpression('parent', 'inputDeadline'), new ColumnExpression('parent', 'deadline'))
    ),
    registered: true
  },

  // field:defaultDeadline
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

  // field:isStarted
  {
    type: 'field',
    name: 'isStarted',
    expression: re => new OrExpressions([
      new IsNullExpression(re['startAt'], false),
      new BinaryExpression(re['startAt'], '<=', new FunctionExpression('UTC_TIMESTAMP'))
    ]),
    registered: true
  },

  // field:startDays
  {
    type: 'field',
    name: 'startDays',
    expression: re => IfNullExpression(
      new FunctionExpression('GREATEST', new FunctionExpression('DATEDIFF', new FunctionExpression('UTC_TIMESTAMP'), re['startAt']), new Value(0)),
      new Value(0)
    )
  },

  // field:isDone
  {
    type: 'field',
    name: 'isDone',
    expression: re => IfExpression(re['hasSubTasks'], new ExistsExpression(hasSubTaskQuery('temp', generalIsDoneExpression('temp', true)), true), generalIsDoneExpression()),
    registered: true
  },

  // field:dueDays
  {
    type: 'field',
    name: 'dueDays',
    expression: re => IfNullExpression(
      new FunctionExpression('GREATEST', new FunctionExpression('DATEDIFF', new FunctionExpression('UTC_TIMESTAMP'), re['dueAt']), new Value(0)),
      new Value(0)
    )
  },

  // field:isDue
  {
    type: 'field',
    name: 'isDue',
    expression: re => new BinaryExpression(re['dueAt'], '<=', new FunctionExpression('UTC_TIMESTAMP')),
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
    expression: re => new BinaryExpression(re['deadline'], '<=', new FunctionExpression('UTC_TIMESTAMP')),
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
    ),
    registered: true
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

  // field:entityCreatedAt
  {
    type: 'field',
    name: 'entityCreatedAt',
    expression: re => new CaseExpression([
      {
        $when: new BinaryExpression(re['tableName'], '=', new Value(bookingTable)),
        $then: IfNullExpression(new ColumnExpression(bookingTable, 'bookingCreateTime'), new ColumnExpression(bookingTable, 'createdAt'))
      },
      {
        $when: new BinaryExpression(re['tableName'], '=', new Value(shipmentTable)),
        $then: IfNullExpression(new ColumnExpression(shipmentTable, 'shipmentCreateTime'), new ColumnExpression(shipmentTable, 'createdAt'))
      }
    ]),
    registered: true,
    companions: ['table:booking', 'table:shipment']
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
    unknowns: true
  },

  // subquery:tableName
  {
    type: 'subquery',
    name: 'tableName',
    expression: re => new BinaryExpression(re['tableName'], '=', new Unknown()),
    unknowns: true
  },

  // subquery:primaryKey
  {
    type: 'subquery',
    name: 'primaryKey',
    expression: re => new BinaryExpression(re['primaryKey'], '=', new Unknown()),
    unknowns: true
  },

  // subquery:search
  {
    type: 'subquery',
    name: 'search',
    expression: re => new OrExpressions([
      new BinaryExpression(re['primaryNo'], '=', new Unknown()),
      new BinaryExpression(re['masterNo'], '=', new Unknown())
    ]),
    unknowns: { noOfUnknowns: 2 }
  },

  // subquery:date
  {
    type: 'subquery',
    name: 'date',
    expression: re => new AndExpressions([
      new OrExpressions([
        new IsNullExpression(re['startAt'], false),
        new BinaryExpression(re['startAt'], '<=', new Unknown())
      ]),
      new OrExpressions([
        new IsNullExpression(re['deadline'], false),
        new BinaryExpression(new Unknown(), '<=', re['deadline'])
      ])
    ]),
    unknowns: { fromTo: true },
  },

  // subquery:teams
  {
    type: 'subquery',
    name: 'teams',
    subqueryArg: re => ({ value }, params) => {
      const me = typeof params.subqueries.user === 'object' && 'value' in params.subqueries.user ? params.subqueries.user.value : ''
      return {
        $where: new CaseExpression([
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
    },
    companions: ['table:sop_template_task', 'table:booking', 'table:shipment']
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

  // subquery:category
  {
    type: 'subquery',
    name: 'category',
    expression: re => new BinaryExpression(re['category'], '=', new Unknown()),
    unknowns: true
  },

  // subquery:pic
  {
    type: 'subquery',
    name: 'pic',
    expression: re => new BinaryExpression(re['picEmail'], '=', new Unknown()),
    unknowns: true
  },

  // subquery:team
  {
    type: 'subquery',
    name: 'team',
    expression: re => new BinaryExpression(re['team'], '=', new Unknown()),
    unknowns: true
  },

  // subquery:activeStatus
  {
    type: 'subquery',
    name: 'activeStatus',
    expression: re => new BinaryExpression(IfExpression(new BinaryExpression(re['isDeleted'], '=', new Value(1)), new Value('deleted'), new Value('active')), '=', new Unknown()),
    unknowns: true
  },

  // subquery:vesselName
  {
    type: 'subquery',
    name: 'vesselName',
    expression: re => new BinaryExpression(re['vesselName'], '=', new Unknown()),
    unknowns: true
  },

  // subquery:voyageFlightNumber
  {
    type: 'subquery',
    name: 'voyageFlightNumber',
    expression: re => new BinaryExpression(re['voyageFlightNumber'], '=', new Unknown()),
    unknowns: true
  },

  // subquery:shipperPartyId
  {
    type: 'subquery',
    name: 'shipperPartyId',
    expression: re => new InExpression(re['shipperPartyId'], false, new Unknown()),
    unknowns: true
  },

  // subquery:consigneePartyId
  {
    type: 'subquery',
    name: 'consigneePartyId',
    expression: re => new InExpression(re['consigneePartyId'], false, new Unknown()),
    unknowns: true
  },

  // subquery:officePartyId
  {
    type: 'subquery',
    name: 'officePartyId',
    expression: re => new InExpression(re['officePartyId'], false, new Unknown()),
    unknowns: true
  },

  // subquery:agentPartyId
  {
    type: 'subquery',
    name: 'agentPartyId',
    expression: re => new InExpression(re['agentPartyId'], false, new Unknown()),
    unknowns: true
  },

  // subquery:roAgentPartyId
  {
    type: 'subquery',
    name: 'roAgentPartyId',
    expression: re => new InExpression(re['roAgentPartyId'], false, new Unknown()),
    unknowns: true
  },

  // subquery:linerAgentPartyId
  {
    type: 'subquery',
    name: 'linerAgentPartyId',
    expression: re => new InExpression(re['linerAgentPartyId'], false, new Unknown()),
    unknowns: true
  },

  // subquery:controllingCustomerPartyId
  {
    type: 'subquery',
    name: 'controllingCustomerPartyId',
    expression: re => new InExpression(re['controllingCustomerPartyId'], false, new Unknown()),
    unknowns: true
  },

  // subquery:createdAtBetween
  {
    type: 'subquery',
    name: 'createdAtBetween',
    expression: re => new BetweenExpression(re['entityCreatedAt'], false, new Unknown(), new Unknown()),
    unknowns: { fromTo: true }
  },

  // orderBy:seqNo
  {
    type: 'orderBy',
    name: 'seqNo',
    queryArg: re => () => ({
      $order: [
        ...wrapOrder(new ColumnExpression('categorySeqNo')),
        ...wrapOrder(re['seqNo'])
      ]
    }),
    companions: ['field:categorySeqNo']
  },

  // orderBy:status
  {
    type: 'orderBy',
    name: 'status',
    queryArg: re => () => ({
      $order: [
        new OrderBy(new FunctionExpression('FIELD', re['status'], ...statusList.map(v => new Value(v)))),
        ...wrapOrder(re['seqNo'])
      ]
    })
  },

  // orderBy:dueAt
  {
    type: 'orderBy',
    name: 'dueAt',
    queryArg: re => () => ({
      $order: [
        ...wrapOrder(re['dueAt']),
        ...wrapOrder(re['seqNo'])
      ]
    })
  },

  // orderBy:dueAt
  {
    type: 'orderBy',
    name: 'startAt',
    queryArg: re => () => ({
      $order: [
        new OrderBy(re['startAt']),
        ...wrapOrder(re['seqNo'])
      ]
    })
  }
]

export default query.useShortcuts(shortcuts)
