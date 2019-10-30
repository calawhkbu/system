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
  MathExpression,
  OrderBy,
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
const types = []
const variables = ['grossWeight', 'chargeableWeight']
const finalOrderBy = 'total-grossWeight'

function prepareParams(): Function {
  return function(require, session, params) {
    // import
    const moment = require('moment')

    // limit/extend to 1 year
    const subqueries = (params.subqueries = params.subqueries || {})
    const year = (subqueries.data ? moment() : moment(subqueries.date.from, 'YYYY-MM-DD')).year()
    subqueries.date.from = moment()
      .year(year)
      .startOf('year')
      .format('YYYY-MM-DD')
    subqueries.date.to = moment()
      .year(year)
      .endOf('year')
      .format('YYYY-MM-DD')

    // AE
    subqueries.moduleTypeCode = { value: ['AIR'] }
    subqueries.boundTypeCode = { value: ['O'] }
    subqueries.billTypeCode = { value: ['M'] }

    // select
    params.fields = ['carrierCode', 'carrierName', 'jobMonth', 'grossWeight', 'chargeableWeight']

    // group by
    params.groupBy = ['carrierCode', 'carrierName', 'jobMonth']

    return params
  }
}

function prepareTable(): CreateTableJQL {
  return new CreateTableJQL({
    $temporary: true,
    name: 'shipment',
    $as: new Query({
      $select: [
        new ResultColumn('carrierCode'),
        new ResultColumn('carrierName'),
        new ResultColumn(
          new FunctionExpression('MONTHNAME', new ColumnExpression('jobMonth'), 'YYYY-MM'),
          'month'
        ),
        new ResultColumn('grossWeight'),
        new ResultColumn('chargeableWeight'),
      ],
      $from: new FromTable(
        {
          method: 'POST',
          url: 'api/shipment/query/shipment',
          columns: [
            { name: 'carrierCode', type: 'string' },
            { name: 'carrierName', type: 'string' },
            { name: 'jobMonth', type: 'string' },
            { name: 'grossWeight', type: 'number' },
            { name: 'chargeableWeight', type: 'number' },
          ],

          data: {
            filter: { carrierCodeIsNotNull: {} },
          },
        },
        'shipment'
      ),
    }),
  })
}

function finalQuery(): Query {
  const fromTableName = 'shipment'

  function composeSumExpression(dumbList: any[]): MathExpression {
    if (dumbList.length === 2) {
      return new MathExpression(dumbList[0], '+', dumbList[1])
    }

    const popResult = dumbList.pop()

    return new MathExpression(popResult, '+', composeSumExpression(dumbList))
  }

  const $select = [
    new ResultColumn(new ColumnExpression('carrierCode')),
    new ResultColumn(new ColumnExpression('carrierName')),
  ]

  variables.map(variable => {
    const finalSumList = []

    months.map(month => {
      const monthSumList = []

      if (types && types.length) {
        // case when types is given

        types.map((type: string) => {
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

          const columnName = `${month}-${type}_${variable}`

          $select.push(new ResultColumn(expression, columnName))
          monthSumList.push(expression)
          finalSumList.push(expression)
        })

        // add the month sum expression
        const monthSumExpression = composeSumExpression(monthSumList)
        $select.push(new ResultColumn(monthSumExpression, `${month}-T_${variable}`))
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

        const columnName = `${month}-${variable}`

        $select.push(new ResultColumn(expression, columnName))
        finalSumList.push(expression)
      }
    })

    // ----perform type total e.g. total_F_shipment-------------------------

    if (types && types.length) {
      types.map((type: string) => {
        const typeSumList = []

        months.map(month => {
          const columnName = `${month}-${type}_${variable}`

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
        $select.push(new ResultColumn(typeSumExpression, `total-${type}_${variable}`))
      })
    }

    // final total

    const finalSumExpression = composeSumExpression(finalSumList)

    if (types && types.length) {
      $select.push(new ResultColumn(finalSumExpression, `total-T_${variable}`))
    } else {
      $select.push(new ResultColumn(finalSumExpression, `total-${variable}`))
    }
  })

  return new Query({
    $select,
    $from: fromTableName,

    $group: 'carrierCode',
    $order: new OrderBy(finalOrderBy, 'DESC'),
  })
}

export default [[prepareParams(), prepareTable()], finalQuery()]
