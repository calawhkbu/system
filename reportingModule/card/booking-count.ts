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

function prepareBookingParams(): Function {
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

    params.fields = ['moduleTypeCode', 'noOfBookings', 'primaryKeyListString']

    params.groupBy = ['moduleTypeCode']

    return params
  }
  const code = fn.toString()
  return parseCode(code)
}

function prepareBookingTable(): CreateTableJQL {
  const name = 'booking'

  return new CreateTableJQL({
    $temporary: true,
    name,
    $as: new Query({
      $select: [
        new ResultColumn(new ColumnExpression(name, 'moduleTypeCode'), 'moduleTypeCode'),
        new ResultColumn(new ColumnExpression(name, 'noOfBookings'), 'count'), // rename noOfBookings into Count
        new ResultColumn(
          new ColumnExpression(name, 'primaryKeyListString'),
          'primaryKeyListString'
        ),
      ],
      $from: new FromTable(
        {
          method: 'POST',
          url: 'api/booking/query/booking',
          columns: [
            {
              name: 'moduleTypeCode',
              type: 'string',
            },

            {
              name: 'noOfBookings',
              type: 'number',
            },

            {
              name: 'primaryKeyListString',
              type: 'string',
            },
          ],
        },
        name
      ),
    }),
  })
}

export default [
  // hardcode the module table
  prepareModuleCodeTable('module'),
  insertModuleCodeTable('module'),

  [prepareBookingParams(), prepareBookingTable()],

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
