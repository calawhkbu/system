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

    params.fields = ['agentPartyCode', 'weight']
    params.groupBy = ['agentPartyCode']

    params.sorting = [new OrderBy('weight', 'DESC')]

    subqueries.agentPartyCodeIsNotNull = {
      value: true,
    }

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
        new ResultColumn(new ColumnExpression(name, 'agentPartyCode'), 'agentPartyCode'),
        new ResultColumn(new ColumnExpression(name, 'weight'), 'weight'),
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
              name: 'agentPartyCode',
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
  [prepareParams(), prepareTop10Table()],

  new Query({
    $from: 'top10',
  }),
]
