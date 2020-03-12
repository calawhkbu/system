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
]
