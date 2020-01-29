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
    const moment = require('moment')

    // script
    const subqueries = (params.subqueries = params.subqueries || {})

    if (subqueries.alertType) {
      if (!(subqueries.alertType.value && subqueries.alertType.value.length) )
        throw new Error('MISSING_alertType')

        subqueries.alertJoin = true
    }
    return params
  }

  const code = fn.toString()
  return parseCode(code)
}

const query = new Query({

  $select: [
    new ResultColumn(new ColumnExpression('booking', 'id')),
    new ResultColumn(new ColumnExpression('booking', 'bookingNo')),
    new ResultColumn(new ColumnExpression('booking', 'shipperPartyName')),
    new ResultColumn(new ColumnExpression('booking', 'consigneePartyName')),
    new ResultColumn(new ColumnExpression('booking', 'portOfLoadingCode')),
    new ResultColumn(new ColumnExpression('booking', 'portOfDischargeCode')),
    new ResultColumn(new ColumnExpression('booking', 'departureDateEstimated')),
    new ResultColumn(new ColumnExpression('booking', 'arrivalDateEstimated')),
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
    'booking'
  ),

})

// function prepareBookingable(name: string): CreateTableJQL {
//   return new CreateTableJQL({
//     $temporary: true,
//     name,
//     $as: new Query({
//       $select: [
//         new ResultColumn(new ColumnExpression(name, 'id')),
//         new ResultColumn(new ColumnExpression(name, 'moduleTypeCode')),
//         new ResultColumn(new ColumnExpression(name, 'bookingNo')),
//         new ResultColumn(new ColumnExpression(name, 'shipperPartyName')),
//         new ResultColumn(new ColumnExpression(name, 'consigneePartyName')),
//         new ResultColumn(new ColumnExpression(name, 'portOfLoadingCode')),
//         new ResultColumn(new ColumnExpression(name, 'portOfDischargeCode')),
//         new ResultColumn(new ColumnExpression(name, 'departureDateEstimated')),
//         new ResultColumn(new ColumnExpression(name, 'arrivalDateEstimated')),
//       ],

//       $from: new FromTable(
//         {
//           method: 'POST',
//           url: 'api/booking/query/booking',
//           columns: [
//             { name: 'bookingId', type: 'number', $as: 'id' },
//             { name: 'moduleTypeCode', type: 'string' },
//             { name: 'bookingNo', type: 'string' },
//             { name: 'shipperPartyName', type: 'string' },
//             { name: 'consigneePartyName', type: 'string' },
//             { name: 'portOfLoadingCode', type: 'string' },
//             { name: 'portOfDischargeCode', type: 'string' },
//             { name: 'departureDateEstimated', type: 'Date' },
//             { name: 'arrivalDateEstimated', type: 'Date' },
//           ],
//         },
//         name
//       ),
//     }),
//   })
// }

export default [
  // [prepareBookingParams(), prepareBookingable('booking')],
  // new Query({
  //   $from: 'booking',
  // }),

  [prepareBookingParams(), query],

]
