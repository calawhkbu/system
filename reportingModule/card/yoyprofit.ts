import { Query, FromTable, CreateTableJQL, ResultColumn, ColumnExpression, FunctionExpression } from 'node-jql'

function prepareTable(name: string): CreateTableJQL {
  return new CreateTableJQL({
    $temporary: true,
    name,
    $as: new Query({
      $select: [
        new ResultColumn(new FunctionExpression('YEAR', new ColumnExpression('jobMonth'), 'YYYY-MM'), 'year'),
        new ResultColumn(new FunctionExpression('MONTHNAME', new ColumnExpression('jobMonth'), 'YYYY-MM'), 'month'),
        new ResultColumn('currency'),
        new ResultColumn(new FunctionExpression('ROUND', new ColumnExpression('grossProfit'), 0), 'grossProfit'),
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
            name: 'grossProfit',
            type: 'number'
          }
        ]
      }, name),
    })
  })
}

export default [
  [function (require, session, params) {
    const moment = require('moment')
    const subqueries = params.subqueries
    if (subqueries && subqueries.jobDate) {
      const year = moment(subqueries.jobDate.from, 'YYYY-MM-DD').year()
      subqueries.jobDate.from = moment().year(year).startOf('year').format('YYYY-MM-DD')
      subqueries.jobDate.to = moment().year(year).endOf('year').format('YYYY-MM-DD')
    }
    return params
  }, prepareTable('current')],
  [function (require, session, params) {
    const moment = require('moment')
    const subqueries = params.subqueries
    if (subqueries && subqueries.jobDate) {
      const year = moment(subqueries.jobDate.from, 'YYYY-MM-DD').year() - 1
      subqueries.jobDate.from = moment().year(year).startOf('year').format('YYYY-MM-DD')
      subqueries.jobDate.to = moment().year(year).endOf('year').format('YYYY-MM-DD')
    }
    return params
  }, prepareTable('last')],
  new Query({
    $from: 'last',
    $union: new Query('current')
  })
]