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
  CreateFunctionJQL,
} from 'node-jql'

export default [
  new CreateFunctionJQL(
    'NUMBERIFY',
    function(parameter: any, value: string) {
      return +value
    },
    'number',
    'string'
  ),

  new Query({
    $select: [
      new ResultColumn(new ColumnExpression('agentPartyName')),
      new ResultColumn(new ColumnExpression('agentPartyCode')),
      new ResultColumn(
        new FunctionExpression('NUMBERIFY', new ColumnExpression('shipment', 'cbm')),
        'cbm'
      ),
    ],

    $from: new FromTable(
      {
        method: 'POST',
        url: 'api/shipment/query/shipment',
        columns: [
          {
            name: 'agentPartyName',
            type: 'string',
          },
          {
            name: 'agentPartyCode',
            type: 'string',
          },
          {
            name: 'cbm',
            type: 'string',
          },
        ],

        data: {
          subqueries: {
            moduleTypeCode: {
              value: ['SEA'],
            },
            boundTypeCode: {
              value: ['O'],
            },
          },

          filter: {
            agentIsNotNull: {},
          },

          fields: ['agentPartyName', 'agentPartyCode', 'cbm'],
          sorting: new OrderBy('cbm', 'DESC'),
          groupBy: ['agentPartyCode', 'agentPartyName'],
          limit: 10,
        },
      },
      'shipment'
    ),
  }),
]
