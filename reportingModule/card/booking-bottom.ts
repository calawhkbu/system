import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceQuery: ['booking', 'booking'],
      onResult(res): any[] {
        return res.map(row => {
          return {
            id: row.bookingId,
            moduleTypeCode: row.moduleTypeCode,
            bookingNo: row.bookingNo,
            shipperPartyName: row.shipperPartyName,
            consigneePartyName: row.consigneePartyName,
            portOfLoadingCode: row.portOfLoadingCode,
            portOfDischargeCode: row.portOfDischargeCode,
            departureDateEstimated: row.departureDateEstimated,
            arrivalDateEstimated: row.arrivalDateEstimated,
          }
        })
      }
    }
  ]
} as JqlDefinition

/* import {
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

function prepareBookingParams(): Function {
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
    const { moment } = params.packages

    // script
    const subqueries = (params.subqueries = params.subqueries || {})

    return params
  }

  const code = fn.toString()
  return parseCode(code)
}

function prepareBookingable(name: string): CreateTableJQL {
  return new CreateTableJQL({
    $temporary: true,
    name,
    $as: new Query({
      $select: [
        new ResultColumn(new ColumnExpression(name, 'id')),
        new ResultColumn(new ColumnExpression(name, 'moduleTypeCode')),
        new ResultColumn(new ColumnExpression(name, 'bookingNo')),
        new ResultColumn(new ColumnExpression(name, 'shipperPartyName')),
        new ResultColumn(new ColumnExpression(name, 'consigneePartyName')),
        new ResultColumn(new ColumnExpression(name, 'portOfLoadingCode')),
        new ResultColumn(new ColumnExpression(name, 'portOfDischargeCode')),
        new ResultColumn(new ColumnExpression(name, 'departureDateEstimated')),
        new ResultColumn(new ColumnExpression(name, 'arrivalDateEstimated')),
      ],

      $from: new FromTable(
        {
          method: 'POST',
          url: 'api/booking/query/booking',
          columns: [
            { name: 'bookingId', type: 'number', $as: 'id' },
            { name: 'moduleTypeCode', type: 'string' },
            { name: 'bookingNo', type: 'string' },
            { name: 'shipperPartyName', type: 'string' },
            { name: 'consigneePartyName', type: 'string' },
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
  [prepareBookingParams(), prepareBookingable('booking')],

  new Query({
    $from: 'booking',
  }),
] */
