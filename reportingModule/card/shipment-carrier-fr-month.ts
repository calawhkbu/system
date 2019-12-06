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
  OrderBy,
  MathExpression,
} from 'node-jql'

import { parseCode } from 'utils/function'

function prepareParams(type_: 'F' | 'R'): Function {
  const fn = function(require, session, params) {
    // import
    const moment = require('moment')
    const { BadRequestException } = require('@nestjs/common')

    const subqueries = (params.subqueries = params.subqueries || {})

    if (!subqueries.summaryVariables) throw new BadRequestException('MISSING_summaryVariables')
    if (!subqueries.finalOrderBy) throw new BadRequestException('MISSING_finalOrderBy')

    const summaryVariables = subqueries.summaryVariables.value // should be chargeableWeight/cbm/grossWeight/totalShipment
    const finalOrderBy = subqueries.finalOrderBy.value

    // limit/extend to 1 year
    const year = (subqueries.date ? moment() : moment(subqueries.date.from, 'YYYY-MM-DD')).year()
    subqueries.date.from = moment()
      .year(year)
      .startOf('year')
      .format('YYYY-MM-DD')
    subqueries.date.to = moment()
      .year(year)
      .endOf('year')
      .format('YYYY-MM-DD')

    // select
    params.fields = ['carrierCode', 'carrierName', 'jobMonth', ...summaryVariables]

    // group by
    params.groupBy = ['carrierCode', 'carrierName', 'jobMonth']

    switch (type_) {
      case 'F':
        subqueries.nominatedTypeCode = { value: ['F'] }
        break
      case 'R':
        subqueries.nominatedTypeCode = { value: ['R'] }
        break
    }

    return params
  }

  let code = fn.toString()
  code = code.replace(new RegExp('type_', 'g'), `'${type_}'`)
  return parseCode(code)
}

// call API
function prepareData(type_: 'F' | 'R') {
  const fn = function(require, session, params) {
    const {
      Query,
      ResultColumn,
      ColumnExpression,
      FunctionExpression,
      Value,
      InsertJQL,
      FromTable,
    } = require('node-jql')

    const subqueries = (params.subqueries = params.subqueries || {})
    const summaryVariables = subqueries.summaryVariables.value // should be chargeableWeight/cbm/grossWeight/totalShipment
    const finalOrderBy = subqueries.finalOrderBy.value

    return new InsertJQL({
      name: 'shipment',
      columns: ['type', 'carrierCode', 'carrierName', 'month', ...summaryVariables],
      query: new Query({
        $select: [
          new ResultColumn(new Value(type_), 'type'),
          new ResultColumn(new ColumnExpression('carrierCode')),
          new ResultColumn(new ColumnExpression('carrierName')),
          new ResultColumn(
            new FunctionExpression('MONTHNAME', new ColumnExpression('jobMonth'), 'YYYY-MM'),
            'month'
          ),

          ...summaryVariables.map(
            variable =>
              new ResultColumn(
                new FunctionExpression('IFNULL', new ColumnExpression(variable), 0),
                variable
              )
          ),
        ],
        $from: new FromTable(
          {
            method: 'POST',
            url: 'api/shipment/query/shipment',
            columns: [
              { name: 'carrierCode', type: 'string' },
              { name: 'carrierName', type: 'string' },
              { name: 'jobMonth', type: 'string' },

              ...summaryVariables.map(variable => ({ name: variable, type: 'number' })),
            ],

            data: {
              // subqueries : { carrierCodeIsNotNull : true }
              filter: { carrierCodeIsNotNull: {} },
            },
          },
          'shipment'
        ),
      }),
    })
  }

  let code = fn.toString()
  code = code.replace(new RegExp('type_', 'g'), `'${type_}'`)
  return parseCode(code)
}

function finalQuery(types_?: string[]): Function {
  const fn = function(require, session, params) {
    const {
      OrderBy,
      MathExpression,
      Query,
      ResultColumn,
      ColumnExpression,
      FunctionExpression,
      AndExpressions,
      BinaryExpression,
    } = require('node-jql')

    const fromTableName = 'shipment'

    const finalGroupBy = ['carrierCode', 'carrierName']

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
    const summaryVariables = subqueries.summaryVariables.value // should be chargeableWeight/cbm/grossWeight/totalShipment
    const finalOrderBy = subqueries.finalOrderBy.value

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

    return new Query({
      $select,
      $from: fromTableName,

      $group: finalGroupBy,
      $order: finalOrderBy.map(x => new OrderBy(x, 'DESC')),
    })
  }

  let code = fn.toString()

  code = code.replace(
    new RegExp('types_', 'g'),
    types_ && types_.length ? `[${types_.map(x => `'${x}'`)}]` : `[]`
  )

  return parseCode(code)
}

function createTable() {
  return function(require, session, params) {
    const { CreateTableJQL, Column } = require('node-jql')

    const subqueries = (params.subqueries = params.subqueries || {})
    const summaryVariables = subqueries.summaryVariables.value // should be chargeableWeight/cbm/grossWeight/totalShipment
    const finalOrderBy = subqueries.finalOrderBy.value

    // prepare temp table
    return new CreateTableJQL(true, 'shipment', [
      new Column('type', 'string'),
      new Column('carrierCode', 'string'),
      new Column('carrierName', 'string'),
      new Column('month', 'string'),
      ...summaryVariables.map(variable => new Column(variable, 'number')),
    ])
  }
}

export default [
  createTable(),
  // prepare data
  [prepareParams('F'), prepareData('F')],
  [prepareParams('R'), prepareData('R')],

  finalQuery(['F', 'R']),
]
