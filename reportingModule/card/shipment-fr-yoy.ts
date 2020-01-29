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

    if (!subqueries.summaryVariables) throw new BadRequestException('MISSING_summaryVariable')
    const summaryVariables = subqueries.summaryVariables.value

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
    params.fields = ['nominatedTypeCode', 'jobMonth', ...summaryVariables]

    // group by
    params.groupBy = ['nominatedTypeCode', 'jobMonth']

    return params
  }
  let code = fn.toString()
  code = code.replace(new RegExp('currentYear_', 'g'), String(currentYear_))
  return parseCode(code)
}

function prepareTable(tableName_: string, currentYear_: boolean) {
  const fn = function(require, session, params) {
    const {
      ColumnExpression,
      CreateTableJQL,
      FromTable,
      FunctionExpression,
      GroupBy,
      Query,
      ResultColumn,
      BinaryExpression,
      Value,
    } = require('node-jql')

    const summaryVariables = params.subqueries.summaryVariables.value as string[]
    const types = ['F', 'R']

    const $select = [
      new ResultColumn(
        new FunctionExpression('MONTHNAME', new ColumnExpression('jobMonth'), 'YYYY-MM'),
        'month'
      ),

      new ResultColumn(new Value(currentYear_), 'currentYear'),
      new ResultColumn(new ColumnExpression('nominatedTypeCode')),
    ]

    summaryVariables.map(variable => {
      types.map(type => {
        $select.push(
          new ResultColumn(
            new FunctionExpression(
              'SUM',
              new FunctionExpression(
                'if',
                new BinaryExpression(new ColumnExpression('nominatedTypeCode'), '=', type),
                new ColumnExpression(variable),
                0
              )
            ),
            `${type}_${variable}`
          )
        )
      })

      $select.push(
        new ResultColumn(
          new FunctionExpression('SUM', new ColumnExpression(variable)),
          `total_${variable}`
        )
      )
    })

    return new CreateTableJQL({
      $temporary: true,
      name: tableName_,

      $as: new Query({
        $select,

        $from: new FromTable(
          {
            method: 'POST',
            url: 'api/shipment/query/shipment',
            columns: [
              { name: 'jobMonth', type: 'string' },
              { name: 'nominatedTypeCode', type: 'string' },

              ...summaryVariables.map(variable => ({ name: variable, type: 'number' })),
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

function prepareFinalTable() {
  return function(require, session, params) {
    const {
      Query,
      ResultColumn,
      ColumnExpression,
      FunctionExpression,
      AndExpressions,
      BinaryExpression,
      CreateTableJQL,
      GroupBy,
    } = require('node-jql')

    const summaryVariables = params.subqueries.summaryVariables.value

    const types = ['F', 'R', 'total']
    const isCurrentList = [true, false]

    const tableName = 'final'

    const $select = [new ResultColumn(new ColumnExpression('month'))]

    summaryVariables.map(variable => {
      isCurrentList.map(isCurrent => {
        types.map(type => {
          $select.push(
            new ResultColumn(
              new FunctionExpression(
                'IFNULL',
                new FunctionExpression(
                  'FIND',

                  new AndExpressions([
                    new BinaryExpression(new ColumnExpression('currentYear'), '=', isCurrent),
                    new BinaryExpression(
                      new ColumnExpression('month'),
                      '=',
                      new ColumnExpression('month')
                    ),
                  ]),

                  new ColumnExpression(`${type}_${variable}`)
                ),
                0
              ),
              `${isCurrent ? 'current' : 'last'}_${type}_${variable}`
            )
          )
        })
      })
    })

    return new CreateTableJQL({
      $temporary: true,
      name: tableName,

      $as: new Query({
        $select,

        $group: new GroupBy(new ColumnExpression('month')),

        $from: 'union',
      }),
    })
  }
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

function finalQuery() {
  return function(require, session, params) {
    const {
      Query,
      ResultColumn,
      ColumnExpression,
      FunctionExpression,
      FromTable,
      BinaryExpression,
      OrderBy,
    } = require('node-jql')

    const summaryVariables = params.subqueries.summaryVariables.value

    const isCurrentList = [true, false]
    const types = ['F', 'R', 'total']

    const $select = []

    summaryVariables.map(variable => {
      isCurrentList.map(isCurrent => {
        types.map(type => {
          const columnName = `${isCurrent ? 'current' : 'last'}_${type}_${variable}`
          $select.push(
            new ResultColumn(
              new FunctionExpression('IFNULL', new ColumnExpression('final', columnName), 0),
              columnName
            )
          )
        })
      })
    })

    $select.push(new ResultColumn(new ColumnExpression('month', 'month'), 'month'))

    return new Query({
      $select,
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
    })
  }
}

export default [
  // prepare 2 table and union them
  [prepareParams(true), prepareTable('current', true)],
  [prepareParams(false), prepareTable('last', false)],
  prepareUnionTable(),

  prepareMonthTable('month'),
  insertMonthTable('month'),

  prepareFinalTable(),

  finalQuery(),
]

// filters avaliable for this card
// all card in DB record using this jql will have these filter
export const filters = []
