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

function prepareParams(): Function {
  return function(require, session, params) {
    // import
    const { BadRequestException } = require('@nestjs/common')
    const moment = require('moment')

    // script
    const subqueries = params.subqueries || {}
    console.log(subqueries)
    if (!subqueries.statusList || !subqueries.statusList.value) throw new BadRequestException('MISSING_STATUS_LIST')

    // subqueries.statusList = ['notInTrack', 'cargoReady', 'departure', 'inTransit', 'arrival']
    // subqueries.statusList = ['notInTrack', 'processing', 'cargoReady', 'departure', 'inTransit', 'arrival']

    return params
  }
}

function prepareFinalQuery() {

  return function(require, session, params) {

    const subqueries = params.subqueries || {}
    const statusList = subqueries.statusList.value

    const $select = []

    statusList.map(status => {

      $select.push(
        new ResultColumn(
          new FunctionExpression(
            'IFNULL',
            new FunctionExpression(
              'FIND',
              new BinaryExpression(new ColumnExpression('shipment', 'status'), '=', status),
              new ColumnExpression('shipment', 'count')
            ),
            0
          ),
          `${status}_count`
        )
      )

    })

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
              $as: 'count',
            },
            {
              name: 'sequenceOrder',
              type: 'string',
              $as: 'order',
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
}

export default [

  [prepareParams(), prepareFinalQuery()]

]
