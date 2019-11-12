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
import moment = require('moment')

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
    const { OrderBy } = require('node-jql')
    const { BadRequestException } = require('@nestjs/common')

    const subqueries = (params.subqueries = params.subqueries || {})

    // warning cannot display from frontend
    if (!subqueries.yAxis) throw new BadRequestException('MISSING_yAxis')

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

    // most important part of this card
    // dynamically choose the fields and summary value

    const summaryColumnName = subqueries.yAxis.value
    // ------------------------------
    params.sorting = new OrderBy(summaryColumnName, 'DESC')
    // select
    params.fields = ['jobMonth', summaryColumnName]
    params.groupBy = ['jobMonth']

    return params
  }

  let code = fn.toString()
  code = code.replace(new RegExp('currentYear_', 'g'), String(currentYear_))
  return parseCode(code)
}

function prepareTable(tableName_: string) {
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

    const summaryColumnName = params.subqueries.yAxis.value

    const $select = [

      new ResultColumn(new Value(summaryColumnName), 'summary'),

      new ResultColumn(
        new FunctionExpression('MONTHNAME', new ColumnExpression('jobMonth'), 'YYYY-MM'),
        'month'
      ),

      new ResultColumn(
        new FunctionExpression('YEAR', new ColumnExpression('jobMonth'), 'YYYY-MM'),
        'year'
      ),
      new ResultColumn(new ColumnExpression(summaryColumnName), 'value'),
    ]

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
              { name : summaryColumnName, type : 'string' }
            ],
          },
          'shipment'
        ),

        $group: new GroupBy(new ColumnExpression('jobMonth'))
      }),
    })
  }

  let code = fn.toString()
  code = code.replace(new RegExp('tableName_', 'g'), `'${tableName_}'`)
  return parseCode(code)
}

function finalQuery() {
  return function(require, session, params) {
    const {
      Query
    } = require('node-jql')

    return new Query({
      $from: 'current',
      $union: new Query({
        $from: 'last',
      }),
    })

  }
}

export default [
  // prepare 2 table and union them
  [prepareParams(true), prepareTable('current')],
  [prepareParams(false), prepareTable('last')],

  finalQuery(),
]

// filters avaliable for this card
// all card in DB record using this jql will have these filter
export const filters = [
  {
    display: 'yAxis',
    name: 'yAxis',
    props: {
      items: [
        {
          label: 'chargeableWeight',
          value: 'chargeableWeight',
        },
        {
          label: 'grossWeight',
          value: 'grossWeight',
        },
        {
          label: 'cbm',
          value: 'cbm',
        },
        {
          label: 'totalShipment',
          value: 'totalShipment',
        },
      ],
      required: true,
    },
    type: 'list',
  }
]
