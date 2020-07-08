import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import Moment = require('moment')
import { BadRequestException } from '@nestjs/common'
import { OrderBy } from 'node-jql'

interface Result {
  moment: typeof Moment
  current: any[]
  last: any[]
}

function prepareParams(params: IQueryParams, moment: typeof Moment, current: boolean): IQueryParams {
  const subqueries = (params.subqueries = params.subqueries || {})

  // warning cannot display from frontend
  if (!subqueries.yAxis) throw new BadRequestException('MISSING_yAxis')

  if (subqueries.date && subqueries.date !== true && 'from' in subqueries.date) {
    let year = moment(subqueries.date.from, 'YYYY-MM-DD').year()
    if (!current) year -= 1
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

  const summaryColumnName = (subqueries.yAxis as any).value
  // ------------------------------
  params.sorting = new OrderBy(summaryColumnName, 'DESC')
  // select
  params.fields = ['jobMonth', summaryColumnName]
  params.groupBy = ['jobMonth']

  return params
}

function processResult(result: any[], params: IQueryParams, moment: typeof Moment, current: boolean): any[] {
  const subqueries = (params.subqueries = params.subqueries || {})
  const summaryColumnName = (subqueries.yAxis as any).value

  return result.map(row => {
    const mi = moment(row.jobMonth, 'YYYY-MM')
    const year = mi.format('YYYY')
    const month = mi.format('MMMM')
    return { year, month, summary: summaryColumnName, value: row[summaryColumnName] }
  })
}

export default {
  jqls: [
    {
      type: 'runParallel',
      defaultResult: {},
      jqls: [
        // current year
        [
          {
            type: 'prepareParams',
            async prepareParams(params, prevResult: Result, user): Promise<IQueryParams> {
              if (!prevResult.moment) prevResult.moment = (await this.preparePackages(user)).moment
              return prepareParams(params, prevResult.moment, true)
            }
          },
          {
            type: 'callDataService',
            dataServiceQuery: ['shipment', 'shipment'],
            onResult(res, params, prevResult: Result): Result {
              prevResult.current = processResult(res, params, prevResult.moment, true)
              return prevResult
            }
          }
        ],
        // last year
        [
          {
            type: 'prepareParams',
            async prepareParams(params, prevResult: Result, user): Promise<IQueryParams> {
              if (!prevResult.moment) prevResult.moment = (await this.preparePackages(user)).moment
              return prepareParams(params, prevResult.moment, false)
            }
          },
          {
            type: 'callDataService',
            dataServiceQuery: ['shipment', 'shipment'],
            onResult(res, params, prevResult: Result): Result {
              prevResult.last = processResult(res, params, prevResult.moment, false)
              return prevResult
            }
          }
        ],
      ]
    },
    {
      type: 'postProcess',
      postProcess(params, { current, last }: Result): any[] {
        return current.concat(last)
      }
    },
  ],
  filters: [{
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
        {
          label: 'teu',
          value: 'teu',
        },
        {
          label: 'teuInReport',
          value: 'teuInReport',
        },
        {
          label: 'quantity',
          value: 'quantity',
        },
        {
          label: 'cargoValue',
          value: 'cargoValue',
        },
      ],
      required: true,
    },
    type: 'list',
  }]
} as JqlDefinition

/* import {
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
    const { moment } = params.packages
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
              { name: summaryColumnName, type: 'string' },
            ],
          },
          'shipment'
        ),

        $group: new GroupBy(new ColumnExpression('jobMonth')),
      }),
    })
  }

  let code = fn.toString()
  code = code.replace(new RegExp('tableName_', 'g'), `'${tableName_}'`)
  return parseCode(code)
}

function finalQuery() {
  return function(require, session, params) {
    const { Query } = require('node-jql')

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
        {
          label: 'teu',
          value: 'teu',
        },
        {
          label: 'teuInReport',
          value: 'teuInReport',
        },
        {
          label: 'quantity',
          value: 'quantity',
        },
      ],
      required: true,
    },
    type: 'list',
  },
] */
