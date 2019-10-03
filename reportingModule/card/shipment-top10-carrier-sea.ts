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
      new ResultColumn(new ColumnExpression('shipment', 'cbm'), 'cbm'),
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
            name: 'cntCbm',
            type: 'string',

            // rename it as cbm
            $as: 'cbm',
          },
        ],
        data: {
          subqueries: {
            moduleTypeCode: {
              value: 'SEA',
            },
            boundTypeCode: {
              value: 'O',
            },
          },

          filter: {
            carrierCodeIsNotNull: {},
          },

          fields: ['carrierCode', 'cntCbm'],
          sorting: new OrderBy('cntCbm', 'DESC'),
          groupBy: ['carrierCode'],
          limit: 10,
        },
      },

      'shipment'
    ),
  }),
]
