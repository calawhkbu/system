import { Query, FromTable, CreateTableJQL, ResultColumn, ColumnExpression, FunctionExpression, Value } from 'node-jql'
import { parseCode } from 'utils/function'

function prepareParams(type: string): Function {
  const fn = function(require, session, params) {
    // import
    const { BadRequestException } = require('@nestjs/common')

    // script
    const subqueries = (params.subqueries = params.subqueries || {})
    if (!subqueries.division) throw new BadRequestException('MISSING_DIVISION')
    if (subqueries.division) {
      if (subqueries.division.value !== 'SE' && subqueries.division.value !== 'SI') throw new Error('DIVISION_NOT_SUPPORTED')
      subqueries.division.value += ' ' + type
    }
    return params
  }
  let code = fn.toString()
  code = code.replace(new RegExp('type', 'g'), `'${type}'`)
  return parseCode(code)
}

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
          ],
        },
        name
      ),
    }),
  })
}

export default [
  [prepareParams('FCL'), prepareTable('FCL')],
  [prepareParams('LCL'), prepareTable('LCL')],
  [prepareParams('Consol'), prepareTable('Consol')],
  new Query({
    $from: 'FCL',
    $union: new Query({
      $from: 'LCL',
      $union: new Query('Consol'),
    }),
  }),
]
