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

    const { Resultset } = require('node-jql-core')
    const {

      OrderBy,
      ColumnExpression,
      CreateTableJQL,
      InsertJQL,
      FromTable,
      InExpression,
      BetweenExpression,
      FunctionExpression,
      BinaryExpression,
      GroupBy,
      Query,
      ResultColumn,
    } = require('node-jql')

    // import
    const { BadRequestException } = require('@nestjs/common')
    const moment = require('moment')
    // script
    const subqueries = (params.subqueries = params.subqueries || {})

    // set daterange be this year if date is not given
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
      value: 'AIR'
    }

    params.fields = ['carrierCode', 'chargeableWeightTotal']

    params.sorting = new OrderBy('chargeableWeightTotal', 'DESC')

    params.groupBy = ['carrierCode']
    params.limit = 10

    return params
  }

}

function prepareTop10table(): CreateTableJQL {

  return new CreateTableJQL({

    $temporary: true,
    name: 'top10',

    $as: new Query({

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
              name: 'chargeableWeightTotal',
              type: 'number',
            },
          ],

        },
        'shipment'
      ),

    })

  })
}

export default [
  [prepareTop10Params(), prepareTop10table()],

  new Query({

    $from: 'top10',

  })
]
