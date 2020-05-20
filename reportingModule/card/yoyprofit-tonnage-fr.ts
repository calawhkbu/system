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
  IColumn,
  CaseExpression,
  ICase,
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

    subqueries.nominatedTypeCode = { value: [nominatedType_] }
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
              `${type}_${variable}${isCurrent ? 'Current' : 'Last'}`
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

function createMonthTable() {
  return new CreateTableJQL(true, 'monthTable', [
    new Column('month', 'string'),
  ])

}

function insertMonthTable() {

  const dataList = months.map(month => {
    return {
      month
    }
  })

  return new InsertJQL('monthTable', ...dataList)
}

function prepareTonnageParams2() {

  return function(require, session, params) {

    const prefix = 'fr'
    const types = ['F', 'R']

    const { moment } = params.packages
    const subqueries = (params.subqueries = params.subqueries || {})

    const from = subqueries.date.from
    const currentYear = moment(from).year()

    const lastFrom = moment(from).year(currentYear - 1).startOf('year').format('YYYY-MM-DD')
    const lastTo = moment(from).year(currentYear - 1).endOf('year').format('YYYY-MM-DD')
    const currentFrom = moment(from).year(currentYear).startOf('year').format('YYYY-MM-DD')
    const currentTo = moment(from).year(currentYear).endOf('year').format('YYYY-MM-DD')

    subqueries.date = {
      lastFrom,
      lastTo,
      currentFrom,
      currentTo,
    }

    let tonnageSummaryVariables: string[] = []
    if (subqueries.tonnageSummaryVariables && subqueries.tonnageSummaryVariables.value) {
      // sumamary variable
      tonnageSummaryVariables = Array.isArray(subqueries.tonnageSummaryVariables.value) ? subqueries.tonnageSummaryVariables.value : [subqueries.tonnageSummaryVariables.value]
    }

    if (!(tonnageSummaryVariables && tonnageSummaryVariables.length)) {
      throw new Error('MISSING_tonnageSummaryVariables')
    }

    params.fields = [
      ...tonnageSummaryVariables.map(tonnageSummaryVariable => {

        return `${prefix}_${tonnageSummaryVariable}MonthLastCurrent`

      })
    ]
    return params
  }
}

function tonnageQuery() {

  return function(require, session, params) {

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

    const prefix = 'fr'
    const types = ['F', 'R']
    const subqueries = (params.subqueries = params.subqueries || {})

    let tonnageSummaryVariables: string[] = []
    if (subqueries.tonnageSummaryVariables && subqueries.tonnageSummaryVariables.value) {
      // sumamary variable
      tonnageSummaryVariables = Array.isArray(subqueries.tonnageSummaryVariables.value) ? subqueries.tonnageSummaryVariables.value : [subqueries.tonnageSummaryVariables.value]
    }

    if (!(tonnageSummaryVariables && tonnageSummaryVariables.length)) {
      throw new Error('MISSING_tonnageSummaryVariables')
    }

    const columns = [] as IColumn[]

    months.map(month => {

      types.map(type => {

        ['Last', 'Current'].map(lastOrCurrent => {

          tonnageSummaryVariables.map(tonnageSummaryVariable => {

            const columnName = `${month}_${type}_${tonnageSummaryVariable}${lastOrCurrent}`

            columns.push({

              name: columnName,
              type: 'number',

            })

          })

        })

      })

    })

    return new CreateTableJQL({
      name: 'tonnage',
      $temporary: true,
      $as: new Query({
        $from: new FromTable(
          {
            method: 'POST',
            url: `api/shipment/query/shipment`,
            columns
          },
          'shipment'
        ),
      }),
    })

  }

}

function createTonnagetable() {
  return function(require, session, params) {
    const { CreateTableJQL } = require('node-jql')

    // ------------------------

    const subqueries = (params.subqueries = params.subqueries || {})

    let tonnageSummaryVariables: string[] = []
    if (subqueries.tonnageSummaryVariables && subqueries.tonnageSummaryVariables.value) {
      // sumamary variable
      tonnageSummaryVariables = Array.isArray(subqueries.tonnageSummaryVariables.value) ? subqueries.tonnageSummaryVariables.value : [subqueries.tonnageSummaryVariables.value]
    }

    if (!(tonnageSummaryVariables && tonnageSummaryVariables.length)) {
      throw new Error('MISSING_summaryVariables')
    }

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

    subqueries.nominatedTypeCode = { value: [nominatedType_] }

    let tonnageSummaryVariables: string[] = []
    if (subqueries.tonnageSummaryVariables && subqueries.tonnageSummaryVariables.value) {
      // sumamary variable
      tonnageSummaryVariables = Array.isArray(subqueries.tonnageSummaryVariables.value) ? subqueries.tonnageSummaryVariables.value : [subqueries.tonnageSummaryVariables.value]
    }

    if (!(tonnageSummaryVariables && tonnageSummaryVariables.length)) {
      throw new Error('MISSING_tonnageSummaryVariables')
    }

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

    const subqueries = (params.subqueries = params.subqueries || {})

    let tonnageSummaryVariables: string[] = []
    if (subqueries.tonnageSummaryVariables && subqueries.tonnageSummaryVariables.value) {
      // sumamary variable
      tonnageSummaryVariables = Array.isArray(subqueries.tonnageSummaryVariables.value) ? subqueries.tonnageSummaryVariables.value : [subqueries.tonnageSummaryVariables.value]
    }

    if (!(tonnageSummaryVariables && tonnageSummaryVariables.length)) {
      throw new Error('MISSING_tonnageSummaryVariables')
    }

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

    const subqueries = (params.subqueries = params.subqueries || {})

    let tonnageSummaryVariables: string[] = []
    if (subqueries.tonnageSummaryVariables && subqueries.tonnageSummaryVariables.value) {
      // sumamary variable
      tonnageSummaryVariables = Array.isArray(subqueries.tonnageSummaryVariables.value) ? subqueries.tonnageSummaryVariables.value : [subqueries.tonnageSummaryVariables.value]
    }

    if (!(tonnageSummaryVariables && tonnageSummaryVariables.length)) {
      throw new Error('MISSING_tonnageSummaryVariables')
    }

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
    const subqueries = (params.subqueries = params.subqueries || {})

    let tonnageSummaryVariables: string[] = []
    if (subqueries.tonnageSummaryVariables && subqueries.tonnageSummaryVariables.value) {
      // sumamary variable
      tonnageSummaryVariables = Array.isArray(subqueries.tonnageSummaryVariables.value) ? subqueries.tonnageSummaryVariables.value : [subqueries.tonnageSummaryVariables.value]
    }

    if (!(tonnageSummaryVariables && tonnageSummaryVariables.length)) {
      throw new Error('MISSING_tonnageSummaryVariables')
    }

    const profitSummaryVariables = params.subqueries.profitSummaryVariables.value

    const $select = [
      new ResultColumn(new ColumnExpression('monthTable', 'month')),
      new ResultColumn(new Value(tonnageSummaryVariables[0]), `tonnageSummaryVariable0`)
    ]

    const lastOrCurentList = ['Last', 'Current']
    const types = ['F', 'R']

    lastOrCurentList.map(lastOrCurrent => {

      types.map(type => {

        profitSummaryVariables.map(profitSummaryVariable => {

          const profitSummaryVariableName = `${type}_${profitSummaryVariable}${lastOrCurrent}`

          $select.push(new ResultColumn(new ColumnExpression('profit', profitSummaryVariableName), profitSummaryVariableName))

        })

        tonnageSummaryVariables.map(tonnageSummaryVariable => {

          const tonnageSummaryVariableName = `${type}_${tonnageSummaryVariable}${lastOrCurrent}`

          const tonnageSummaryCaseExpression = new CaseExpression({
            cases: [...months.map(month => {

              return {
                $when: new BinaryExpression(new ColumnExpression('monthTable', 'month'), '=', month),
                $then: new ColumnExpression('tonnage', `${month}_${tonnageSummaryVariableName}`)

              } as ICase
            })
            ],
            $else: new Value(null)
          })

          $select.push(
            new ResultColumn(
              tonnageSummaryCaseExpression, `${tonnageSummaryVariableName}`
            )
          )
        })

      })

    })

    return new Query({

      $select,

      $from: new FromTable('monthTable',

        new JoinClause({
          table: 'tonnage',
          operator: 'LEFT',
          $on: [
            new Value(true)
          ],
        }),

        new JoinClause({
          table: 'profit',
          operator: 'LEFT',
          $on: [
            new BinaryExpression(
              new ColumnExpression('profit', 'month'),
              '=',
              new ColumnExpression('monthTable', 'month')
            ),
          ],
        }),

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

  createMonthTable(),
  insertMonthTable(),
  [prepareTonnageParams2(), tonnageQuery()],
  finalQuery()
  // [prepareTonnageParams2(), tonnageQuery()]

  // new Query({

  //   $from : 'profit'
  // })

  // // prepareTonnage Data
  // createTonnagetable(),
  // [prepareTonnageParams(true, 'F'), insertTonnageData(true, 'F')],
  // [prepareTonnageParams(false, 'F'), insertTonnageData(false, 'F')],
  // [prepareTonnageParams(true, 'R'), insertTonnageData(true, 'R')],
  // [prepareTonnageParams(false, 'R'), insertTonnageData(false, 'R')],

  // processTonnageSummary(),

  // finalQuery(),
]

// filters avaliable for this card
// all card in DB record using this jql will have these filter
export const filters = [{
  display: 'tonnageSummaryVariables',
  name: 'tonnageSummaryVariables',
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
    multi: false,
    required: true,
  },
  type: 'list',
}, ]
