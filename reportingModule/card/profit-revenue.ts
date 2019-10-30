import {
  BinaryExpression,
  MathExpression,
  Query,
  FromTable,
  CreateTableJQL,
  ResultColumn,
  ColumnExpression,
  FunctionExpression,
  Value,
  JoinClause,
} from 'node-jql'

function prepareParams(): Function {
  return function(require, session, params) {
    // import
    const moment = require('moment')

    // script
    const subqueries = (params.subqueries = params.subqueries || {})
    if (subqueries.date) {
      const year = moment(subqueries.date.from, 'YYYY-MM-DD').year()
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
}

function perpareIntermediate(): CreateTableJQL {
  return new CreateTableJQL({
    $temporary: true,
    name: 'intermediate',
    $as: new Query({
      $select: [
        new ResultColumn(
          new FunctionExpression('YEAR', new ColumnExpression('jobMonth'), 'YYYY-MM'),
          'year'
        ),
        new ResultColumn(
          new FunctionExpression('MONTHNAME', new ColumnExpression('jobMonth'), 'YYYY-MM'),
          'month'
        ),
        new ResultColumn('currency'),
        new ResultColumn(
          new FunctionExpression('ROUND', new ColumnExpression('grossProfit'), 0),
          'grossProfit'
        ),
        new ResultColumn(
          new FunctionExpression('ROUND', new ColumnExpression('revenue'), 0),
          'revenue'
        ),
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
              name: 'currency',
              type: 'string',
            },
            {
              name: 'jobMonth',
              type: 'string',
            },
            {
              name: 'grossProfit',
              type: 'number',
            },
            {
              name: 'revenue',
              type: 'number',
            },
          ],
        },
        'intermediate'
      ),
    }),
  })
}

function prepareTable(name: string): CreateTableJQL {
  return new CreateTableJQL({
    $temporary: true,
    name,
    $as: new Query({
      $select: [
        new ResultColumn(new Value(name), 'type'),
        new ResultColumn(new ColumnExpression('lhs', 'year')),
        new ResultColumn(new ColumnExpression('lhs', 'month')),
        new ResultColumn(new ColumnExpression('lhs', 'currency')),
        new ResultColumn(new ColumnExpression('lhs', name), 'value'),
        new ResultColumn(
          new MathExpression(
            new ColumnExpression('lhs', name),
            '/',
            new ColumnExpression('rhs', 'revenue')
          ),
          'percent'
        ),
      ],
      $from: new FromTable(
        'intermediate',
        'lhs',
        new JoinClause(
          'LEFT',
          new FromTable(new Query('intermediate'), 'rhs'),
          new BinaryExpression(
            new ColumnExpression('lhs', 'month'),
            '=',
            new ColumnExpression('rhs', 'month')
          )
        )
      ),
    }),
  })
}

export default [
  [prepareParams(), perpareIntermediate()],
  prepareTable('grossProfit'),
  prepareTable('revenue'),
  new Query({
    $from: 'grossProfit',
    $union: new Query('revenue'),
  }),
]
