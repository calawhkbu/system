import {
  AndExpressions,
  BinaryExpression,
  ColumnExpression,
  CreateTableJQL,
  FromTable,
  FunctionExpression,
  InsertJQL,
  Value,
  Query,
  ResultColumn,
  Column,
  GroupBy,
  JoinClause,
  IsNullExpression,
  InExpression,
  CreateFunctionJQL,
  MathExpression,
} from 'node-jql'

import { parseCode } from 'utils/function'

// hardcode all reportingGroup and divided into SEA and AIR
const moduleTypeCodeList = {
  AIR: ['AC', 'AD', 'AM', 'AN', 'AZ'],
  SEA: ['SA', 'SB', 'SC', 'SR', 'SS', 'ST'],
}

function prepareParams(): Function {
  return function(require, session, params) {
    // import
    const moment = require('moment')

    const subqueries = (params.subqueries = params.subqueries || {})

    let summaryVariables: string[]
    if (subqueries.summaryVariables && subqueries.summaryVariables.value)
    {
      // sumamary variable
      summaryVariables = subqueries.summaryVariables.value // should be chargeableWeight/cbm/grossWeight/totalShipment
    }

    else if (subqueries.summaryVariable && subqueries.summaryVariable.value)
    {
      summaryVariables = [subqueries.summaryVariable.value]
    }
    else {
      throw new Error('MISSING_summaryVariables')
    }

    // limit/extend to 1 year
    const year = (subqueries.date ? moment(subqueries.date.from, 'YYYY-MM-DD') : moment()).year()
    subqueries.date.from = moment()
      .year(year)
      .startOf('year')
      .format('YYYY-MM-DD')
    subqueries.date.to = moment()
      .year(year)
      .endOf('year')
      .format('YYYY-MM-DD')

    // select
    params.fields = ['moduleTypeCode', 'reportingGroup', 'jobMonth', ...summaryVariables]

    // group by
    params.groupBy = ['moduleTypeCode', 'reportingGroup', 'jobMonth']

    return params
  }
}

function prepareTable(): Function {

  return function(require, session, params){

    const subqueries = (params.subqueries = params.subqueries || {})

    let summaryVariables: string[]
    if (subqueries.summaryVariables && subqueries.summaryVariables.value)
    {
      // sumamary variable
      summaryVariables = subqueries.summaryVariables.value // should be chargeableWeight/cbm/grossWeight/totalShipment
    }

    else if (subqueries.summaryVariable && subqueries.summaryVariable.value)
    {
      summaryVariables = [subqueries.summaryVariable.value]
    }
    else {
      throw new Error('MISSING_summaryVariables')
    }

    const {
      CreateTableJQL,
      Query,
      ColumnExpression,
      ResultColumn,
      FunctionExpression,
      BinaryExpression,
      FromTable,
    } = require('node-jql')

    return new CreateTableJQL({
      $temporary: true,
      name: 'shipment',

      $as: new Query({
        $select: [
          new ResultColumn(new ColumnExpression('moduleTypeCode')),
          new ResultColumn(
            new FunctionExpression('MONTHNAME', new ColumnExpression('jobMonth'), 'YYYY-MM'),
            'month'
          ),
          new ResultColumn(new ColumnExpression('reportingGroup')),

          ...summaryVariables.map(variable => new ResultColumn(new ColumnExpression(variable)))

        ],
        $from: new FromTable(
          {
            method: 'POST',
            url: 'api/shipment/query/shipment',
            columns: [
              { name: 'moduleTypeCode', type: 'string' },
              { name: 'jobMonth', type: 'string' },
              { name: 'reportingGroup', type: 'string' },
              ...summaryVariables.map(variable => ({ name: variable, type: 'number' }))
            ],
          },
          'shipment'
        ),
      }),
    })

  }
}

function prepareReportingGroupTable(): CreateTableJQL {
  const name = 'reportingGroupTable'

  return new CreateTableJQL({
    $temporary: true,
    name,
    columns: [new Column('moduleTypeCode', 'string'), new Column('reportingGroup', 'string')],
  })
}

function insertReportingGroupTable(): InsertJQL {
  const name = 'reportingGroupTable'

  const insertList = []

  for (const moduleTypeCode in moduleTypeCodeList) {
    if (moduleTypeCodeList.hasOwnProperty(moduleTypeCode)) {
      const reportingGroupList = moduleTypeCodeList[moduleTypeCode] as string[]

      reportingGroupList.map((reportingGroup: string) => {
        insertList.push({ reportingGroup, moduleTypeCode })
      })
    }
  }

  return new InsertJQL(name, ...insertList)
}

function prepareResultTable() {
  return function(require, session, params) {
    const {
      CreateTableJQL,
      Query,
      ColumnExpression,
      ResultColumn,
      FunctionExpression,
      BinaryExpression,
      FromTable,
    } = require('node-jql')

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

    const subqueries = (params.subqueries = params.subqueries || {})

    let summaryVariables: string[]
    if (subqueries.summaryVariables && subqueries.summaryVariables.value)
    {
      // sumamary variable
      summaryVariables = subqueries.summaryVariables.value // should be chargeableWeight/cbm/grossWeight/totalShipment
    }

    else if (subqueries.summaryVariable && subqueries.summaryVariable.value)
    {
      summaryVariables = [subqueries.summaryVariable.value]
    }
    else {
      throw new Error('MISSING_summaryVariables')

    }

    const $select = [
      new ResultColumn(new ColumnExpression('reportingGroupTable', 'reportingGroup')),
      new ResultColumn(new ColumnExpression('reportingGroupTable', 'moduleTypeCode')),
    ]

    summaryVariables.map(variable => {
      months.map((month: string) => {
        const columeName = `${month}_${variable}`

        $select.push(
          new ResultColumn(
            new FunctionExpression('IFNULL', new ColumnExpression('final', columeName), 0),
            `${month}_value`
          )
        )
      })

      const totalColumnName = `total_${variable}`

      $select.push(
        new ResultColumn(
          new FunctionExpression('IFNULL', new ColumnExpression('final', totalColumnName), 0),
          'total_value'
        )
      )
    })

    return new CreateTableJQL({
      $temporary: true,
      name: 'result',

      $as: new Query({
        $select,

        $from: new FromTable('reportingGroupTable', 'reportingGroupTable', {
          operator: 'LEFT',
          table: 'final',
          $on: new BinaryExpression(
            new ColumnExpression('final', 'reportingGroup'),
            '=',
            new ColumnExpression('reportingGroupTable', 'reportingGroup')
          ),
        }),
      }),
    })
  }
}

function prepareFinalTable(types_?: string[]) {
  const fn = function(require, session, params) {
    const {
      MathExpression,
      Query,
      ResultColumn,
      ColumnExpression,
      FunctionExpression,
      AndExpressions,
      BinaryExpression,
      CreateTableJQL,
    } = require('node-jql')

    const fromTableName = 'shipment'

    const finalGroupBy = ['moduleTypeCode', 'reportingGroup']

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

    function composeSumExpression(dumbList: any[]): MathExpression {
      if (dumbList.length === 2) {
        return new MathExpression(dumbList[0], '+', dumbList[1])
      }

      const popResult = dumbList.pop()

      return new MathExpression(popResult, '+', composeSumExpression(dumbList))
    }

    const $select = [...finalGroupBy.map(x => new ResultColumn(new ColumnExpression(x)))]

    const subqueries = (params.subqueries = params.subqueries || {})

    let summaryVariables: string[]
    if (subqueries.summaryVariables && subqueries.summaryVariables.value)
    {
      // sumamary variable
      summaryVariables = subqueries.summaryVariables.value // should be chargeableWeight/cbm/grossWeight/totalShipment
    }

    else if (subqueries.summaryVariable && subqueries.summaryVariable.value)
    {
      summaryVariables = [subqueries.summaryVariable.value]
    }
    else {
      throw new Error('MISSING_summaryVariables')

    }

    summaryVariables.map(variable => {
      const finalSumList = []

      months.map(month => {
        const monthSumList = []

        if (types_ && types_.length) {
          // case when types is given

          types_.map((type: string) => {
            const expression = new FunctionExpression(
              'IFNULL',
              new FunctionExpression(
                'FIND',
                new AndExpressions([
                  new BinaryExpression(new ColumnExpression('month'), '=', month),
                  // hardcode
                  new BinaryExpression(new ColumnExpression('type'), '=', type),
                ]),
                new ColumnExpression(variable)
              ),
              0
            )

            const columnName = `${month}_${type}_${variable}`

            $select.push(new ResultColumn(expression, columnName))
            monthSumList.push(expression)
            finalSumList.push(expression)
          })

          // add the month sum expression
          const monthSumExpression = composeSumExpression(monthSumList)
          $select.push(new ResultColumn(monthSumExpression, `${month}_T_${variable}`))
        } else {
          // case when types is not given
          // month summary (e.g. January_T_cbm , sum of all type of Jan) is not needed

          const expression = new FunctionExpression(
            'IFNULL',
            new FunctionExpression(
              'FIND',
              new AndExpressions([
                new BinaryExpression(new ColumnExpression('month'), '=', month),
                // hardcode
              ]),
              new ColumnExpression(variable)
            ),
            0
          )

          const columnName = `${month}_${variable}`

          $select.push(new ResultColumn(expression, columnName))
          finalSumList.push(expression)
        }
      })

      // ----perform type total e.g. total_F_shipment-------------------------

      if (types_ && types_.length) {
        types_.map((type: string) => {
          const typeSumList = []

          months.map(month => {
            const columnName = `${month}_${type}_${variable}`

            const expression = new FunctionExpression(
              'IFNULL',
              new FunctionExpression(
                'FIND',
                new AndExpressions([
                  new BinaryExpression(new ColumnExpression('month'), '=', month),
                  // hardcode
                  new BinaryExpression(new ColumnExpression('type'), '=', type),
                ]),
                new ColumnExpression(variable)
              ),
              0
            )

            typeSumList.push(expression)
          })

          const typeSumExpression = composeSumExpression(typeSumList)
          $select.push(new ResultColumn(typeSumExpression, `total_${type}_${variable}`))
        })
      }

      // final total

      const finalSumExpression = composeSumExpression(finalSumList)

      if (types_ && types_.length) {
        $select.push(new ResultColumn(finalSumExpression, `total_T_${variable}`))
      } else {
        $select.push(new ResultColumn(finalSumExpression, `total_${variable}`))
      }
    })

    return new CreateTableJQL({
      $temporary: true,
      name: 'final',
      $as: new Query({
        $select,
        $from: fromTableName,
        $group: finalGroupBy
      }),
    })
  }

  let code = fn.toString()

  code = code.replace(
    new RegExp('types_', 'g'),
    types_ && types_.length ? `[${types_.map(x => `'${x}'`)}]` : `[]`
  )

  return parseCode(code)
}

export default [
  [prepareParams(), prepareTable()],
  prepareFinalTable(),

  // new Query({

  //   $from : 'final'

  // })

  //
  prepareReportingGroupTable(),
  insertReportingGroupTable(),

  // prefrom a left join
  prepareResultTable(),

  new Query({
    $select: [
      new ResultColumn('moduleTypeCode', '__id'),
      new ResultColumn('moduleTypeCode', '__value'),
      new ResultColumn(new FunctionExpression('ROWS', new ColumnExpression('*')), '__rows'),
    ],

    $from: 'result',

    $group: 'moduleTypeCode',
  }),

]

export const filters = [

  // for this filter, user can only select single,
  // but when config in card definition, use summaryVariables. Then we can set as multi
  {
    display: 'summaryVariable',
    name: 'summaryVariable',
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
      multi : false,
      required: true,
    },
    type: 'list',
  }
]
