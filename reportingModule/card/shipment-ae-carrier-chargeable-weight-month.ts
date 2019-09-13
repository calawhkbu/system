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

    subqueries.moduleType = {
      value: 'AIR',
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

            {
              name: 'name',
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
          new FunctionExpression('SUM', new ColumnExpression(name, 'chargeableWeight')),
          'totalChargeableWeight'
        ),

        new ResultColumn(
          new FunctionExpression('COUNT', new ColumnExpression(name, 'carrierCode')),
          'totalCount'
        ),
      ],
      $from: new FromTable(
        {
          method: 'POST',
          url: 'api/shipment/query/shipment',
          columns: [
            {
              name: 'carrierCode',
              type: 'string',
            },
            {
              name: 'moduleType',
              type: 'string',
            },
            {
              name: 'chargeableWeight',
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
            fields: ['jobMonth', 'shipment.*'],
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

function prepareMonthTable(name: string) {
  return new CreateTableJQL({
    $temporary: true,
    name,
    $as: new Query({
      $select: [
        // hard code 12 months

        new ResultColumn(new ColumnExpression('tempTable', 'carrierCode'), 'carrierCode'),

        new ResultColumn(
          new FunctionExpression(
            'IFNULL',
            new FunctionExpression('SUM', new ColumnExpression('totalCount')),
            0
          ),
          'totalCount'
        ),

        new ResultColumn(
          new FunctionExpression(
            'IFNULL',
            new FunctionExpression('SUM', new ColumnExpression('totalChargeableWeight')),

            0
          ),
          'totalChargeableWeight'
        ),

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
              new ColumnExpression('totalChargeableWeight')
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
              new ColumnExpression('totalChargeableWeight')
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
              new ColumnExpression('totalChargeableWeight')
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
              new ColumnExpression('totalChargeableWeight')
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
              new ColumnExpression('totalChargeableWeight')
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
              new ColumnExpression('totalChargeableWeight')
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
              new ColumnExpression('totalChargeableWeight')
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
              new ColumnExpression('totalChargeableWeight')
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
              new ColumnExpression('totalChargeableWeight')
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
              new ColumnExpression('totalChargeableWeight')
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
              new ColumnExpression('totalChargeableWeight')
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
              new ColumnExpression('totalChargeableWeight')
            ),
            0
          ),
          'Dec'
        ),
      ],

      $from: 'tempTable',
      $group: 'carrierCode',

      // $order: 'carrierCode'
    }),
  })
}

export default [
  [prepareParams(), prepareTempTable('tempTable')],
  [prepareCodeMasterParams(), prepareCodeMasterTable('code_master')],
  prepareMonthTable('month'),

  new Query({
    $select: [
      new ResultColumn(new ColumnExpression('code_master', 'code'), 'carrierCode'),
      new ResultColumn(
        new FunctionExpression('IFNULL', new ColumnExpression('month', 'totalCount'), 0),
        'totalCount'
      ),
      new ResultColumn(
        new FunctionExpression('IFNULL', new ColumnExpression('month', 'totalChargeableWeight'), 0),
        'totalChargeableWeight'
      ),
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
