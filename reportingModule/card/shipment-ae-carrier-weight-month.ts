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
} from 'node-jql'

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
const types = ['GW', 'CW']

export default [
  [
    // process params
    function(require, session, params) {
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
      params.fields = ['carrierCode', 'jobMonth', 'SUM(grossWeight)', 'SUM(chargeableWeight)']

      // group by
      params.groupBy = ['carrierCode', 'jobMonth']

      return params
    },
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
              { name: 'SUM(grossWeight)', type: 'number', $as: 'grossWeight' },
              { name: 'SUM(chargeableWeight)', type: 'number', $as: 'chargeableWeight' },
            ],
          },
          'shipment'
        ),
      }),
    })
  ],

  // prepare total column
  new InsertJQL({
    name: 'shipment',
    columns: ['carrierCode', 'month', 'grossWeight', 'chargeableWeight'],
    query: new Query({
      $select: [
        new ResultColumn('carrierCode'),
        new ResultColumn(new Value('Total'), 'month'),
        new ResultColumn(
          new FunctionExpression(
            'IFNULL',
            new FunctionExpression('SUM', new ColumnExpression('grossWeight')),
            0
          ),
          'grossWeight'
        ),
        new ResultColumn(
          new FunctionExpression(
            'IFNULL',
            new FunctionExpression('SUM', new ColumnExpression('chargeableWeight')),
            0
          ),
          'chargeableWeight'
        ),
      ],
      $from: 'shipment',
      $group: 'carrierCode',
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
                new FunctionExpression(
                  'FIND',
                  new BinaryExpression(new ColumnExpression('month'), '=', month),
                  new ColumnExpression(
                    type.substr(2, 2) === 'GW' ? 'grossWeight' : 'chargeableWeight'
                  )
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
