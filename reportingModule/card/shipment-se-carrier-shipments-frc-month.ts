import {
  AndExpressions,
  BinaryExpression,
  Column,
  ColumnExpression,
  CreateTableJQL,
  FromTable,
  FunctionExpression,
  IsNullExpression,
  InsertJQL,
  Query,
  ResultColumn,
  Value,
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
const types = ['F_shipments', 'R_shipments', 'C_shipments']

function prepareParams(type_: 'F' | 'R' | 'C'): Function {
  const fn = function(require, session, params) {
    // import
    const moment = require('moment')

    // limit/extend to 1 year
    const subqueries = (params.subqueries = params.subqueries || {})
    const year = (subqueries.date ? moment(subqueries.date.from, 'YYYY-MM-DD') : moment()).year()
    const date = (subqueries.date = subqueries.date || {})
    date.from = moment()
      .year(year)
      .startOf('year')
      .format('YYYY-MM-DD')
    date.to = moment()
      .year(year)
      .endOf('year')
      .format('YYYY-MM-DD')

    // AE
    subqueries.moduleType = { value: 'SEA' }
    subqueries.boundType = { value: 'O' }

    // select
    params.fields = ['carrierCode', 'jobMonth', 'shipments']

    // group by
    params.groupBy = ['carrierCode', 'jobMonth']

    switch (type_) {
      case 'F':
        subqueries.nominatedTypeCode = { value: 'F' }
        subqueries.isColoader = { value: 0 }
        break
      case 'R':
        subqueries.nominatedTypeCode = { value: 'R' }
        subqueries.isColoader = { value: 0 }
        break
      case 'C':
        subqueries.isColoader = { value: 1 }
        break
    }

    return params
  }
  let code = fn.toString()
  code = code.replace(new RegExp('type_', 'g'), `'${type_}'`)
  return parseCode(code)
}

// call API
function prepareData(type: 'F' | 'R' | 'C'): InsertJQL {
  return new InsertJQL({
    name: 'shipment',
    columns: ['type', 'carrierCode', 'month', 'shipments'],
    query: new Query({
      $select: [
        new ResultColumn(new Value(type), 'type'),
        new ResultColumn('carrierCode'),
        new ResultColumn(
          new FunctionExpression('MONTHNAME', new ColumnExpression('jobMonth'), 'YYYY-MM'),
          'month'
        ),
        new ResultColumn(
          new FunctionExpression('IFNULL', new ColumnExpression('shipments'), 0),
          'shipments'
        )
      ],
      $from: new FromTable(
        {
          method: 'POST',
          url: 'api/shipment/query/shipment',
          columns: [
            { name: 'carrierCode', type: 'string'},
            { name: 'jobMonth', type: 'string' },
            { name: 'shipments', type: 'number' },
          ],

          data : {
            filter : { carrierCodeIsNotNull : {}}
          }

        },
        'shipment'
      ),
    }),
  })
}

export default [
  // prepare temp table
  new CreateTableJQL(true, 'shipment', [
    new Column('type', 'string'),
    new Column('carrierCode', 'string'),
    new Column('month', 'string'),
    new Column('shipments', 'number'),
  ]),

  // prepare data
  [prepareParams('F'), prepareData('F')],
  [prepareParams('R'), prepareData('R')],
  [prepareParams('C'), prepareData('C')],

  // finalize data
  new Query({
    $select: [
      new ResultColumn('carrierCode'),
      ...months.reduce<ResultColumn[]>((result, month) => {
        result.push(
          ...types.map(
            type =>
              new ResultColumn(
                new FunctionExpression('IFNULL',
                  new FunctionExpression(
                    'FIND',
                    new AndExpressions([
                      new BinaryExpression(new ColumnExpression('month'), '=', month),
                      new BinaryExpression(new ColumnExpression('type'), '=', type.charAt(0)),
                    ]),
                    new ColumnExpression(
                      'shipments'
                    )
                  ),
                  0
                ),
                `${month}-${type}`
              )
          )
        )
        return result
      }, []),
    ],
    $from: 'shipment',
    $group: 'carrierCode',
  })

  // new Query({ $from: 'shipment', $limit: 100 })
]
