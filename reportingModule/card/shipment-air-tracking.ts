import { Query, FromTable, CreateTableJQL, ResultColumn, ColumnExpression, FunctionExpression, GroupBy, JoinClause, BinaryExpression, ParameterExpression } from "node-jql"

function prepareParams(): Function {
  return function (require, session, params) {
    // import
    const { BadRequestException } = require('@nestjs/common')

    // script
    const subqueries = params.subqueries = params.subqueries || {}
    if (!subqueries.lastStatusDate) throw new BadRequestException('MISSING_LAST_STATUS_DATE')
    subqueries.moduleType = { value: 'AIR' }
    return params
  }
}

export default [
  [prepareParams(), new CreateTableJQL({
    $temporary: true,
    name: 'status_master',
    $as: new Query({
      $from: new FromTable({
        url: 'api/statusMaster/query/tracking-flow-air',
        columns: [
          { name: 'group', type: 'string' },
          { name: 'status', type: 'string' }
        ]
      }, 'status_master')
    })
  })],
  [prepareParams(), new CreateTableJQL({
    $temporary: true,
    name: 'tracking',
    $as: new Query({
      $from: new FromTable({
        method: 'POST',
        url: 'q/tracking',
        columns: [
          { name: 'tracking.trackingNo', type: 'string', $as: 'trackingNo' },
          { name: 'tracking_reference.masterNo', type: 'string', $as: 'masterNo' },
          { name: 'tracking_reference.carrierBookingNo', type: 'Array', $as: 'bookingNo' },
          { name: 'tracking_reference.containerNo', type: 'Array', $as: 'containerNo' },
          { name: 'tracking.lastStatus', type: 'string', $as: 'lastStatus' }
        ]
      }, 'tracking')
    })
  })],
  new Query({
    $select: [
      new ResultColumn(new ColumnExpression('sm', 'group'), 'group'),
      new ResultColumn(new FunctionExpression('COUNT', new ParameterExpression({ prefix: 'DISTINCT', expression: new ColumnExpression('t', 'trackingNo') })), 'count')
    ],
    $from: new FromTable('tracking', 't',
      new JoinClause('LEFT', new FromTable('status_master', 'sm'), new BinaryExpression(new ColumnExpression('t', 'lastStatus'), '=', new ColumnExpression('sm', 'status')))
    ),
    $group: new GroupBy(new ColumnExpression('sm', 'group'))
  })
]