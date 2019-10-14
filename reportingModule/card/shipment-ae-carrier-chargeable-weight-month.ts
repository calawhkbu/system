import {
  AndExpressions,
  BinaryExpression,
  ColumnExpression,
  CreateTableJQL,
  FromTable,
  FunctionExpression,
  InsertJQL,
  Value,
  Query,
  ResultColumn,
  Column,
  GroupBy,
  OrderBy,
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
const types = ['CW', 'shipments']

function prepareParams(): Function {

  return function(require, session, params) {
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
    subqueries.moduleTypeCode = { value: ['AIR'] }
    subqueries.boundTypeCode = { value: ['O'] }

    // select
    params.fields = ['carrierCode', 'carrierName', 'jobMonth', 'chargeableWeight', 'shipments']

    // group by
    params.groupBy = ['carrierCode', 'carrierName', 'jobMonth']

    return params
  }
}

function prepareTable(): CreateTableJQL {

  const tableName = 'final'

  return new CreateTableJQL({
    $temporary: true,
    name: tableName,
    $as: new Query({
      $select: [
        new ResultColumn(new ColumnExpression('carrierCode')),
        new ResultColumn(new ColumnExpression('carrierName')),
        new ResultColumn(
          new FunctionExpression('MONTHNAME', new ColumnExpression('jobMonth'), 'YYYY-MM'),
          'month'
        ),
        new ResultColumn('chargeableWeight'),
        new ResultColumn('shipments'),
      ],
      $from: new FromTable(
        {
          method: 'POST',
          url: 'api/shipment/query/shipment',
          columns: [

            { name: 'carrierName', type: 'string' },
            { name: 'carrierCode', type: 'string' },
            { name: 'jobMonth', type: 'string' },
            { name: 'chargeableWeight', type: 'number' },
            { name: 'shipments', type: 'number' },
          ],

          data: {
            filter: { carrierCodeIsNotNull: {} },
          },
        },
        'shipment'
      ),
    }),
  })
}

export default [
  [prepareParams(), prepareTable()],

  // finalize data
  new Query({
    $select: [
      new ResultColumn(new ColumnExpression('carrierCode')),
      new ResultColumn(new ColumnExpression('carrierName')),
      ...months.reduce<ResultColumn[]>((result, month) => {
        result.push(
          ...types.map(
            type =>
              new ResultColumn(
                new FunctionExpression(
                  'IFNULL',
                  new FunctionExpression(
                    'FIND',
                    new BinaryExpression(new ColumnExpression('month'), '=', month),
                    new ColumnExpression(type === 'CW' ? 'chargeableWeight' : 'shipments')
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
    $from: 'final',
    $group: new GroupBy(new ColumnExpression('carrierCode')),
    $order : new OrderBy(new ColumnExpression('final', 'carrierName'), 'ASC')
  })

]
