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
  Column,
  InsertJQL,
  LimitOffset,
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

    params.fields = ['agentPartyId', 'volumeTotal']
    params.groupBy = ['agentPartyId']

    params.sorting = [new OrderBy('volumeTotal', 'DESC')]

    subqueries.agentPartyIdIsNotNull = {
      value: true,
    }

    params.limit = 10

    return params
  }
}

function createTable() {
  return new CreateTableJQL(true, 'top10', [
    new Column('agentPartyId', 'string'),
    new Column('volumeTotal', 'number'),
  ])
}

function prepareData(type: 'top10' | 'other' | 'test')
{

  const bigLimit = 999999999999999999

  if (type === 'test')
  {

    return new InsertJQL('top10', { agentPartyId : 'other', volumeTotal : 999 })

  }

  if (type === 'other' )
  {
    return new InsertJQL({
      name: 'top10',
      columns: ['agentPartyId', 'volumeTotal'],

      query: new Query({
        $from: 'raw',
        $limit: new LimitOffset(bigLimit, 10),
      }),
    })
  }

  return new InsertJQL({
    name: 'top10',
    columns: ['agentPartyId', 'volumeTotal'],

    query: new Query({
      $from: 'raw',
      $where: new IsNullExpression(new ColumnExpression('raw', 'agentPartyId'), true),
      $limit: 10,
    }),
  })
}

function prepareRawTable(): CreateTableJQL {
  const name = 'raw'
  return new CreateTableJQL({
    $temporary: true,
    name,
    $as: new Query({
      $select: [
        new ResultColumn(new ColumnExpression(name, 'agentPartyId'), 'agentPartyId'),
        new ResultColumn(new ColumnExpression(name, 'volumeTotal'), 'volume'),
      ],

      $from: new FromTable(
        {
          method: 'POST',
          url: 'api/booking/query/booking',
          columns: [
            {
              name: 'volumeTotal',
              type: 'number',
            },

            {
              name: 'agentPartyId',
              type: 'string',
            },
          ],
        },
        name
      ),
    }),
  })
}

export default [
  [prepareParams(), prepareRawTable()],

  // new Query({

  //   $from : 'raw'
  // })

  createTable(),
  prepareData('top10'),
  prepareData('other'),
  prepareData('test'),

  new Query({
    $from: 'top10',
  }),
]
