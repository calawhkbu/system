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
    const moment = require('moment')
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

    const $select = [new ResultColumn('month')]

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

    return new CreateTableJQL({
      name: 'profit',
      $temporary: true,
      $as: new Query({
        $select,
        $from: 'profit_raw',
        $group: 'month',
      }),
    })
  }
}

function createTonnagetable() {
  return function(require, session, params) {
    const { CreateTableJQL } = require('node-jql')

    const tonnageSummaryVariables = params.subqueries.tonnageSummaryVariables.value
    //  const tonnageSummaryVariables = ['chargeableWeight', 'cbm', 'totalShipment']

    return new CreateTableJQL({
      name: 'tonnage_raw',
      columns: [
        ...tonnageSummaryVariables.map(variable => ({ name: variable, type: 'number' })),

        {
          name: 'current',
          type: 'boolean',
        },

        {
          name: 'type',
          type: 'string',
        },

        {
          name: 'month',
          type: 'string',
        },
      ],
    })
  }
}

function prepareTonnageParams(currentYear_: boolean, nominatedType_: 'F' | 'R'): Function {
  const fn = function(require, session, params) {
    const moment = require('moment')
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
    const tonnageSummaryVariables = params.subqueries.tonnageSummaryVariables.value
    //  const tonnageSummaryVariables = ['chargeableWeight', 'cbm', 'totalShipment']

    params.fields = ['jobMonth', 'nominatedTypeCode', ...tonnageSummaryVariables]
    params.groupBy = ['jobMonth', 'nominatedTypeCode']

    return params
  }
  let code = fn.toString()
  code = code.replace(new RegExp('currentYear_', 'g'), String(currentYear_))
  code = code.replace(new RegExp('nominatedType_', 'g'), `'${nominatedType_}'`)
  return parseCode(code)
}

function insertTonnageData(currentYear_: boolean, nominatedType_: 'F' | 'R') {
  const fn = function(require, session, params) {
    const {
      ResultColumn,
      ColumnExpression,
      FunctionExpression,
      InsertJQL,
      Value,
      FromTable,
      Query,
    } = require('node-jql')

    const tonnageSummaryVariables = params.subqueries.tonnageSummaryVariables.value
    //  const tonnageSummaryVariables = ['chargeableWeight', 'cbm', 'totalShipment']

    return new InsertJQL({
      name: 'tonnage_raw',
      columns: [...tonnageSummaryVariables, 'type', 'month', 'current'],
      query: new Query({
        $select: [
          ...tonnageSummaryVariables.map(
            variable => new ResultColumn(new ColumnExpression(variable))
          ),

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
            url: 'api/shipment/query/shipment',
            columns: [
              ...(tonnageSummaryVariables.map(variable => ({
                name: variable,
                type: 'number',
              })) as any),

              {
                name: 'jobMonth',
                type: 'string',
              },
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

function processTonnageSummary() {
  return function(require, session, params) {
    const {
      ResultColumn,
      ColumnExpression,
      FunctionExpression,
      Query,
      CreateTableJQL,
      BinaryExpression,
      AndExpressions,
    } = require('node-jql')

    const tonnageSummaryVariables = params.subqueries.tonnageSummaryVariables.value
    //  const tonnageSummaryVariables = ['chargeableWeight', 'cbm', 'totalShipment']

    const isCurrentList = [true, false]

    const types = ['F', 'R']

    const $select = [new ResultColumn('month')]

    tonnageSummaryVariables.map(variable => {
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

    return new CreateTableJQL({
      name: 'tonnage',
      $temporary: true,
      $as: new Query({
        $select,
        $from: 'tonnage_raw',
        $group: 'month',
      }),
    })
  }
}

function finalQuery() {
  return function(require, session, params) {
    const currentOrLastList = ['current', 'last']
    const types = ['F', 'R']

    const {
      ResultColumn,
      ColumnExpression,
      FromTable,
      JoinClause,
      BinaryExpression,
      Query,
    } = require('node-jql')

    const tonnageSummaryVariables = params.subqueries.tonnageSummaryVariables.value
    //  const tonnageSummaryVariables = ['chargeableWeight', 'cbm', 'totalShipment']

    const profitSummaryVariables = params.subqueries.profitSummaryVariables.value
    // const profitSummaryVariables = ['grossProfit', 'profitShare', 'profitShareCost', 'profitShareIncome', 'revenue']

    const showMonth = params.subqueries.showMonth || false

    const $select = []

    if (showMonth) {
      $select.push(new ResultColumn(new ColumnExpression('profit', 'month')))
    }

    currentOrLastList.map(currentOrLast => {
      types.map(type => {
        tonnageSummaryVariables.map(variable => {
          $select.push(
            new ResultColumn(
              new ColumnExpression('tonnage', `${currentOrLast}_${type}_${variable}`)
            )
          )
        })

        profitSummaryVariables.map(variable => {
          $select.push(
            new ResultColumn(new ColumnExpression('profit', `${currentOrLast}_${type}_${variable}`))
          )
        })
      })
    })

    return new Query({
      $select,

      $from: new FromTable(
        'profit',

        new JoinClause({
          table: 'tonnage',
          operator: 'LEFT',
          $on: [
            new BinaryExpression(
              new ColumnExpression('profit', 'month'),
              '=',
              new ColumnExpression('tonnage', 'month')
            ),
          ],
        })
      ),
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

  // new Query({

  //   $from : 'profit'
  // })

  // prepareTonnage Data
  createTonnagetable(),
  [prepareTonnageParams(true, 'F'), insertTonnageData(true, 'F')],
  [prepareTonnageParams(false, 'F'), insertTonnageData(false, 'F')],
  [prepareTonnageParams(true, 'R'), insertTonnageData(true, 'R')],
  [prepareTonnageParams(false, 'R'), insertTonnageData(false, 'R')],

  processTonnageSummary(),

  finalQuery(),
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
