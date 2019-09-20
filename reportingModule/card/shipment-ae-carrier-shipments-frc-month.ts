import {
  AndExpressions,
  BinaryExpression,
  Column,
  ColumnExpression,
  CreateTableJQL,
  FromTable,
  FunctionExpression,
  InsertJQL,
  Query,
  ResultColumn,
  Value,
} from 'node-jql'
import { parseCode } from 'utils/function'

const months = [
  'Total',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'Auguest',
  'September',
  'Octomber',
  'November',
  'December',
]
const types = ['F', 'R', 'C']

function prepareParams(type_: 'F' | 'R' | 'C'): Function {
  const fn = function(require, session, params) {
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
    subqueries.moduleType = { value: 'AIR' }
    subqueries.boundType = { value: 'O' }

    // select
    params.fields = ['carrierCode', 'jobMonth', 'COUNT(id)']

    // group by
    params.groupBy = ['carrierCode', 'jobMonth']

    switch (type_) {
      case 'F':
        subqueries.nominatedType = { value: 'F' }
        subqueries.isColoader = { value: 0 }
        break
      case 'R':
        subqueries.nominatedType = { value: 'R' }
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
    columns: ['type', 'carrierCode', 'month', 'noOfShipments'],
    query: new Query({
      $select: [
        new ResultColumn(new Value(type), 'type'),
        new ResultColumn('carrierCode'),
        new ResultColumn(
          new FunctionExpression('MONTHNAME', new ColumnExpression('jobMonth'), 'YYYY-MM'),
          'month'
        ),
        new ResultColumn('noOfShipments'),
      ],
      $from: new FromTable(
        {
          method: 'POST',
          url: 'api/shipment/query/shipment',
          columns: [
            { name: 'carrierCode', type: 'string' },
            { name: 'jobMonth', type: 'string' },
            { name: 'COUNT(id)', type: 'number', $as: 'noOfShipments' },
          ],
        },
        'shipment'
      ),
    }),
  })
}

// prepare Total row(s)
function prepareTotal(type: 'F' | 'R' | 'C'): InsertJQL {
  return new InsertJQL({
    name: 'shipment',
    columns: ['type', 'carrierCode', 'month', 'noOfShipments'],
    query: new Query({
      $select: [
        new ResultColumn(new Value(type), 'type'),
        new ResultColumn('carrierCdoe'),
        new ResultColumn(new Value('Total'), 'month'),
        new ResultColumn(
          new FunctionExpression('SUM', new ColumnExpression('noOfShipments')),
          'noOfShipments'
        ),
      ],
      $from: 'shipment',
      $group: 'carrierCode',
      $where: new BinaryExpression(new ColumnExpression('type'), '=', type),
    }),
  })
}

export default [
  // prepare temp table
  new CreateTableJQL(true, 'shipment', [
    new Column('type', 'string'),
    new Column('carrierCode', 'string'),
    new Column('month', 'string'),
    new Column('noOfShipments', 'number'),
  ]),

  // prepare data
  [prepareParams('F'), prepareData('F')],
  prepareTotal('F'),
  [prepareParams('R'), prepareData('R')],
  prepareTotal('R'),
  [prepareParams('C'), prepareData('C')],
  prepareTotal('C'),

  // finalize data
  new Query({
    $select: [
      new ResultColumn('carrierCode'),
      ...months.reduce<ResultColumn[]>((result, month) => {
        result.push(
          ...types.map(
            type =>
              new ResultColumn(
                new FunctionExpression(
                  'FIND',
                  new AndExpressions([
                    new BinaryExpression(new ColumnExpression('month'), '=', month),
                    new BinaryExpression(new ColumnExpression('type'), '=', type.charAt(0)),
                  ]),
                  new ColumnExpression('noOfShipments')
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
  }),
]
