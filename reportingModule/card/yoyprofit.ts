import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import Moment = require('moment')

function prepareParams(params: IQueryParams, moment: typeof Moment, current: boolean): IQueryParams {
  const subqueries = (params.subqueries = params.subqueries || {})
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
  return params
}

function processResult(result: any[], params: IQueryParams, moment: typeof Moment, current: boolean): any[] {
  const subqueries = (params.subqueries = params.subqueries || {})
  let profitSummaryVariables = ['grossProfit']
  if (subqueries.profitSummaryVariables && subqueries.profitSummaryVariables !== true && 'value' in subqueries.profitSummaryVariables) {
    profitSummaryVariables = subqueries.profitSummaryVariables.value
  }
  return result.map(row => {
    const row_: any = { current }
    for (const key of ['month', ...profitSummaryVariables]) {
      switch (key) {
        case 'month':
          row_[key] = moment(row.jobMonth, 'YYYY-MM').format('MMMM')
          break
        case 'margin':
          row_[key] = row.revenue === 0 ? 0 : row.grossProfit / row.revenue
          break
        default:
          row_[key] = row[key]
      }
    }
    return row_
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
            async prepareParams(params, prevResult, user): Promise<IQueryParams> {
              if (!prevResult.moment) prevResult.moment = (await this.preparePackages(user)).moment
              return prepareParams(params, prevResult.moment, true)
            }
          },
          {
            type: 'callAxios',
            injectParams: true,
            axiosConfig: {
              method: 'POST',
              url: 'api/shipment/query/profit'
            },
            onAxiosResponse(res, params, prevResult): any {
              prevResult.current = processResult(res.data, params, prevResult.moment, true)
              return prevResult
            }
          }
        ],
        // last year
        [
          {
            type: 'prepareParams',
            async prepareParams(params, prevResult, user): Promise<IQueryParams> {
              if (!prevResult.moment) prevResult.moment = (await this.preparePackages(user)).moment
              return prepareParams(params, prevResult.moment, false)
            }
          },
          {
            type: 'callAxios',
            injectParams: true,
            axiosConfig: {
              method: 'POST',
              url: 'api/shipment/query/profit'
            },
            onAxiosResponse(res, params, prevResult): any {
              prevResult.last = processResult(res.data, params, prevResult.moment, false)
              return prevResult
            }
          }
        ],
      ]
    },
    {
      type: 'postProcess',
      postProcess(params, prevResult): any[] {
        const result: any[] = prevResult.current.concat(prevResult.last)

        return result.reduce<any[]>((a, row) => {
          let row_ = a.find(r => r.month === row.month)
          if (!row_) a.push(row_ = { month: row.month })
          for (const key of Object.keys(row)) {
            if (key !== 'month') {
              row_[`${row.current ? 'current' : 'last'}_${key}`] = row[key]
            }
          }
          return a
        }, [])
      }
    }
  ],
  filters: [
    {
      name: 'showMonth',
      type: 'boolean',
    },
    {
      name: 'showYear',
      props: {
        items: [
          {
            label: 'current',
            value: 'current',
          },
          {
            label: 'last',
            value: 'last',
          },
        ],
        required: true,
      },
      type: 'list',
    },
  ]
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
  MathExpression,
} from 'node-jql'

import { parseCode } from 'utils/function'

function createProfitTable() {
  return function(require, session, params) {
    const { CreateTableJQL } = require('node-jql')

    const profitSummaryVariables = params.subqueries.profitSummaryVariables.value
    // const profitSummaryVariables = ['grossProfit', 'profitShare', 'profitShareCost', 'profitShareIncome', 'revenue']

    return new CreateTableJQL({
      name: 'profit_raw',
      columns: [
        {
          name: 'current',
          type: 'boolean',
        },
        {
          name: 'month',
          type: 'string',
        },

        ...profitSummaryVariables.map(variable => ({ name: variable, type: 'number' })),
      ],
    })
  }
}

function prepareProfitParams(currentYear_: boolean): Function {
  const fn = function(require, session, params) {
    const { moment } = params.packages
    const subqueries = (params.subqueries = params.subqueries || {})
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

    return params
  }
  let code = fn.toString()
  code = code.replace(new RegExp('currentYear_', 'g'), String(currentYear_))
  return parseCode(code)
}

function insertProfitData(currentYear_: boolean) {
  const fn = function(require, session, params) {
    const {
      InsertJQL,
      ResultColumn,
      FunctionExpression,
      Value,
      ColumnExpression,
      FromTable,
      Query,
      MathExpression,
    } = require('node-jql')

    const profitSummaryVariables = params.subqueries.profitSummaryVariables.value
    // const profitSummaryVariables = ['grossProfit', 'profitShare', 'profitShareCost', 'profitShareIncome', 'revenue']

    return new InsertJQL({
      name: 'profit_raw',
      columns: [...profitSummaryVariables, 'month', 'current'],
      query: new Query({
        $select: [
          // warning : profitSummaryVariables should also contains grossProfit and revenue if margin is selected
          ...profitSummaryVariables.map(variable => {
            if (variable === 'margin') {
              return new ResultColumn(
                new MathExpression(
                  new ColumnExpression('grossProfit'),
                  '/',
                  new ColumnExpression('revenue')
                ),
                'margin'
              )
            }

            return new ResultColumn(new ColumnExpression(variable))
          }),

          new ResultColumn(
            new FunctionExpression('MONTHNAME', new ColumnExpression('jobMonth'), 'YYYY-MM'),
            'month'
          ),
          new ResultColumn(new Value(currentYear_), 'current'),
        ],

        $from: new FromTable(
          {
            method: 'POST',
            url: 'api/shipment/query/profit',
            columns: [
              {
                name: 'officePartyCode',
                type: 'string',
              },
              {
                name: 'jobMonth',
                type: 'string',
              },

              ...(profitSummaryVariables.map(variable => ({
                name: variable,
                type: 'number',
              })) as any),
            ],
          },
          'dumb'
        ),
      }),
    })
  }

  let code = fn.toString()
  code = code.replace(new RegExp('currentYear_', 'g'), String(currentYear_))
  return parseCode(code)
}

function processProfitSummary() {
  return function(require, session, params) {
    const showMonth = params.subqueries.showMonth || false

    const {
      ResultColumn,
      FunctionExpression,
      AndExpressions,
      BinaryExpression,
      ColumnExpression,
      Query,
    } = require('node-jql')

    const profitSummaryVariables = params.subqueries.profitSummaryVariables.value
    // const profitSummaryVariables = ['grossProfit', 'profitShare', 'profitShareCost', 'profitShareIncome', 'revenue']

    const isCurrentList = [true, false]

    const $select = []

    if (showMonth) {
      $select.push(new ResultColumn('month'))
    }

    profitSummaryVariables.map(variable => {
      isCurrentList.map(isCurrent => {
        $select.push(
          new ResultColumn(
            new FunctionExpression(
              'IFNULL',
              new FunctionExpression(
                'FIND',

                new BinaryExpression(new ColumnExpression('current'), '=', isCurrent),

                new ColumnExpression(variable)
              ),
              0
            ),
            `${isCurrent ? 'current' : 'last'}_${variable}`
          )
        )
      })
    })

    return new Query({
      $select,
      $from: 'profit_raw',
      $group: 'month',
    })
  }
}

export default [
  // prepare all profit table
  createProfitTable(),
  [prepareProfitParams(true), insertProfitData(true)],
  [prepareProfitParams(false), insertProfitData(false)],

  processProfitSummary(),
]

// filters avaliable for this card
// all card in DB record using this jql will have these filter
export const filters = [
  {
    name: 'showMonth',
    type: 'boolean',
  },
  {
    name: 'showYear',
    props: {
      items: [
        {
          label: 'current',
          value: 'current',
        },
        {
          label: 'last',
          value: 'last',
        },
      ],
      required: true,
    },
    type: 'list',
  },
] */
