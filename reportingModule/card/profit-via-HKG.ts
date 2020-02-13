import { BinaryExpression, Column, ColumnExpression, CreateTableJQL, FunctionExpression, Query, ResultColumn, Value } from 'node-jql'
import { parseCode } from 'utils/function'

function prepareParams(houseNoPattern_: string): Function {
  const fn = function(require, session, params) {
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
    subqueries.viaHKG = true
    subqueries.likeHouseNo = { value: houseNoPattern_ }

    return params
  }
  let code = fn.toString()
  code = code.replace(new RegExp('houseNoPattern_', 'g'), `'${houseNoPattern_}'`)
  return parseCode(code)
}

function prepareData(name_: string): Function {
  const fn = async function(require, session, params) {
    const { ColumnExpression, FromTable, FunctionExpression, InsertJQL, Query, ResultColumn, Value } = require('node-jql')

    return new InsertJQL({
      name: 'profit',
      columns : ['name', 'month', 'profit'],
      query : new Query({
        $select: [
          new ResultColumn(new Value(name_), ''),
          new ResultColumn(
            new FunctionExpression('MONTHNAME', new ColumnExpression('jobMonth'), 'YYYY-MM'),
            'month'
          ),
          new ResultColumn('grossProfit', 'profit')
        ],
        $from: new FromTable(
          {
            method: 'POST',
            url: 'api/shipment/query/profit',
            columns: [
              { name: 'jobMonth', type: 'string' },
              { name: 'grossProfit', type: 'number' }
            ]
          },
          'profit'
        ),
      })
    })
  }
  let code = fn.toString()
  code = code.replace(new RegExp('name_', 'g'), `'${name_}'`)
  return parseCode(code)
}

export default [
  // temp table
  new CreateTableJQL(true, 'profit', [
    new Column('name', 'string', true),
    new Column('month', 'string'),
    new Column('profit', 'number'),
  ]),

  // data from GZH
  [prepareParams('GZH%'), prepareData('GGL GZH')],

  // data from XMN
  [prepareParams('XMN%'), prepareData('GGL XMN')],

  // TODO final query
  new Query({
    $select: [
      new ResultColumn('name'),
      new ResultColumn(new FunctionExpression('SUM', new ColumnExpression('profit')), 'total'),
      new ResultColumn(
        new FunctionExpression(
          'IFNULL',
          new FunctionExpression(
            'FIND',
            new BinaryExpression(new ColumnExpression('month'), '=', new Value('January')),
            new ColumnExpression('profit')
          ),
          0
        ),
        'Jan'
      ),
      new ResultColumn(
        new FunctionExpression(
          'IFNULL',
          new FunctionExpression(
            'FIND',
            new BinaryExpression(new ColumnExpression('month'), '=', new Value('February')),
            new ColumnExpression('profit')
          ),
          0
        ),
        'Feb'
      ),
      new ResultColumn(
        new FunctionExpression(
          'IFNULL',
          new FunctionExpression(
            'FIND',
            new BinaryExpression(new ColumnExpression('month'), '=', new Value('March')),
            new ColumnExpression('profit')
          ),
          0
        ),
        'Mar'
      ),
      new ResultColumn(
        new FunctionExpression(
          'IFNULL',
          new FunctionExpression(
            'FIND',
            new BinaryExpression(new ColumnExpression('month'), '=', new Value('April')),
            new ColumnExpression('profit')
          ),
          0
        ),
        'Apr'
      ),
      new ResultColumn(
        new FunctionExpression(
          'IFNULL',
          new FunctionExpression(
            'FIND',
            new BinaryExpression(new ColumnExpression('month'), '=', new Value('May')),
            new ColumnExpression('profit')
          ),
          0
        ),
        'May'
      ),
      new ResultColumn(
        new FunctionExpression(
          'IFNULL',
          new FunctionExpression(
            'FIND',
            new BinaryExpression(new ColumnExpression('month'), '=', new Value('June')),
            new ColumnExpression('profit')
          ),
          0
        ),
        'Jun'
      ),
      new ResultColumn(
        new FunctionExpression(
          'IFNULL',
          new FunctionExpression(
            'FIND',
            new BinaryExpression(new ColumnExpression('month'), '=', new Value('July')),
            new ColumnExpression('profit')
          ),
          0
        ),
        'Jul'
      ),
      new ResultColumn(
        new FunctionExpression(
          'IFNULL',
          new FunctionExpression(
            'FIND',
            new BinaryExpression(new ColumnExpression('month'), '=', new Value('August')),
            new ColumnExpression('profit')
          ),
          0
        ),
        'Aug'
      ),
      new ResultColumn(
        new FunctionExpression(
          'IFNULL',
          new FunctionExpression(
            'FIND',
            new BinaryExpression(new ColumnExpression('month'), '=', new Value('September')),
            new ColumnExpression('profit')
          ),
          0
        ),
        'Sep'
      ),
      new ResultColumn(
        new FunctionExpression(
          'IFNULL',
          new FunctionExpression(
            'FIND',
            new BinaryExpression(new ColumnExpression('month'), '=', new Value('October')),
            new ColumnExpression('profit')
          ),
          0
        ),
        'Oct'
      ),
      new ResultColumn(
        new FunctionExpression(
          'IFNULL',
          new FunctionExpression(
            'FIND',
            new BinaryExpression(new ColumnExpression('month'), '=', new Value('November')),
            new ColumnExpression('profit')
          ),
          0
        ),
        'Nov'
      ),
      new ResultColumn(
        new FunctionExpression(
          'IFNULL',
          new FunctionExpression(
            'FIND',
            new BinaryExpression(new ColumnExpression('month'), '=', new Value('December')),
            new ColumnExpression('profit')
          ),
          0
        ),
        'Dec'
      )
    ],
    $from: 'profit',
    $group: 'name'
  })
]

export const filters = []
