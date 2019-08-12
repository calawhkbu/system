import { Query, FromTable, CreateTableJQL, ResultColumn, ColumnExpression, FunctionExpression, Value } from 'node-jql'

function prepareParams (check?: boolean): Function {
  if (check) {
    return function (require, session, params) {
      // import
      const moment = require('moment')

      // script
      const subqueries = params.subqueries = params.subqueries || {}
      if (subqueries.date) {
        const year = moment(subqueries.date.from, 'YYYY-MM-DD').year()
        subqueries.date.from = moment().year(year).startOf('year').format('YYYY-MM-DD')
        subqueries.date.to = moment().year(year).endOf('year').format('YYYY-MM-DD')
      }
      return params
    }
  }
  return function (require, session, params) {
    return params
  }
}

function prepareTable (name: string): CreateTableJQL {
  return new CreateTableJQL({
    $temporary: true,
    name,
    $as: new Query({
      $select: [
        new ResultColumn(new Value(name), 'type'),
        new ResultColumn(new FunctionExpression('YEAR', new ColumnExpression('jobMonth'), 'YYYY-MM'), 'year'),
        new ResultColumn(new FunctionExpression('MONTHNAME', new ColumnExpression('jobMonth'), 'YYYY-MM'), 'month'),
        new ResultColumn('currency'),
        new ResultColumn(new FunctionExpression('ROUND', new ColumnExpression(name), 0), 'value'),
      ],
      $from: new FromTable({
        method: 'POST',
        url: 'api/shipment/query/profit',
        columns: [
          {
            name: 'officePartyCode',
            type: 'string'
          },
          {
            name: 'currency',
            type: 'string'
          },
          {
            name: 'jobMonth',
            type: 'string'
          },
          {
            name,
            type: 'number'
          }
        ]
      }, name),
    })
  })
}

export default [
  [prepareParams(true), prepareTable('grossProfit')],
  [prepareParams(), prepareTable('revenue')],
  new Query({
    $from: 'grossProfit',
    $union: new Query('revenue')
  })
]
