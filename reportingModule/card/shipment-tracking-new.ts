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

const statusList = ['notInTrack', 'processing', 'cargoReady', 'departure', 'inTransit', 'arrival']

const statusMap = new Map([

  ['notInTrack', 'Not In Track'],
  ['processing', 'Processing'],
  ['cargoReady', 'Cargo Ready'],
  ['departure', 'Departure'],
  ['inTransit', 'In Transit'],
  ['arrival', 'Arrival']

])

function prepareFinalQuery()
{

  const $select = []

  for (const [key, value] of statusMap) {

    $select.push(new ResultColumn(new FunctionExpression('IFNULL', new FunctionExpression('FIND', new BinaryExpression(new ColumnExpression('shipment', 'status'), '=', value), new ColumnExpression('shipment', 'count')), 0), `${key}_count`))

  }

  return new Query({

    $select,
    $from: new FromTable(
      {
        method: 'POST',
        url: 'api/shipment/query/shipment-status',
        columns: [
          {
            name: 'cnt',
            type: 'string',
            $as : 'count'
          },
          {
            name: 'sequenceOrder',
            type: 'string',
            $as : 'order'
          },
          {
            name: 'status',
            type: 'string',
          },
        ],
      },
      'shipment'
    ),
  })
}

export default [
  prepareFinalQuery()
]
