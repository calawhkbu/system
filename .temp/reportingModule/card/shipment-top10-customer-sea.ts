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
      new ResultColumn(new ColumnExpression('controllingCustomerPartyName')),
      new ResultColumn(new ColumnExpression('controllingCustomerPartyCode')),
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
            name: 'controllingCustomerPartyName',
            type: 'string',
          },
          {
            name: 'controllingCustomerPartyCode',
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
            controllingCustomerIsNotNull: {},
          },

          fields: ['controllingCustomerPartyName', 'controllingCustomerPartyCode', 'cbm'],
          sorting: new OrderBy('cbm', 'DESC'),
          groupBy: ['controllingCustomerPartyName', 'controllingCustomerPartyCode'],
          limit: 10,
        },
      },
      'shipment'
    ),
  }),
]
