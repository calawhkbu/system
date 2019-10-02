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

import { parseCode } from 'utils/function'

export default [

  new CreateFunctionJQL('NUMBERIFY', function(parameter: any, value: string) { return +value }, 'number', 'string'),
  new Query({

    $select: [
      new ResultColumn(new ColumnExpression('agentPartyName')),
      new ResultColumn(new ColumnExpression('agentPartyCode')),
      new ResultColumn(new FunctionExpression('NUMBERIFY', new ColumnExpression('chargeableWeight')), 'chargeableWeight')
    ],

    $from: new FromTable(
      {
        method: 'POST',
        url: 'api/shipment/query/shipment',
        columns: [

          {
            name: 'agentPartyCode',
            type: 'string',
          },
          {
            name: 'agentPartyName',
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
            },
            boundType: {
              value: 'O'
            }
          },

          fields: ['agentPartyCode', 'agentPartyName', 'chargeableWeight'],

          filter : {
            agentIsNotNull  : {}
          },

          sorting: new OrderBy('chargeableWeight', 'DESC'),
          groupBy: ['agentPartyCode', 'agentPartyName'],
          limit: 10

        }

      },
      'shipment'
    )

  })

]
