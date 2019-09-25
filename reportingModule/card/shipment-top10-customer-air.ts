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

  new CreateFunctionJQL('NUMBERIFY', function(parameter: any, value: string) { return +value }, 'number', 'string'),
  new Query({

    $select: [
      new ResultColumn(new ColumnExpression('shipment', 'controllingCustomerPartyCode'), 'controllingCustomer'),
      new ResultColumn(new FunctionExpression('NUMBERIFY', new ColumnExpression('chargeableWeight')), 'chargeableWeight')
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
            name: 'chargeableWeight',
            type: 'string',
          },
        ],

        data: {

          subqueries: {

            moduleType: {
              value: 'AIR'
            }
          },

          fields: ['controllingCustomerPartyCode', 'chargeableWeight'],
          sorting: new OrderBy('chargeableWeight', 'DESC'),
          groupBy: ['controllingCustomerPartyCode'],
          limit: 10

        }

      },
      'shipment'
    )

  })

]
