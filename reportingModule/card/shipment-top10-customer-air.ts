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

    params.fields = ['controllingCustomerPartyCode', 'chargeableWeightTotal']

    params.sorting = new OrderBy('chargeableWeightTotal', 'DESC')

    params.groupBy = ['controllingCustomerPartyCode']
    params.limit = 10

    return params
  }

}

function preparePartyParams(): Function {
  return async function(require, session, params) {
    const { Resultset } = require('node-jql-core')
    const {
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
    const moment = require('moment')

    const top10Result = new Resultset(await session.query(new Query('top10'))).toArray()

    // script
    const subqueries = (params.subqueries = params.subqueries || {})

    return params
  }
}

// table for getting party
function preparePartyTable(): Function {
  return function(require, session, params) {
    const { Resultset } = require('node-jql-core')
    const {
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
    const moment = require('moment')

    return new CreateTableJQL({
      $temporary: true,

      name: 'party',
      $as: new Query({
        $select: [
          new ResultColumn(new ColumnExpression('party', 'id')),
          new ResultColumn(new ColumnExpression('party', 'name')),
          new ResultColumn(new ColumnExpression('party', 'erpCode')),
        ],
        $from: new FromTable(
          {
            method: 'POST',
            url: 'api/party/query/party',
            columns: [
              {
                name: 'id',
                type: 'number',
              },

              {
                name: 'name',
                type: 'string',
              },

              {
                name: 'thirdPartyCode',
                type: 'string',
              },

              {
                name: 'erpCode',
                type: 'string',
              },
            ],

            data: {
              subqueries: {
                erpCode: true,
              },
              // include jobMonth from the table
              fields: ['erpCode', 'party.*'],
            },
          },
          'party'
        ),
      }),
    })
  }
}

function prepareTop10Table() {

  return new CreateTableJQL({

    $temporary: true,
    name: 'test',

    $as: new Query({

      $from: new FromTable(
        {
          method: 'POST',
          url: 'api/shipment/query/shipment',
          columns: [

            {
              name: 'controllingCustomerPartyCode',
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
  [prepareTop10Params(), prepareTop10Table()],
  [preparePartyParams(), preparePartyTable()],

  new Query({
    $select: [
      new ResultColumn(new ColumnExpression('top10', 'chargeableWeightTotal')),
      new ResultColumn(
        new FunctionExpression(
          'IFNULL',
          new ColumnExpression('party', 'name'),
          new ColumnExpression('top10', 'controllingCustomerPartyCode')
        ),
        'partyName'
      ),
    ],

    $from: new FromTable('top10', {
      operator: 'LEFT',
      table: 'party',
      $on: [
        new BinaryExpression(
          new ColumnExpression('top10', 'controllingCustomerPartyCode'),
          '=',
          new ColumnExpression('party', 'erpCode')
        ),
      ],
    }),
  }),
]
