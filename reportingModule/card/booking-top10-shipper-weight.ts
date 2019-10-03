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
  IsNullExpression,
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
      IsNullExpression,
      BinaryExpression,
      GroupBy,
      Query,
      ResultColumn,
    } = require('node-jql')
    // import
    const { BadRequestException } = require('@nestjs/common')

    // script
    const subqueries = (params.subqueries = params.subqueries || {})

    params.fields = ['shipperPartyId', 'weightTotal']
    params.groupBy = ['shipperPartyId']

    params.sorting = [new OrderBy('weightTotal', 'DESC')]

    // params.conditions = [

    //   new BinaryExpression(new IsNullExpression(new ColumnExpression('booking', 'shipmentPartyId'), true), '=', false)

    // ]

    params.limit = 10

    return params
  }
}

function prepareTop10Table(): CreateTableJQL {
  const name = 'top10'

  return new CreateTableJQL({
    $temporary: true,
    name,
    $as: new Query({
      $select: [
        new ResultColumn(new ColumnExpression(name, 'shipperPartyId'), 'partyId'),
        new ResultColumn(new ColumnExpression(name, 'weightTotal')),
      ],
      $from: new FromTable(
        {
          method: 'POST',
          url: 'api/booking/query/booking',
          columns: [
            {
              name: 'weightTotal',
              type: 'number',
            },
            {
              name: 'shipperPartyId',
              type: 'string',
            },
          ],
        },
        name
      ),
    }),
  })
}

function preparePartyTable(): CreateTableJQL {
  const name = 'party'
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
  [prepareParams(), prepareTop10Table()],
  preparePartyTable(),

  new Query({
    $select: [
      new ResultColumn(new ColumnExpression('top10', 'weightTotal')),
      new ResultColumn(
        new FunctionExpression(
          'IFNULL',
          new ColumnExpression('party', 'name'),
          new ColumnExpression('top10', 'partyId')
        ),
        'partyName'
      ),
    ],

    $from: new FromTable('top10', {
      operator: 'LEFT',
      table: 'party',
      $on: [
        new BinaryExpression(
          new ColumnExpression('top10', 'partyId'),
          '=',
          new ColumnExpression('party', 'id')
        ),
      ],
    }),
  }),
]
