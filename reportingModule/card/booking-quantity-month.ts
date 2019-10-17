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
  JoinClause,
  IConditionalExpression,
} from 'node-jql'
import { parseCode } from 'utils/function'

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function prepareParams(currentMonth?: boolean): Function {
  const fn = function(require, session, params) {
    const moment = require('moment')
    const subqueries = (params.subqueries = params.subqueries || {})

    if (subqueries.date) {
      // get the year part of the "from date"
      let month = moment(subqueries.date.from, 'YYYY-MM-DD').month()

      // change the from / to date
      if (!currentMonth) {
        month -= 1
      }
      // reset the date.from and date.to depending on date.from YEAR
      subqueries.date.from = moment()
        .month(month)
        .startOf('month')
        .format('YYYY-MM-DD')
      subqueries.date.to = moment()
        .month(month)
        .endOf('month')
        .format('YYYY-MM-DD')

      // console.log('subqueries.date.from', subqueries.date.from)
      // console.log('subqueries.date.to', subqueries.date.to)
    }

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
        new ResultColumn(new ColumnExpression(name, 'jobMonth')),
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
            subqueries: {
              jobMonth: true,
            },
            // include jobMonth from the table
            fields: ['jobMonth', 'booking.*', 'booking_popacking.*'],
          },
        },
        name
      ),
      $group: new GroupBy([
        new ColumnExpression(name, 'moduleTypeCode'),
        new ColumnExpression(name, 'jobMonth'),
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

function prepareMonthTable(name: string): CreateTableJQL {
  const $select = [
    new ResultColumn(new ColumnExpression('tempTable', 'moduleTypeCode'), 'moduleTypeCode'),
  ]

  months.map((month: string) => {
    $select.push(
      new ResultColumn(
        new FunctionExpression(
          'IFNULL',
          new FunctionExpression(
            'FIND',

            new AndExpressions([
              new BinaryExpression(
                new FunctionExpression(
                  'MONTHNAME',
                  new ColumnExpression('tempTable', 'jobMonth'),
                  'YYYY-MM'
                ),
                '=',
                month
              ),
              new BinaryExpression(
                new ColumnExpression('tempTable', 'moduleTypeCode'),
                '=',
                new ColumnExpression('moduleTypeCode')
              ),
            ]),
            new ColumnExpression('quantity')
          ),
          0
        ),
        month.substr(0, 3)
      )
    )
  })

  return new CreateTableJQL({
    $temporary: true,
    name,
    $as: new Query({
      $select,
      $from: 'tempTable',
      $group: 'moduleTypeCode',
    }),
  })
}

export default [
  [prepareParams(), prepareTable('tempTable')],
  prepareMonthTable('month'),
  prepareModuleCodeTable('module'),
  insertModuleCodeTable('module'),

  new Query({
    $select: [
      new ResultColumn(new ColumnExpression('module', 'moduleTypeCode')),
      new ResultColumn(
        new FunctionExpression('IFNULL', new ColumnExpression('month', 'Jan'), 0),
        'Jan'
      ),
      new ResultColumn(
        new FunctionExpression('IFNULL', new ColumnExpression('month', 'Feb'), 0),
        'Feb'
      ),
      new ResultColumn(
        new FunctionExpression('IFNULL', new ColumnExpression('month', 'Mar'), 0),
        'Mar'
      ),
      new ResultColumn(
        new FunctionExpression('IFNULL', new ColumnExpression('month', 'Apr'), 0),
        'Apr'
      ),
      new ResultColumn(
        new FunctionExpression('IFNULL', new ColumnExpression('month', 'May'), 0),
        'May'
      ),
      new ResultColumn(
        new FunctionExpression('IFNULL', new ColumnExpression('month', 'Jun'), 0),
        'Jun'
      ),
      new ResultColumn(
        new FunctionExpression('IFNULL', new ColumnExpression('month', 'Jul'), 0),
        'Jul'
      ),
      new ResultColumn(
        new FunctionExpression('IFNULL', new ColumnExpression('month', 'Aug'), 0),
        'Aug'
      ),
      new ResultColumn(
        new FunctionExpression('IFNULL', new ColumnExpression('month', 'Sep'), 0),
        'Sep'
      ),
      new ResultColumn(
        new FunctionExpression('IFNULL', new ColumnExpression('month', 'Oct'), 0),
        'Oct'
      ),
      new ResultColumn(
        new FunctionExpression('IFNULL', new ColumnExpression('month', 'Nov'), 0),
        'Nov'
      ),
      new ResultColumn(
        new FunctionExpression('IFNULL', new ColumnExpression('month', 'Dec'), 0),
        'Dec'
      ),
    ],

    $from: new FromTable(
      'module',
      new JoinClause(
        'LEFT',
        'month',
        new BinaryExpression(
          new ColumnExpression('module', 'moduleTypeCode'),
          '=',
          new ColumnExpression('month', 'moduleTypeCode')
        )
      )
    ),
  }),
]
