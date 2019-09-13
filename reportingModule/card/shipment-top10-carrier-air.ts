import {
  ColumnExpression,
  CreateTableJQL,
  FromTable,
  FunctionExpression,
  GroupBy,
  Query,
  ResultColumn,
  OrderBy,
  JoinClause,
  BinaryExpression,
} from 'node-jql'

import { parseCode } from 'utils/function'

function prepareTop10Params(): Function {
  return function(require, session, params) {
    // import
    const { BadRequestException } = require('@nestjs/common')

    const moment = require('moment')

    // script
    const subqueries = (params.subqueries = params.subqueries || {})

    // set daterange be this year if date is not given

    console.log('before')
    console.log(params)

    if (!subqueries.date) {
      const year = moment().year()
      subqueries.date = {}
      subqueries.date.from = moment()
        .year(year)
        .startOf('year')
        .format('YYYY-MM-DD')

      subqueries.date.to = moment()
        .year(year)
        .endOf('year')
        .format('YYYY-MM-DD')
    }

    subqueries.moduleType = {
      value: 'AIR',
    }

    return params
  }
}

function prepareTop10table(): CreateTableJQL {
  return new CreateTableJQL({
    $temporary: true,

    name: 'top10',
    $as: new Query({
      $select: [
        new ResultColumn(new ColumnExpression('shipment', 'carrierCode')),

        new ResultColumn(
          new FunctionExpression(
            'IFNULL',
            new FunctionExpression('SUM', new ColumnExpression('shipment', 'chargeableWeight')),
            0
          ),
          'totalChargeableWeight'
        ),
      ],
      $from: new FromTable(
        {
          method: 'POST',
          url: 'api/shipment/query/shipment',
          columns: [
            {
              name: 'carrierCode',
              type: 'string',
            },
            {
              name: 'chargeableWeight',
              type: 'number',
            },
          ],
        },
        'shipment'
      ),

      $group: new GroupBy([new ColumnExpression('shipment', 'carrierCode')]),

      $order: [new OrderBy(new ColumnExpression('totalChargeableWeight'), 'DESC')],

      $limit: 10,
    }),
  })
}

export default [
  [prepareTop10Params(), prepareTop10table()],

  new Query({
    $from: 'top10',

    // $order: [new OrderBy(new ColumnExpression('top10', 'totalChargeableWeight'), 'DESC')],

    // $limit : 10
  }),
]
