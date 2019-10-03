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
  CreateFunctionJQL,
  IsNullExpression,
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
        new FunctionExpression('NUMBERIFY', new ColumnExpression('chargeableWeight')),
        'chargeableWeight'
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
            name: 'chargeableWeight',
            type: 'string',
          },
        ],

        data: {
          subqueries: {
            moduleType: {
              value: 'AIR',
            },
            boundType: {
              value: 'O',
            },
          },

          filter: {
            controllingCustomerIsNotNull: {},
          },

          fields: [
            'controllingCustomerPartyName',
            'controllingCustomerPartyCode',
            'chargeableWeight',
          ],
          sorting: new OrderBy('chargeableWeight', 'DESC'),
          groupBy: ['controllingCustomerPartyName', 'controllingCustomerPartyCode'],
          limit: 10,
        },
      },
      'shipment'
    ),
  }),
]
