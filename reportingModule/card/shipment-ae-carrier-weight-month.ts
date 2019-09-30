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
const types = ['GW', 'CW']

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
    subqueries.moduleType = { value: 'AIR' }
    subqueries.boundType = { value: 'O' }

    // select
    params.fields = ['carrierCode', 'jobMonth', 'grossWeight', 'chargeableWeight']

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
        new ResultColumn('grossWeight'),
        new ResultColumn('chargeableWeight'),
      ],
      $from: new FromTable(
        {
          method: 'POST',
          url: 'api/shipment/query/shipment',
          columns: [
            { name: 'carrierCode', type: 'string' },
            { name: 'jobMonth', type: 'string' },
            { name: 'grossWeight', type: 'number' },
            { name: 'chargeableWeight', type: 'number' },
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
                      type === 'GW' ? 'grossWeight' : 'chargeableWeight'
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
