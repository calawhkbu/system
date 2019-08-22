import { Column, ColumnExpression, CreateTableJQL, FunctionExpression, JoinClause, Query, ResultColumn } from 'node-jql'
import { Session } from 'node-jql-core'

function prepareParams (check?: boolean): Function {
  if (check) {
    return function (require, session, params) {
      // import
      const { BadRequestException } = require('@nestjs/common')
      const moment = require('moment')

      // script
      const subqueries = params.subqueries || {}
      if (!subqueries.date) throw new BadRequestException('MISSING_DATE')
      const datefr = moment(subqueries.date.from, 'YYYY-MM-DD')
      const dateto = moment(subqueries.date.to, 'YYYY-MM-DD')
      if (dateto.diff(datefr, 'months', true) > 1) throw new BadRequestException('DATE_RANGE_TOO_LARGE')
      if (!subqueries.moduleType) throw new BadRequestException('MISSING_MODULE_TYPE')
      if (!subqueries.lastStatus) throw new BadRequestException('MISSING_LAST_STATUS')
      return params
    }
  }
  return function (require, session, params) {
    return params
  }
}

export default [
  // prepare tables
  [prepareParams(true), function (require, session, params) {
    // import
    const { CreateTableJQL, FromTable, Query } = require('node-jql')

    // script
    const subqueries = params.subqueries || {}
    return new CreateTableJQL({
      $temporary: true,
      name: 'status_master',
      $as: new Query({
        $from: new FromTable({
          url: `api/statusMaster/query/tracking-flow-${subqueries.moduleType.value}`,
          columns: [
            { name: 'group', type: 'string' },
            { name: 'status', type: 'string' }
          ]
        }, 'status_master')
      })
    })
  }],
  [prepareParams(), function (require, session, params) {
    // import
    const { BinaryExpression, ColumnExpression, CreateTableJQL, FromTable, Query } = require('node-jql')

    // script
    return new CreateTableJQL({
      $temporary: true,
      name: 'tracking',
      $as: new Query({
        $from: new FromTable({
          method: 'POST',
          url: 'api/tracking',
          columns: [
            { name: 'tracking.trackingNo', type: 'string', $as: 'trackingNo' },
            { name: 'tracking.lastStatus', type: 'string', $as: 'lastStatus' },
            { name: 'tracking.lastStatusDate', type: 'Date', $as: 'lastStatusDate' },
            { name: 'tracking_reference.masterNo', type: 'string', $as: 'masterNo' },
            { name: 'tracking_reference.carrierBookingNo', type: 'Array', $as: 'bookingNo' },
            { name: 'tracking_reference.containerNo', type: 'Array', $as: 'containerNo' }
          ]
        }, 'tracking', new JoinClause('LEFT', 'status_master',
          new BinaryExpression(new ColumnExpression('tracking', 'lastStatus'), '=', new ColumnExpression('status_master', 'status'))
        )),
        $where: new BinaryExpression(new ColumnExpression('status_master', 'group'), '=', params.lastStatus.value)
      })
    })
  }],
  new CreateTableJQL(true, 'entities', [
    new Column('tableName', 'string'),
    new Column('trackingNo', 'string'),
    new Column('shipper', 'string'),
    new Column('consignee', 'string'),
    new Column('lastStatus', 'string'),
    new Column('lastStatusDate', 'Date'),
    new Column('portOfLoading', 'string'),
    new Column('portOfDischarge', 'string'),
    new Column('estimatedDepartureDate', 'Date'),
    new Column('estimatedArrivalDate', 'Date')
  ]),

  // retrieve shipments
  [prepareParams(), async function (require, session: Session, params) {
    // import
    const { FromTable, InsertJQL, Query, Resultset } = require('node-jql')

    // script
    const result = [] as any[]
    const trackings = new Resultset(await session.query(new Query('tracking'))).toArray() as any[]
    for (const { trackingNo, lastStatus, lastStatusDate, masterNo, bookingNo = [], containerNo = [] } of trackings) {
      const shipments = new Resultset(await session.query(new Query({
        $from: new FromTable({
          method: 'POST',
          url: 'api/shipment/query/shipment',
          columns: [
            // TODO shipper
            // TODO consignee
            // TODO portOfLoading
            // TODO portOfDischarge
            // TODO estimatedDepartureDate
            // TODO estimatedArrivalDate
          ],
          data: {
            subqueries: {
              masterNo: { value: masterNo },
              bookingNo: { value: bookingNo },
              containerNo: { value: containerNo },
            }
          }
        })
      }))).toArray() as any[]
      result.push(shipments.map(s => ({ tableName: 'shipment', trackingNo, lastStatus, lastStatusDate, ...s })))
    }

    return new InsertJQL('entities', ...result)
  }],

  // retrieve bookings
  [prepareParams(), async function (require, session: Session, params) {
    // import
    const { FromTable, InsertJQL, Query, Resultset } = require('node-jql')

    // script
    const result = [] as any[]
    const trackings = new Resultset(await session.query(new Query('tracking'))).toArray() as any[]
    for (const { trackingNo, lastStatus, lastStatusDate, masterNo, bookingNo = [], containerNo = [] } of trackings) {
      const bookings = new Resultset(await session.query(new Query({
        $from: new FromTable({
          method: 'POST',
          url: 'api/booking/query/booking',
          columns: [
            // TODO shipper
            // TODO consignee
            // TODO portOfLoading
            // TODO portOfDischarge
            // TODO estimatedDepartureDate
            // TODO estimatedArrivalDate
          ],
          data: {
            subqueries: {
              masterNo: { value: masterNo },
              bookingNo: { value: bookingNo },
              containerNo: { value: containerNo },
            }
          }
        })
      }))).toArray() as any[]
      result.push(bookings.map(s => ({ tableName: 'booking', trackingNo, lastStatus, lastStatusDate, ...s })))
    }

    return new InsertJQL('entities', ...result)
  }],

  // finalize
  new Query({
    $select: [
      new ResultColumn('trackingNo', '__id'),
      new ResultColumn('trackingNo', '__value'),
      new ResultColumn(new FunctionExpression('ROWS', new ColumnExpression('*')), '__rows')
    ],
    $from: 'entities',
    $group: 'trackingNo'
  })
]
