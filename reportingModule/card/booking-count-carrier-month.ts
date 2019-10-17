import {
  Query,
  FromTable,
  CreateTableJQL,
  ResultColumn,
  ColumnExpression,
  FunctionExpression,
  GroupBy,
  BinaryExpression,
  AndExpressions,
  IsNullExpression,
} from 'node-jql'
import { parseCode } from 'utils/function'

const monthMap = new Map<string, string>([
  ['Jan', 'January'],
  ['Feb', 'February'],
  ['Mar', 'March'],
  ['Apr', 'April'],
  ['May', 'May'],
  ['Jun', 'June'],
  ['Jul', 'July'],
  ['Aug', 'August'],
  ['Sep', 'September'],
  ['Oct', 'October'],
  ['Nov', 'November'],
  ['Dec', 'December'],
])

function prepareParams(): Function {
  const fn = function(require, session, params) {
    const moment = require('moment')
    const subqueries = (params.subqueries = params.subqueries || {})
    if (subqueries.date) {
      // get the year part of the "from date"
      const year = moment(subqueries.date.from, 'YYYY-MM-DD').year()

      // reset the date.from and date.to depending on date.from YEAR
      subqueries.date.from = moment()
        .year(year)
        .startOf('year')
        .format('YYYY-MM-DD')
      subqueries.date.to = moment()
        .year(year)
        .endOf('year')
        .format('YYYY-MM-DD')
    }

    subqueries.moduleTypeCode = {
      value: ['AIR'],
    }

    return params
  }

  const code = fn.toString()
  return parseCode(code)
}

function prepareCodeMasterParams(): Function {
  const fn = function(require, session, params) {
    const subqueries = (params.subqueries = params.subqueries || {})

    subqueries.codeType = {
      value: 'carrier',
    }

    return params
  }
  const code = fn.toString()
  return parseCode(code)
}

function prepareCodeMasterTable(name: string): CreateTableJQL {
  return new CreateTableJQL({
    $temporary: true,
    name,

    $as: new Query({
      $from: new FromTable(
        {
          method: 'POST',
          url: 'api/code/query/code_master',
          columns: [
            {
              name: 'id',
              type: 'number',
            },
            {
              name: 'code',
              type: 'string',
            },
            {
              name: 'codeType',
              type: 'string',
            },
          ],
        },
        name
      ),
    }),
  })
}

// a temp table that Group by carrierCode and JobMonth
function prepareTempTable(name: string): CreateTableJQL {
  return new CreateTableJQL({
    $temporary: true,
    name,
    $as: new Query({
      $select: [
        new ResultColumn(new ColumnExpression(name, 'jobMonth'), 'jobMonth'),
        new ResultColumn(new ColumnExpression(name, 'carrierCode'), 'carrierCode'),
        new ResultColumn(
          new FunctionExpression('COUNT', new ColumnExpression(name, 'carrierCode')),
          'count'
        ),
      ],
      $from: new FromTable(
        {
          method: 'POST',
          url: 'api/booking/query/booking',
          columns: [
            {
              name: 'carrierCode',
              type: 'string',
            },
            {
              name: 'moduleTypeCode',
              type: 'string',
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
            fields: ['jobMonth', 'booking.*'],
          },
        },
        name
      ),

      $group: new GroupBy([
        new ColumnExpression(name, 'carrierCode'),
        new ColumnExpression(name, 'jobMonth'),
      ]),

      $where: [
        new BinaryExpression(new ColumnExpression(name, 'moduleTypeCode'), '=', 'AIR'),
        //  new IsNullExpression(new ColumnExpression(name, 'carrierCode'), true),
      ],
    }),
  })
}

function prepareMonthTable(fromTableName: string, name: string) {
  const queryObject = {
    $select: [new ResultColumn(new ColumnExpression('tempTable', 'carrierCode'), 'carrierCode')],

    $from: fromTableName,
    $group: 'carrierCode',
  }

  for (const [monthkey, monthName] of monthMap.entries()) {
    queryObject.$select.push(
      new ResultColumn(
        new FunctionExpression(
          'IFNULL',
          new FunctionExpression(
            'FIND',

            new AndExpressions([
              new BinaryExpression(
                new FunctionExpression(
                  'MONTHNAME',
                  new ColumnExpression(fromTableName, 'jobMonth'),
                  'YYYY-MM'
                ),
                '=',
                monthName
              ),
              new BinaryExpression(
                new ColumnExpression(fromTableName, 'carrierCode'),
                '=',
                new ColumnExpression('carrierCode')
              ),
            ]),

            new ColumnExpression('count')
          ),
          0
        ),
        monthkey
      )
    )
  }

  return new CreateTableJQL({
    $temporary: true,
    name,
    $as: new Query(queryObject),
  })
}

export default [
  [prepareParams(), prepareTempTable('tempTable')],
  [prepareCodeMasterParams(), prepareCodeMasterTable('code_master')],
  prepareMonthTable('tempTable', 'month'),

  new Query({
    $select: [
      new ResultColumn(new ColumnExpression('code_master', 'code'), 'carrierCode'),
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

    $from: new FromTable('code_master', 'code_master', {
      operator: 'LEFT',

      table: 'month',

      $on: [
        new BinaryExpression(
          new ColumnExpression('code_master', 'code'),
          '=',
          new ColumnExpression('month', 'carrierCode')
        ),
      ],
    }),
  }),
]

// export default query.toJson()
