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
const types = ['shipments']

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
    params.fields = ['carrierCode', 'carrierName', 'jobMonth', 'shipments']

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
        new ResultColumn('shipments'),
      ],
      $from: new FromTable(
        {
          method: 'POST',
          url: 'api/shipment/query/shipment',
          columns: [
            { name: 'carrierCode', type: 'string' },
            { name: 'carrierName', type: 'string' },
            { name: 'jobMonth', type: 'string' },
            { name: 'shipments', type: 'number' },
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

  function composeSumExpression(dumbList: any[]): MathExpression {

    if (dumbList.length === 2) {
      return new MathExpression(dumbList[0], '+', dumbList[1])
    }

    const popResult = dumbList.pop()

    return new MathExpression(popResult, '+', composeSumExpression(dumbList))
  }

  const $select = [

    new ResultColumn('carrierCode'),
    new ResultColumn('carrierName'),

  ]

  const finalSumList = []

  months.map((month: string) => {

    types.map((type: string) => {

      const column = new FunctionExpression('IFNULL',
        new FunctionExpression(
          'FIND',
          new BinaryExpression(new ColumnExpression('month'), '=', month),
          new ColumnExpression(type)
        ),
        0
      )

      // single month count
      $select.push(new ResultColumn(column, `${month}-${type}`))
      finalSumList.push(column)

    })

  })

  const finalSumExpression = composeSumExpression(finalSumList)
  $select.push(new ResultColumn(finalSumExpression, `total`))

  return new Query({

    $select,

    $from: 'shipment',
    $group: 'carrierCode',
    $order : new OrderBy('total', 'DESC')
  })
}

export default [
  [prepareParams(), prepareTable()],
  finalQuery()
]
