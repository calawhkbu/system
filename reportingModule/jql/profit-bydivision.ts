import { Query, FromTable, CreateTableJQL, ResultColumn, ColumnExpression, FunctionExpression, Value } from 'node-jql'

function prepareTable(name: string): CreateTableJQL {
  return new CreateTableJQL({
    $temporary: true,
    name,
    $as: new Query({
      $select: [
        new ResultColumn(new Value(name), 'type'),
        new ResultColumn(new FunctionExpression('YEAR', new ColumnExpression('jobMonth'), 'YYYY-MM'), 'year'),
        new ResultColumn(new FunctionExpression('MONTHNAME', new ColumnExpression('jobMonth'), 'YYYY-MM'), 'month'),
        new ResultColumn('currency'),
        new ResultColumn(new FunctionExpression('ROUND', new ColumnExpression('grossProfit'), 0), 'value'),
      ],
      $from: new FromTable({
        method: 'POST',
        url: 'api/shipment/query/fm3k-vsiteanalysis',
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
  [function (require, params) {
    const subqueries = params.subqueries
    if (!subqueries || !subqueries.division) throw new Error('MISSING_DIVISION')
    if (subqueries && subqueries.division) {
      if (subqueries.division.value !== 'SE' && subqueries.division.value !== 'SI') throw new Error('DIVISION_NOT_SUPPORTED')
      subqueries.division.value += ' FCL'
    }
    return params
  }, prepareTable('FCL')],
  [function (require, params) {
    const subqueries = params.subqueries
    if (!subqueries || !subqueries.division) throw new Error('MISSING_DIVISION')
    if (subqueries && subqueries.division) {
      if (subqueries.division.value !== 'SE' && subqueries.division.value !== 'SI') throw new Error('DIVISION_NOT_SUPPORTED')
      subqueries.division.value += ' LCL'
    }
    return params
  }, prepareTable('LCL')],
  [function (require, params) {
    const subqueries = params.subqueries
    if (!subqueries || !subqueries.division) throw new Error('MISSING_DIVISION')
    if (subqueries && subqueries.division) {
      if (subqueries.division.value !== 'SE' && subqueries.division.value !== 'SI') throw new Error('DIVISION_NOT_SUPPORTED')
      subqueries.division.value += ' Consol'
    }
    return params
  }, prepareTable('Consol')],
  new Query({
    $from: 'FCL',
    $union: new Query({
      $from: 'LCL',
      $union: new Query('Consol')
    })
  })
]