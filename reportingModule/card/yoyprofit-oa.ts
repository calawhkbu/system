import { parseCode } from 'utils/function'
import { Query, FromTable, CreateTableJQL, ResultColumn, ColumnExpression, FunctionExpression, MathExpression, CreateFunctionJQL } from 'node-jql'

function prepareParams(thisYear: boolean, nominatedType_: 'F' | 'R'): Function {
  const fn = function(require, session, params) {
    const moment = require('moment')
    const subqueries = (params.subqueries = params.subqueries || {})
    if (subqueries.date) {
      let year = moment(subqueries.date.from, 'YYYY-MM-DD').year()
      if (!thisYear) year -= 1
      subqueries.date.from = moment()
        .year(year)
        .startOf('year')
        .format('YYYY-MM-DD')
      subqueries.date.to = moment()
        .year(year)
        .endOf('year')
        .format('YYYY-MM-DD')
    }
    if (subqueries) subqueries.nominatedType = { value: nominatedType_ }
    return params
  }
  let code = fn.toString()
  code = code.replace(new RegExp('thisYear', 'g'), String(thisYear))
  code = code.replace(new RegExp('nominatedType_', 'g'), `'${nominatedType_}'`)
  return parseCode(code)
}

function prepareTable(name: string): CreateTableJQL {
  return new CreateTableJQL({
    $temporary: true,
    name,
    $as: new Query({
      $select: [
        new ResultColumn(new FunctionExpression('YEAR', new ColumnExpression('jobMonth'), 'YYYY-MM'), 'year'),
        new ResultColumn(new FunctionExpression('MONTHNAME', new ColumnExpression('jobMonth'), 'YYYY-MM'), 'month'),
        new ResultColumn('currency'),
        new ResultColumn('grossProfit'),
        new ResultColumn(new MathExpression(new ColumnExpression('grossProfit'), '/', new ColumnExpression('revenue')), 'margin'),
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
        name
      ),
    }),
  })
}

export default [
  // prepare function
  new CreateFunctionJQL(
    'PERCENT_CHANGE',
    function(currValue: number, lastValue: number) {
      if (currValue === 0 || lastValue === 0 || isNaN(currValue) || isNaN(lastValue)) return NaN
      return (currValue - lastValue) / Math.abs(lastValue)
    },
    'number',
    'number',
    'number'
  ),

  // prepare tables
  [prepareParams(true, 'F'), prepareTable('current_F')],
  [prepareParams(true, 'R'), prepareTable('current_R')],
  [prepareParams(false, 'F'), prepareTable('last_F')],
  [prepareParams(false, 'R'), prepareTable('last_R')],

  // finalize
  function(require, session, params) {
    const { Query, FromTable, ResultColumn, ColumnExpression, FunctionExpression, JoinClause, BinaryExpression } = require('node-jql')
    const query = new Query({
      $select: [
        new ResultColumn(new FunctionExpression('ROUND', new ColumnExpression('cf', 'grossProfit'), 0), 'grossProfit_F'),
        new ResultColumn(new FunctionExpression('ROUND', new ColumnExpression('cr', 'grossProfit'), 0), 'grossProfit_R'),
        new ResultColumn(new FunctionExpression('NUMBER_FORMAT', new ColumnExpression('cf', 'margin'), '0.00%'), 'margin_F'),
        new ResultColumn(new FunctionExpression('NUMBER_FORMAT', new ColumnExpression('cr', 'margin'), '0.00%'), 'margin_R'),
        new ResultColumn(
          new FunctionExpression('NUMBER_FORMAT', new FunctionExpression('PERCENT_CHANGE', new ColumnExpression('cf', 'grossProfit'), new ColumnExpression('lf', 'grossProfit')), '0.00%'),
          'pc_grossProfit_F'
        ),
        new ResultColumn(
          new FunctionExpression('NUMBER_FORMAT', new FunctionExpression('PERCENT_CHANGE', new ColumnExpression('cr', 'grossProfit'), new ColumnExpression('lr', 'grossProfit')), '0.00%'),
          'pc_grossProfit_R'
        ),
        new ResultColumn(
          new FunctionExpression('NUMBER_FORMAT', new FunctionExpression('PERCENT_CHANGE', new ColumnExpression('cf', 'margin'), new ColumnExpression('lf', 'margin')), '0.00%'),
          'pc_margin_F'
        ),
        new ResultColumn(
          new FunctionExpression('NUMBER_FORMAT', new FunctionExpression('PERCENT_CHANGE', new ColumnExpression('cr', 'margin'), new ColumnExpression('lr', 'margin')), '0.00%'),
          'pc_margin_R'
        ),
      ],
      $from: new FromTable(
        'current_F',
        'cf',
        new JoinClause('LEFT', new FromTable('current_R', 'cr'), new BinaryExpression(new ColumnExpression('cf', 'month'), '=', new ColumnExpression('cr', 'month'))),
        new JoinClause('LEFT', new FromTable('last_F', 'lf'), new BinaryExpression(new ColumnExpression('cf', 'month'), '=', new ColumnExpression('lf', 'month'))),
        new JoinClause('LEFT', new FromTable('last_R', 'lr'), new BinaryExpression(new ColumnExpression('cf', 'month'), '=', new ColumnExpression('lr', 'month')))
      ),
    })
    if (params.subqueries && params.subqueries.showMonth) query.$select.unshift(new ResultColumn(new ColumnExpression('cf', 'month'), 'month'))
    return query
  },
]
