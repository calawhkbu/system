import { Query, FromTable, CreateTableJQL, ResultColumn, ColumnExpression, FunctionExpression, JoinClause, BinaryExpression, MathExpression, Value, CreateFunctionJQL } from 'node-jql'

function parseCode(code): Function {
  code = code.trim()
  if (!code.startsWith('function')) throw new SyntaxError(`Position 0: Keyword 'function' is missing`)
  const argsIndex = [code.indexOf('(') + 1, code.indexOf(')')]
  const bodyIndex = [code.indexOf('{') + 1, code.lastIndexOf('}')]
  if (argsIndex[1] > bodyIndex[0]) throw new SyntaxError(`Position ${bodyIndex[0]}: Curved bracket '{}' is not allowed in argument section 'function()'`)
  if (bodyIndex[1] - bodyIndex[0] === 1) throw new SyntaxError(`Position ${bodyIndex[0]}: Empty function`)
  let args = []
  if (argsIndex[1] - argsIndex[0] > 1) {
    args = code.substring(argsIndex[0], argsIndex[1]).split(',').map(pc => pc.trim())
  }
  args.push(code.substring(bodyIndex[0], bodyIndex[1]))
  return new Function(...args)
}

function prepareParams(thisYear: boolean, nominatedType_: 'F'|'R'): Function {
  const fn = function (require, params) {
    const moment = require('moment')
    const subqueries = params.subqueries
    if (subqueries && subqueries.jobDate) {
      let year = moment(subqueries.jobDate.from, 'YYYY-MM-DD').year()
      if (!thisYear) year -= 1
      subqueries.jobDate.from = moment().year(year).startOf('year').format('YYYY-MM-DD')
      subqueries.jobDate.to = moment().year(year).endOf('year').format('YYYY-MM-DD')
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
        new ResultColumn(new FunctionExpression('IF',
          new BinaryExpression(new ColumnExpression('revenue'), '=', 0),
          new Value(0),
          new MathExpression(new ColumnExpression('grossProfit'), '/', new ColumnExpression('revenue'))
        ), 'margin'),
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
          },
          {
            name: 'revenue',
            type: 'number'
          }
        ]
      }, name),
    })
  })
}

export default [
  new CreateFunctionJQL('PERCENT_CHANGE', function (currValue: number, lastValue: number) {
    if (currValue === 0 || lastValue === 0) return 0
    return (currValue - lastValue) / lastValue
  }, 'number', 'number', 'number'),
  [prepareParams(true, 'F'), prepareTable('current_F')],
  [prepareParams(true, 'R'), prepareTable('current_R')],
  [prepareParams(false, 'F'), prepareTable('last_F')],
  [prepareParams(false, 'R'), prepareTable('last_R')],
  new Query({
    $select: [
      new ResultColumn(new ColumnExpression('cf', 'month'), 'month'),
      new ResultColumn(new FunctionExpression('ROUND', new ColumnExpression('cf', 'grossProfit'), 0), 'grossProfit_F'),
      new ResultColumn(new FunctionExpression('ROUND', new ColumnExpression('cr', 'grossProfit'), 0), 'grossProfit_R'),
      new ResultColumn(new FunctionExpression('NUMBER_FORMAT', new ColumnExpression('cf', 'margin'), '0.00%'), 'margin_F'),
      new ResultColumn(new FunctionExpression('NUMBER_FORMAT', new ColumnExpression('cr', 'margin'), '0.00%'), 'margin_R'),
      new ResultColumn(new FunctionExpression('NUMBER_FORMAT', new FunctionExpression('PERCENT_CHANGE', new ColumnExpression('cf', 'grossProfit'), new ColumnExpression('lf', 'grossProfit')), '0.00%'), 'pc_grossProfit_F'),
      new ResultColumn(new FunctionExpression('NUMBER_FORMAT', new FunctionExpression('PERCENT_CHANGE', new ColumnExpression('cr', 'grossProfit'), new ColumnExpression('lr', 'grossProfit')), '0.00%'), 'pc_grossProfit_R')
    ],
    $from: new FromTable('current_F', 'cf',
      new JoinClause('LEFT', new FromTable('current_R', 'cr'), new BinaryExpression(new ColumnExpression('cf', 'month'), '=', new ColumnExpression('cr', 'month'))),
      new JoinClause('LEFT', new FromTable('last_F', 'lf'), new BinaryExpression(new ColumnExpression('cf', 'month'), '=', new ColumnExpression('lf', 'month'))),
      new JoinClause('LEFT', new FromTable('last_R', 'lr'), new BinaryExpression(new ColumnExpression('cf', 'month'), '=', new ColumnExpression('lr', 'month')))
    )
  })
]
