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
const types = ['cbm', 'shipments']

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

    // SE
    subqueries.moduleTypeCode = { value: ['SEA'] }
    subqueries.boundTypeCode = { value: ['O'] }

    // select
    params.fields = ['carrierCode', 'jobMonth', 'cntCbm', 'shipments']

    // group by
    params.groupBy = ['carrierCode', 'jobMonth']

    return params
  }
}

function prepareTable(): CreateTableJQL {

  return new CreateTableJQL({
    $temporary: true,
    name: 'shipment',
    $as: new Query({
      $select: [
        new ResultColumn('carrierCode'),
        new ResultColumn(
          new FunctionExpression('MONTHNAME', new ColumnExpression('jobMonth'), 'YYYY-MM'),
          'month'
        ),
        new ResultColumn('cbm'),
        new ResultColumn('shipments'),
      ],
      $from: new FromTable(
        {
          method: 'POST',
          url: 'api/shipment/query/shipment',
          columns: [
            { name: 'carrierCode', type: 'string' },
            { name: 'jobMonth', type: 'string' },
            { name: 'cntCbm', type: 'number', $as : 'cbm'},
            { name: 'shipments', type: 'number' },
          ],

          data: {

            filter: { carrierCodeIsNotNull: {} },

          }
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
      new ResultColumn('carrierCode'),
      ...months.reduce<ResultColumn[]>((result, month) => {
        result.push(
          ...types.map(
            type =>
              new ResultColumn(
                new FunctionExpression('IFNULL',
                  new FunctionExpression(
                    'FIND',
                    new BinaryExpression(new ColumnExpression('month'), '=', month),
                    new ColumnExpression(
                      type === 'cbm' ? 'cbm' : 'shipments'
                    )
                  ), 0),

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
