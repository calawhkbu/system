import {
  ColumnExpression,
  CreateTableJQL,
  FromTable,
  BetweenExpression,
  FunctionExpression,
  BinaryExpression,
  GroupBy,
  Query,
  ResultColumn,
} from 'node-jql'
import { parseCode } from 'utils/function'
import { Resultset } from 'node-jql-core'

function prepareParams(): Function {
  return function(require, session, params) {
    // import
    const { BadRequestException } = require('@nestjs/common')
    const moment = require('moment')

    // script
    const subqueries = (params.subqueries = params.subqueries || {})

    // set daterange be this year if date is not given
    if (!subqueries.date) {
      const month = moment().month()
      subqueries.date = {}
      subqueries.date.from = moment()
        .month(month)
        .startOf('month')
        .format('YYYY-MM-DD')

      subqueries.date.to = moment()
        .month(month)
        .endOf('month')
        .format('YYYY-MM-DD')
    }

    return params
  }
}

export default [
  new Query({
    $from: new FromTable(
      {
        method: 'POST',
        url: 'api/shipment/query/shipment',
        columns: [
          { name: 'houseNo', type: 'string' },
          { name: 'jobDate', type: 'Date' },
          { name: 'jobNo', type: 'string' },
          { name: 'masterNo', type: 'string' },
          { name: 'bookingNo', type: 'string' },
          { name: 'poNo', type: 'string' },
          { name: 'contractNo', type: 'string' },

          { name: 'moduleType', type: 'string' },
          { name: 'boundType', type: 'string' },
          { name: 'serviceType', type: 'string' },
          { name: 'contractNo', type: 'string' },
        ],
      }, 'shipment'
    )
  })
]
