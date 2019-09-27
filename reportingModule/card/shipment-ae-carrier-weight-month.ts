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
  'Total',
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

export default [
  // create temp table
  new CreateTableJQL({
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

            fields: ['carrierCode', 'jobMonth', 'grossWeight', 'chargeableWeight'],

            filter: { carrierCodeIsNotNull: {} },

            groupBy: ['carrierCode', 'jobMonth'],

            subqueries: {
              moduleType: { value: 'AIR' },
              boundType: { value: 'O' }
            }

          }
        },
        'shipment'
      ),
    }),
  }),

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
                      type.substr(2, 2) === 'GW' ? 'grossWeight' : 'chargeableWeight'
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
