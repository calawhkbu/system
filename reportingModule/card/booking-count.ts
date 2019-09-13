import {
  Query,
  FromTable,
  CreateTableJQL,
  GroupBy,
  ResultColumn,
  ColumnExpression,
  FunctionExpression,
  AndExpressions,
  BinaryExpression,
  InsertJQL,
  Column,
} from 'node-jql'
import { parseCode } from 'utils/function'

function prepareBookingParams(currentMonth?: boolean): Function {
  const fn = function(require, session, params) {
    const { BadRequestException } = require('@nestjs/common')
    const moment = require('moment')

    const subqueries = (params.subqueries = params.subqueries || {})

    if (!subqueries.date) {
      subqueries.date = {}

      const month = moment().month()

      subqueries.date.from = moment()
        .month(month)
        .startOf('month')
        .format('YYYY-MM-DD')
      subqueries.date.to = moment()
        .month(month)
        .endOf('month')
        .format('YYYY-MM-DD')
    }

    return params
  }
  let code = fn.toString()
  code = code.replace(new RegExp('currentMonth', 'g'), String(currentMonth))
  return parseCode(code)
}

function prepareBookingTable(name: string): CreateTableJQL {
  return new CreateTableJQL({
    $temporary: true,
    name,
    $as: new Query({
      $select: [
        new ResultColumn(new ColumnExpression(name, 'moduleTypeCode'), 'moduleTypeCode'),

        new ResultColumn(
          new FunctionExpression('GROUP_CONCAT', new ColumnExpression(name, 'bookingId')),
          'primaryKeyListString'
        ),

        new ResultColumn(
          new FunctionExpression('count', new ColumnExpression(name, 'bookingId')),
          'count'
        ),
      ],
      $from: new FromTable(
        {
          method: 'POST',
          url: 'api/booking/query/booking',
          columns: [
            {
              name: 'bookingId',
              type: 'string',
            },

            {
              name: 'moduleTypeCode',
              type: 'string',
            },
          ],
        },
        name
      ),
      $group: new GroupBy([
        new ColumnExpression(name, 'moduleTypeCode'),
        // new ColumnExpression(name, 'year')
      ]),
    }),
  })
}

function prepareModuleCodeTable(name: string): CreateTableJQL {
  return new CreateTableJQL({
    $temporary: true,
    name,
    columns: [new Column('moduleTypeCode', 'string')],
  })
}

function insertModuleCodeTable(name: string): InsertJQL {
  return new InsertJQL(
    name,
    { moduleTypeCode: 'AIR' },
    { moduleTypeCode: 'SEA' },
    { moduleTypeCode: 'ROAD' }
  )
}

export default [
  prepareModuleCodeTable('module'),
  insertModuleCodeTable('module'),
  [prepareBookingParams(), prepareBookingTable('booking')],

  new Query({
    $select: [
      new ResultColumn(new ColumnExpression('module', 'moduleTypeCode'), 'moduleTypeCode'),
      new ResultColumn(
        new FunctionExpression('IFNULL', new ColumnExpression('booking', 'count'), 0),
        'count'
      ),
      new ResultColumn(
        new FunctionExpression(
          'IFNULL',
          new ColumnExpression('booking', 'primaryKeyListString'),
          ''
        ),
        'primaryKeyListString'
      ),
    ],

    $from: new FromTable('module', 'module', {
      operator: 'LEFT',
      table: 'booking',
      $on: new BinaryExpression(
        new ColumnExpression('booking', 'moduleTypeCode'),
        '=',
        new ColumnExpression('module', 'moduleTypeCode')
      ),
    }),
  }),
]
