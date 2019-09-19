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

function prepareParams(): Function {
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

    // script
    const subqueries = (params.subqueries = params.subqueries || {})

    // subqueries.fields = ['booking.*', 'booking_popacking.*']

    subqueries.fields = ['bookingId']

    // subqueries.groupBy = ['shipperPartyId']
    // subqueries.sorting = [ new OrderBy('weight', 'DESC') ]
    // subqueries.limit = 9

    return params
  }
}

function prepareTable(name: string): CreateTableJQL {
  return new CreateTableJQL({
    $temporary: true,
    name,
    $as: new Query({
      $select: [
        new ResultColumn(new ColumnExpression(name, 'shipperPartyId')),
        new ResultColumn(new ColumnExpression(name, 'weight')),
      ],
      $from: new FromTable(
        {
          method: 'POST',
          url: 'api/booking/query/booking',
          columns: [
            {
              name: 'weight',
              type: 'number',
            },
            {
              name: 'shipperPartyId',
              type: 'number',
            },

            {
              name: 'shipperPartyName',
              type: 'string',
            },
          ],
        },
        name
      ),
    }),
  })
}

function preparePartyTable(name: string): CreateTableJQL {
  return new CreateTableJQL({
    $temporary: true,
    name,

    $as: new Query({
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
              name: 'type',
              type: 'string',
            },
          ],

          data: {
            fields: ['party_type.*', 'party.*'],
          },
        },
        name
      ),

      $where: new BinaryExpression(new ColumnExpression('type'), '=', 'shipper'),
    }),
  })
}

export default [
  [prepareParams(), prepareTable('tempTable')],

  // [prepareParams(), preparePartyTable('party')],

  new Query({
    $from: 'tempTable',
  }),

  // new Query({
  //   $from: new FromTable(
  //     'tempTable',
  //     'tempTable',
  //     new JoinClause(
  //       'INNER',
  //       new FromTable('party', 'party'),
  //       new BinaryExpression(
  //         new ColumnExpression('tempTable', 'shipperPartyId'),
  //         '=',
  //         new ColumnExpression('party', 'id')
  //       )
  //     )
  //   ),
  // }),
]
