import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import Moment from 'moment'

function prepareProfitParams(params: IQueryParams, moment: typeof Moment, current: boolean, freehand: boolean): IQueryParams {
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
  subqueries.nominatedTypeCode = { value: [freehand ? 'F' : 'R'] }
  return params
}

function processProfitResult(result: any[], params: IQueryParams, moment: typeof Moment, current: boolean, freehand: boolean): any[] {
  const subqueries = (params.subqueries = params.subqueries || {})
  let profitSummaryVariables = ['grossProfit']
  if (subqueries.profitSummaryVariables && subqueries.profitSummaryVariables !== true && 'value' in subqueries.profitSummaryVariables) {
    profitSummaryVariables = subqueries.profitSummaryVariables.value
  }
  return result.map(row => {
    const row_: any = { current, freehand }
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
        // current year F
        [
          {
            type: 'prepareParams',
            async prepareParams(params, prevResult, user): Promise<IQueryParams> {
              if (!prevResult.moment) prevResult.moment = (await this.preparePackages(user)).moment
              return prepareProfitParams(params, prevResult.moment, true, true)
            }
          },
          {
            type: 'callDataService',
            dataServiceQuery: ['shipment', 'profit'],
            onResult(res, params, prevResult): any {
              prevResult.currentF = processProfitResult(res, params, prevResult.moment, true, true)
              return prevResult
            }
          }
        ],
        // current year R
        [
          {
            type: 'prepareParams',
            async prepareParams(params, prevResult, user): Promise<IQueryParams> {
              if (!prevResult.moment) prevResult.moment = (await this.preparePackages(user)).moment
              return prepareProfitParams(params, prevResult.moment, true, false)
            }
          },
          {
            type: 'callDataService',
            dataServiceQuery: ['shipment', 'profit'],
            onResult(res, params, prevResult): any {
              prevResult.currentR = processProfitResult(res, params, prevResult.moment, true, false)
              return prevResult
            }
          }
        ],
        // last year F
        [
          {
            type: 'prepareParams',
            async prepareParams(params, prevResult, user): Promise<IQueryParams> {
              if (!prevResult.moment) prevResult.moment = (await this.preparePackages(user)).moment
              return prepareProfitParams(params, prevResult.moment, false, true)
            }
          },
          {
            type: 'callDataService',
            dataServiceQuery: ['shipment', 'profit'],
            onResult(res, params, prevResult): any {
              prevResult.lastF = processProfitResult(res, params, prevResult.moment, false, true)
              return prevResult
            }
          }
        ],
        // last year R
        [
          {
            type: 'prepareParams',
            async prepareParams(params, prevResult, user): Promise<IQueryParams> {
              if (!prevResult.moment) prevResult.moment = (await this.preparePackages(user)).moment
              return prepareProfitParams(params, prevResult.moment, false, false)
            }
          },
          {
            type: 'callDataService',
            dataServiceQuery: ['shipment', 'profit'],
            onResult(res, params, prevResult): any {
              prevResult.lastR = processProfitResult(res, params, prevResult.moment, false, false)
              return prevResult
            }
          }
        ]
      ]
    },
    {
      type: 'postProcess',
      postProcess(params, { lastF, lastR, currentF, currentR }): any[] {
        let result: any[] = lastF.concat(lastR).concat(currentF).concat(currentR)

        // profit
        result = result.reduce<any[]>((a, row) => {
          let row_ = a.find(r => r.month === row.month)
          if (!row_) a.push(row_ = { month: row.month })
          for (const key of Object.keys(row)) {
            if (key !== 'month' && key !== 'freehand' && key !== 'current') {
              row_[`${row.current ? 'current' : 'last'}_${row.freehand ? 'F' : 'R'}_${key}`] = row[key]
            }
          }
          return a
        }, [])

        return result
      }
    }
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

        {
          name: 'type',
          type: 'string',
        },

        ...profitSummaryVariables.map(variable => ({ name: variable, type: 'number' })),
      ],
    })
  }
}

function prepareProfitParams(currentYear_: boolean, nominatedType_: 'F' | 'R'): Function {
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

    subqueries.nominatedTypeCode = { value: nominatedType_ }

    return params
  }
  let code = fn.toString()
  code = code.replace(new RegExp('currentYear_', 'g'), String(currentYear_))
  code = code.replace(new RegExp('nominatedType_', 'g'), `'${nominatedType_}'`)
  return parseCode(code)
}

function insertProfitData(currentYear_: boolean, nominatedType_: 'F' | 'R') {
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
      columns: [...profitSummaryVariables, 'type', 'month', 'current'],
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

          new ResultColumn(new Value(nominatedType_), 'type'),

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
  code = code.replace(new RegExp('nominatedType_', 'g'), `'${nominatedType_}'`)
  return parseCode(code)
}

function processProfitSummary() {
  return function(require, session, params) {
    const {
      ResultColumn,
      FunctionExpression,
      AndExpressions,
      BinaryExpression,
      ColumnExpression,
      CreateTableJQL,
      Query,
    } = require('node-jql')

    const profitSummaryVariables = params.subqueries.profitSummaryVariables.value
    // const profitSummaryVariables = ['grossProfit', 'profitShare', 'profitShareCost', 'profitShareIncome', 'revenue']

    const isCurrentList = [true, false]
    const types = ['F', 'R']

    const $select = ['month']

    profitSummaryVariables.map(variable => {
      isCurrentList.map(isCurrent => {
        types.map(type => {
          $select.push(
            new ResultColumn(
              new FunctionExpression(
                'IFNULL',
                new FunctionExpression(
                  'FIND',
                  new AndExpressions([
                    new BinaryExpression(new ColumnExpression('type'), '=', type),
                    new BinaryExpression(new ColumnExpression('current'), '=', isCurrent),
                  ]),

                  new ColumnExpression(variable)
                ),
                0
              ),
              `${isCurrent ? 'current' : 'last'}_${type}_${variable}`
            )
          )
        })
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
  [prepareProfitParams(true, 'F'), insertProfitData(true, 'F')],
  [prepareProfitParams(false, 'F'), insertProfitData(false, 'F')],
  [prepareProfitParams(true, 'R'), insertProfitData(true, 'R')],
  [prepareProfitParams(false, 'R'), insertProfitData(false, 'R')],

  processProfitSummary(),
]

// filters avaliable for this card
// all card in DB record using this jql will have these filter
export const filters = [] */
