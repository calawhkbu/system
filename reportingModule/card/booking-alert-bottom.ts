import {
  ColumnExpression,
  CreateTableJQL,
  FromTable,
  InExpression,
  BetweenExpression,
  FunctionExpression,
  BinaryExpression,
  GroupBy,
  Query,
  ResultColumn,
} from 'node-jql'
import { parseCode } from 'utils/function'

function prepareAlertParams(): Function {
  return function(require, session, params) {
    // import
    const { BadRequestException } = require('@nestjs/common')
    const moment = require('moment')

    // script
    const subqueries = (params.subqueries = params.subqueries || {})

    // this should be getting from previous card
    if (!subqueries.withinHours) throw new BadRequestException('MISSING_withinHours')

    const withinHours = params.subqueries.withinHours
    subqueries.createdAt = {
      from: moment().subtract(withinHours.value, 'hours'),
      to: moment(),
    }

    subqueries.entityType = { value: 'booking' }

    console.log('subqueries', subqueries)

    return params
  }
}

function prepareAlertTable(name: string): CreateTableJQL {
  return new CreateTableJQL({
    $temporary: true,
    name,
    $as: new Query({
      $select: [new ResultColumn('id'), new ResultColumn('primaryKey')],

      $from: new FromTable(
        {
          method: 'POST',
          url: 'api/alert/query/alert',
          columns: [
            { name: 'id', type: 'number' },
            { name: 'alertType', type: 'string' },
            { name: 'primaryKey', type: 'string' },
            { name: 'tableName', type: 'string' },
          ],
        },
        name
      ),
    }),
  })
}

function prepareBookingParams(): Function {
  const fn = async function(require, session, params) {
    const { Resultset } = require('node-jql-core')
    const {
      ColumnExpression,
      CreateTableJQL,
      FromTable,
      InExpression,
      BetweenExpression,
      FunctionExpression,
      BinaryExpression,
      GroupBy,
      Query,
      ResultColumn,
    } = require('node-jql')

    const resultSet = new Resultset(
      await session.query(
        new Query({
          $select: [
            // new ResultColumn(new ColumnExpression('alert','id')),
            new ResultColumn(new ColumnExpression('alert', 'primaryKey')),
          ],
          $from: 'alert',
        })
      )
    ).toArray()

    // get the idList from the alertTable result set
    const idList = resultSet.map(({ primaryKey }) => primaryKey)

    // import
    const { BadRequestException } = require('@nestjs/common')
    const moment = require('moment')

    // script
    const subqueries = (params.subqueries = params.subqueries || {})

    let month = moment().month()

    // get the idList
    subqueries.idList = {
      value: idList,
    }

    return params
  }

  let code = fn.toString()
  return parseCode(code)
}

function prepareBookingable(name: string): CreateTableJQL {
  return new CreateTableJQL({
    $temporary: true,
    name,
    $as: new Query({
      $select: [new ResultColumn('moduleTypeCode'), new ResultColumn('bookingNo')],

      $from: new FromTable(
        {
          method: 'POST',
          url: 'api/booking/query/booking',
          columns: [
            { name: 'moduleTypeCode', type: 'string' },
            { name: 'bookingNo', type: 'string' },
          ],
        },
        name
      ),
    }),
  })
}

export default [
  [prepareAlertParams(), prepareAlertTable('alert')],
  [prepareBookingParams(), prepareBookingable('booking')],

  new Query({
    $from: 'booking',
  }),
]
