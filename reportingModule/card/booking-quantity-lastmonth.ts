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

function prepareParams(currentMonth?: boolean): Function {
  const fn = function(require, session, params) {
    const moment = require('moment')
    const subqueries = (params.subqueries = params.subqueries || {})

    // get the year part of the "from date"
    let month = moment().month()

    // change the from / to date
    if (!currentMonth) {
      month -= 1
    }

    subqueries.date = {}

    // reset the date.from and date.to depending on date.from YEAR
    subqueries.date.from = moment()
      .month(month)
      .startOf('month')
      .format('YYYY-MM-DD')
    subqueries.date.to = moment()
      .month(month)
      .endOf('month')
      .format('YYYY-MM-DD')

    console.log('subqueries.date.from', subqueries.date.from)
    console.log('subqueries.date.to', subqueries.date.to)

    return params
  }
  let code = fn.toString()
  code = code.replace(new RegExp('currentMonth', 'g'), String(currentMonth))
  return parseCode(code)
}

function prepareTable(name: string): CreateTableJQL {
  return new CreateTableJQL({
    $temporary: true,
    name,
    $as: new Query({
      $select: [
        new ResultColumn(new ColumnExpression(name, 'moduleTypeCode')),
        new ResultColumn(new ColumnExpression(name, 'jobMonth'), name),
        new ResultColumn(
          new FunctionExpression(
            'IFNULL',
            new FunctionExpression('SUM', new ColumnExpression(name, 'quantity')),
            0
          ),
          'quantity'
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
              name: 'quantity',
              type: 'number',
            },
            {
              name: 'jobMonth',
              type: 'string',
            },
          ],

          data: {
            // subqueries: {
            //   jobMonth: true,
            // },
            // include jobMonth from the table
            fields: [
              'jobMonth',
              'moduleTypeCode',
              new ColumnExpression('booking', 'id'),
              new ColumnExpression('booking_popacking', 'quantity')
            ],
          },
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
  [prepareParams(), prepareTable('lastMonth')],
  [prepareParams(true), prepareTable('currentMonth')],

  new Query({
    $select: [
      new ResultColumn(new ColumnExpression('module', 'moduleTypeCode')),
      new ResultColumn(
        new FunctionExpression('IFNULL', new ColumnExpression('currentMonth', 'quantity'), 0),
        'current'
      ),
      new ResultColumn(
        new FunctionExpression('IFNULL', new ColumnExpression('lastMonth', 'quantity'), 0),
        'last'
      ),
    ],

    $from: new FromTable(
      'module',
      'module',
      {
        operator: 'LEFT',
        table: 'lastMonth',
        $on: new BinaryExpression(
          new ColumnExpression('lastMonth', 'moduleTypeCode'),
          '=',
          new ColumnExpression('module', 'moduleTypeCode')
        ),
      },

      {
        operator: 'LEFT',
        table: 'currentMonth',
        $on: new BinaryExpression(
          new ColumnExpression('currentMonth', 'moduleTypeCode'),
          '=',
          new ColumnExpression('module', 'moduleTypeCode')
        ),
      }
    ),
  }),
]
