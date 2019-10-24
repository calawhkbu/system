import {
  ColumnExpression,
  CreateTableJQL,
  FromTable,
  FunctionExpression,
  GroupBy,
  Query,
  ResultColumn,
  OrderBy,
  JoinClause,
  BinaryExpression,
  IsNullExpression,
  CreateFunctionJQL,
  Value,
  AndExpressions,
  InsertJQL,
  Column,
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

function prepareParams(currentYear_: boolean): Function {

  const fn = function(require, session, params) {
    const moment = require('moment')

    const subqueries = (params.subqueries = params.subqueries || {})

    const { BadRequestException } = require('@nestjs/common')

    console.log(params)

    if (!subqueries.summaryVariable) throw new BadRequestException('MISSING_summaryVariable')

    const summaryVariable = subqueries.summaryVariable.value

    if (subqueries.date) {
      let year = moment(subqueries.date.from, 'YYYY-MM-DD').year()
      if (!currentYear_) year -= 1
      subqueries.date.from = moment()
        .year(year)
        .startOf('year')
        .format('YYYY-MM-DD')
      subqueries.date.to = moment()
        .year(year)
        .endOf('year')
        .format('YYYY-MM-DD')
    }

    // select
    params.fields = ['nominatedTypeCode', 'jobMonth', summaryVariable]

    // group by
    params.groupBy = ['nominatedTypeCode', 'jobMonth']

    return params
  }
  let code = fn.toString()
  code = code.replace(new RegExp('currentYear_', 'g'), String(currentYear_))
  return parseCode(code)
}

function prepareTable(tableName_: string, currentYear_: boolean): CreateTableJQL {

  const fn = function(require, session, params) {

    const {
      ColumnExpression,
      CreateTableJQL,
      FromTable,
      FunctionExpression,
      GroupBy,
      Query,
      ResultColumn,
      OrderBy,
      JoinClause,
      BinaryExpression,
      IsNullExpression,
      CreateFunctionJQL,
      Value,
      AndExpressions,
      InsertJQL,
      Column,
    } = require('node-jql')

    const subqueries = (params.subqueries = params.subqueries || {})
    const summaryVariable = subqueries.summaryVariable.value

    return new CreateTableJQL({
      $temporary: true,
      name: tableName_,

      $as: new Query({
        $select: [
          new ResultColumn(
            new FunctionExpression('MONTHNAME', new ColumnExpression('jobMonth'), 'YYYY-MM'),
            'month'
          ),

          // new ResultColumn(new FunctionExpression('IF' , new BinaryExpression(new ColumnExpression('nominatedTypeCode'), '=', 'F'), 1, 0), 'is_F'),
          new ResultColumn(
            new FunctionExpression(
              'SUM',
              new FunctionExpression(
                'if',
                new BinaryExpression(new ColumnExpression('nominatedTypeCode'), '=', 'F'),
                new ColumnExpression('value'),
                0
              )
            ),
            'F_total'
          ),
          new ResultColumn(
            new FunctionExpression(
              'SUM',
              new FunctionExpression(
                'if',
                new BinaryExpression(new ColumnExpression('nominatedTypeCode'), '=', 'F'),
                0,
                new ColumnExpression('value')
              )
            ),
            'R_total'
          ),

          new ResultColumn(new FunctionExpression('SUM', new ColumnExpression('value')), 'total'),

          new ResultColumn(new Value(currentYear_ ? 1 : 0), 'currentYear'),

          new ResultColumn(new ColumnExpression('nominatedTypeCode')),
          // new ResultColumn(new ColumnExpression('value')),
        ],

        $from: new FromTable(
          {
            method: 'POST',
            url: 'api/shipment/query/shipment',
            columns: [
              { name: 'jobMonth', type: 'string' },
              { name: 'nominatedTypeCode', type: 'string' },
              { name: summaryVariable, type: 'number', $as: 'value' },
            ],
          },
          'shipment'
        ),

        $group: new GroupBy(new ColumnExpression('jobMonth')),
        // $group : new GroupBy(['jobMonth', 'nominatedTypeCode'])
      }),
    })
  }

  let code = fn.toString()
  code = code.replace(new RegExp('currentYear_', 'g'), String(currentYear_))
  code = code.replace(new RegExp('tableName_', 'g'), `'${tableName_}'`)
  return parseCode(code)

}

function prepareUnionTable(): CreateTableJQL {
  const tableName = 'union'

  return new CreateTableJQL({
    $temporary: true,
    name: tableName,

    $as: new Query({
      $from: 'current',
      $union: new Query({
        $from: 'last',
      }),
    }),
  })
}

function prepareFinalTable(): CreateTableJQL {
  const tableName = 'final'

  return new CreateTableJQL({
    $temporary: true,
    name: tableName,

    $as: new Query({
      $select: [
        new ResultColumn(new ColumnExpression('month')),

        new ResultColumn(
          new FunctionExpression(
            'IFNULL',
            new FunctionExpression(
              'FIND',

              new AndExpressions([
                new BinaryExpression(new ColumnExpression('currentYear'), '=', 1),
                new BinaryExpression(
                  new ColumnExpression('month'),
                  '=',
                  new ColumnExpression('month')
                ),
              ]),

              new ColumnExpression('F_total')
            ),
            0
          ),
          'currentYear_F'
        ),

        // ---------------------------------------------------

        new ResultColumn(
          new FunctionExpression(
            'IFNULL',
            new FunctionExpression(
              'FIND',

              new AndExpressions([
                new BinaryExpression(new ColumnExpression('currentYear'), '=', 1),
                new BinaryExpression(
                  new ColumnExpression('month'),
                  '=',
                  new ColumnExpression('month')
                ),
              ]),

              new ColumnExpression('R_total')
            ),
            0
          ),
          'currentYear_R'
        ),

        // --------------------------------------------

        new ResultColumn(
          new FunctionExpression(
            'IFNULL',
            new FunctionExpression(
              'FIND',

              new AndExpressions([
                new BinaryExpression(new ColumnExpression('currentYear'), '=', 1),
                new BinaryExpression(
                  new ColumnExpression('month'),
                  '=',
                  new ColumnExpression('month')
                ),
              ]),

              new ColumnExpression('total')
            ),
            0
          ),
          'currentYear_total'
        ),

        // ---------------------------------------------------

        new ResultColumn(
          new FunctionExpression(
            'IFNULL',
            new FunctionExpression(
              'FIND',

              new AndExpressions([
                new BinaryExpression(new ColumnExpression('currentYear'), '=', 0),
                new BinaryExpression(
                  new ColumnExpression('month'),
                  '=',
                  new ColumnExpression('month')
                ),
              ]),

              new ColumnExpression('F_total')
            ),
            0
          ),
          'lastYear_F'
        ),

        // ---------------------------------------------------

        new ResultColumn(
          new FunctionExpression(
            'IFNULL',
            new FunctionExpression(
              'FIND',

              new AndExpressions([
                new BinaryExpression(new ColumnExpression('currentYear'), '=', 0),
                new BinaryExpression(
                  new ColumnExpression('month'),
                  '=',
                  new ColumnExpression('month')
                ),
              ]),

              new ColumnExpression('F_total')
            ),
            0
          ),
          'lastYear_R'
        ),

        // -----------------------------------------------------

        new ResultColumn(
          new FunctionExpression(
            'IFNULL',
            new FunctionExpression(
              'FIND',

              new AndExpressions([
                new BinaryExpression(new ColumnExpression('currentYear'), '=', 0),
                new BinaryExpression(
                  new ColumnExpression('month'),
                  '=',
                  new ColumnExpression('month')
                ),
              ]),

              new ColumnExpression('total')
            ),
            0
          ),
          'lastYear_total'
        ),

        // new ResultColumn(new ColumnExpression('F_total')),
        // new ResultColumn(new ColumnExpression('R_total')),
      ],

      $group: new GroupBy(new ColumnExpression('month')),

      $from: 'union',
    }),
  })
}

function prepareMonthTable(name: string): CreateTableJQL {
  return new CreateTableJQL({
    $temporary: true,
    name,
    columns: [new Column('month', 'string'), new Column('order', 'number')],
  })
}

function insertMonthTable(name: string): InsertJQL {
  const result = []

  for (let index = 0; index < months.length; index++) {
    result.push({
      month: months[index],
      order: index,
    })
  }

  return new InsertJQL(name, ...result)
}

export default [
  // prepare 2 table and union them
  [prepareParams(true), prepareTable('current', true)],
  [prepareParams(false), prepareTable('last', false)],

  prepareUnionTable(),

  prepareMonthTable('month'),
  insertMonthTable('month'),

  prepareFinalTable(),

  new Query({
    $select: [
      new ResultColumn(new ColumnExpression('month', 'month'), 'month'),
      new ResultColumn(
        new FunctionExpression('IFNULL', new ColumnExpression('final', 'currentYear_F'), 0),
        'currentYear_F'
      ),
      new ResultColumn(
        new FunctionExpression('IFNULL', new ColumnExpression('final', 'currentYear_R'), 0),
        'currentYear_R'
      ),
      new ResultColumn(
        new FunctionExpression('IFNULL', new ColumnExpression('final', 'currentYear_total'), 0),
        'currentYear_total'
      ),

      new ResultColumn(
        new FunctionExpression('IFNULL', new ColumnExpression('final', 'lastYear_F'), 0),
        'lastYear_F'
      ),
      new ResultColumn(
        new FunctionExpression('IFNULL', new ColumnExpression('final', 'lastYear_R'), 0),
        'lastYear_R'
      ),
      new ResultColumn(
        new FunctionExpression('IFNULL', new ColumnExpression('final', 'lastYear_total'), 0),
        'lastYear_total'
      ),
    ],

    $from: new FromTable('month', 'month', {
      operator: 'LEFT',
      table: 'final',
      $on: new BinaryExpression(
        new ColumnExpression('final', 'month'),
        '=',
        new ColumnExpression('month', 'month')
      ),
    }),

    $order: new OrderBy(new ColumnExpression('month', 'order')),
  }),
]
