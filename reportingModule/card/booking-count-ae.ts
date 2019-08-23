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
} from 'node-jql'
import { parseCode } from 'utils/function'

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
    return params
  }
  const code = fn.toString()
  return parseCode(code)
}

// template Table group by carrierCod and jobMonth
function prepareFinalTable(name: string): CreateTableJQL {
  return new CreateTableJQL({
    $temporary: true,
    name,
    $as: new Query({
      $from: new FromTable('tempTable'),

      $group: new GroupBy([new ColumnExpression('carrierCode')]),
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
    }),
  })
}

export default [
  [prepareParams(), prepareTempTable('tempTable')],
  new Query({
    $select: [
      // hard code 12 months

      // new ResultColumn(new FunctionExpression('MONTHNAME', new ColumnExpression('jobMonth'), 'YYYY-MM'),'monthName'),
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
                'January'
              ),
              new BinaryExpression(
                new ColumnExpression('tempTable', 'carrierCode'),
                '=',
                new ColumnExpression('carrierCode')
              ),
            ]),
            new ColumnExpression('count')
          ),
          0
        ),
        'Jan'
      ),

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
                'February'
              ),
              new BinaryExpression(
                new ColumnExpression('tempTable', 'carrierCode'),
                '=',
                new ColumnExpression('carrierCode')
              ),
            ]),
            new ColumnExpression('count')
          ),
          0
        ),
        'Feb'
      ),

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
                'March'
              ),
              new BinaryExpression(
                new ColumnExpression('tempTable', 'carrierCode'),
                '=',
                new ColumnExpression('carrierCode')
              ),
            ]),
            new ColumnExpression('count')
          ),
          0
        ),
        'Mar'
      ),

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
                'April'
              ),
              new BinaryExpression(
                new ColumnExpression('tempTable', 'carrierCode'),
                '=',
                new ColumnExpression('carrierCode')
              ),
            ]),
            new ColumnExpression('count')
          ),
          0
        ),
        'Apr'
      ),

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
                'May'
              ),
              new BinaryExpression(
                new ColumnExpression('tempTable', 'carrierCode'),
                '=',
                new ColumnExpression('carrierCode')
              ),
            ]),
            new ColumnExpression('count')
          ),
          0
        ),
        'May'
      ),

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
                'June'
              ),
              new BinaryExpression(
                new ColumnExpression('tempTable', 'carrierCode'),
                '=',
                new ColumnExpression('carrierCode')
              ),
            ]),
            new ColumnExpression('count')
          ),
          0
        ),
        'Jun'
      ),

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
                'July'
              ),
              new BinaryExpression(
                new ColumnExpression('tempTable', 'carrierCode'),
                '=',
                new ColumnExpression('carrierCode')
              ),
            ]),
            new ColumnExpression('count')
          ),
          0
        ),
        'Jul'
      ),

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
                'August'
              ),
              new BinaryExpression(
                new ColumnExpression('tempTable', 'carrierCode'),
                '=',
                new ColumnExpression('carrierCode')
              ),
            ]),
            new ColumnExpression('count')
          ),
          0
        ),
        'Aug'
      ),

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
                'September'
              ),
              new BinaryExpression(
                new ColumnExpression('tempTable', 'carrierCode'),
                '=',
                new ColumnExpression('carrierCode')
              ),
            ]),
            new ColumnExpression('count')
          ),
          0
        ),
        'Sep'
      ),

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
                'October'
              ),
              new BinaryExpression(
                new ColumnExpression('tempTable', 'carrierCode'),
                '=',
                new ColumnExpression('carrierCode')
              ),
            ]),
            new ColumnExpression('count')
          ),
          0
        ),
        'Oct'
      ),

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
                'November'
              ),
              new BinaryExpression(
                new ColumnExpression('tempTable', 'carrierCode'),
                '=',
                new ColumnExpression('carrierCode')
              ),
            ]),
            new ColumnExpression('count')
          ),
          0
        ),
        'Nov'
      ),

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
                'December'
              ),
              new BinaryExpression(
                new ColumnExpression('tempTable', 'carrierCode'),
                '=',
                new ColumnExpression('carrierCode')
              ),
            ]),
            new ColumnExpression('count')
          ),
          0
        ),
        'Dec'
      ),
      // new ResultColumn('*'),

      new ResultColumn(new ColumnExpression('tempTable', 'carrierCode'), 'carrierCode'),
    ],

    $from: 'tempTable',

    // $group: 'jobMonth'
    $group: 'carrierCode',
    // $order: 'carrierCode'
  }),
]

// export default query.toJson()
