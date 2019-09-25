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

  new CreateFunctionJQL('NUMBERIFY', function(parameter: any, value: string) { return +value }, 'number', 'string'),

  new Query({

    $select: [
      new ResultColumn(new ColumnExpression('shipment', 'controllingCustomerPartyCode'), 'controllingCustomer'),
      new ResultColumn(new FunctionExpression('NUMBERIFY', new ColumnExpression('shipment', 'cbm')), 'cbm')
    ],

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
            name: 'cntCbm',
            type: 'string',
            $as : 'cbm'

          },
        ],

        data: {

          subqueries: {

            moduleType: {
              value: 'SEA'
            }
          },

          fields: ['controllingCustomerPartyCode', 'cntCbm'],
          sorting: new OrderBy('cntCbm', 'DESC'),
          groupBy: ['controllingCustomerPartyCode'],
          limit: 10

        }

      },
      'shipment'
    )

  })

]
