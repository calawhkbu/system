import {
  ColumnExpression,
  CreateTableJQL,
  FromTable,
  InExpression,
  BetweenExpression,
  FunctionExpression,
  BinaryExpression,
  GroupBy,
  Query,
  ResultColumn,
} from 'node-jql'
import { parseCode } from 'utils/function'

function prepareShipmentParams(): Function {
  const fn = async function(require, session, params) {
    const { Resultset } = require('node-jql-core')
    const {
      ColumnExpression,
      CreateTableJQL,
      FromTable,
      InExpression,
      BetweenExpression,
      FunctionExpression,
      BinaryExpression,
      GroupBy,
      Query,
      ResultColumn,
    } = require('node-jql')

    // import
    const { BadRequestException } = require('@nestjs/common')
    const moment = require('moment')

    // script
    const subqueries = (params.subqueries = params.subqueries || {})

    // get the primaryKeyList
    if (!subqueries.primaryKeyListString && subqueries.primaryKeyListString !== '')
      throw new BadRequestException('MISSING_primaryKeyListString')

    const primaryKeyList = subqueries.primaryKeyListString.value.split(',')

    subqueries.primaryKeyList = {
      value: primaryKeyList,
    }

    params.fields = [
      'houseNo',
      'shipperPartyName',
      'consigneePartyName',
      'portOfLoading',
      'portOfDischarge',
      'estimatedDepartureDate',
      'estimatedArrivalDate'
    ]

    return params
  }

  const code = fn.toString()
  return parseCode(code)
}

function prepareShipmentable(name: string): CreateTableJQL {
  return new CreateTableJQL({
    $temporary: true,
    name,
    $as: new Query({
      $select: [
        new ResultColumn(new ColumnExpression(name, 'houseNo')),
        new ResultColumn(new ColumnExpression(name, 'shipperPartyName'), 'shipper'),
        new ResultColumn(new ColumnExpression(name, 'consigneePartyName'), 'consignee'),
        new ResultColumn(new ColumnExpression(name, 'portOfLoadingCode'), 'portOfLoading'),
        new ResultColumn(new ColumnExpression(name, 'portOfDischargeCode'), 'portOfDischarge'),
        new ResultColumn(new ColumnExpression(name, 'departureDateEstimated')),
        new ResultColumn(new ColumnExpression(name, 'arrivalDateEstimated')),
      ],

      $from: new FromTable(
        {
          method: 'POST',
          url: 'api/shipment/query/shipment',
          columns: [

            { name: 'houseNo', type: 'string' },
            { name: 'shipperPartyName', type: 'string' },
            { name: 'consigneePartyName', type: 'string'},
            { name: 'portOfLoadingCode', type: 'string' },
            { name: 'portOfDischargeCode', type: 'string' },
            { name: 'departureDateEstimated', type: 'Date' },
            { name: 'arrivalDateEstimated', type: 'Date' },

          ],
        },
        name
      ),
    }),
  })
}

export default [
  [prepareShipmentParams(), prepareShipmentable('shipment')],

  new Query({
    $from: 'shipment',
  }),
]
