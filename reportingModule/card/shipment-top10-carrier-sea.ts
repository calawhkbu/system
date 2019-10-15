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
      new ResultColumn(new ColumnExpression('carrierCode')),
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
            name: 'carrierCode',
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
            carrierCodeIsNotNull: {},
          },

          fields: ['carrierCode', 'cbm'],
          sorting: new OrderBy('cbm', 'DESC'),
          groupBy: ['carrierCode'],
          limit: 10,
        },
      },

      'shipment'
    ),
  }),
]
