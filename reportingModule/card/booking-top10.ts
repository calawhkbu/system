import { CreateFunctionJQL, Query } from 'node-jql'

import { parseCode } from 'utils/function'

function prepareParams(): Function {
  const fn = function(require, session, params) {
    const { OrderBy } = require('node-jql')
    const { BadRequestException } = require('@nestjs/common')

    const subqueries = (params.subqueries = params.subqueries || {})

    // warning cannot display from frontend
    if (!subqueries.xAxis) throw new BadRequestException('MISSING_xAxis')
    if (!subqueries.yAxis) throw new BadRequestException('MISSING_yAxis')

    // most important part of this card
    // dynamically choose the fields and summary value

    const xAxis = subqueries.xAxis.value
    const summaryColumnName = subqueries.yAxis.value

    const codeColumnName = xAxis === 'carrier' ? `carrierCode` : `${xAxis}PartyId`
    const nameColumnName = xAxis === 'carrier' ? `carrierName` : `${xAxis}PartyName`

      // ------------------------------
    ;(params.sorting = new OrderBy(summaryColumnName, 'DESC')),
      // select
      (params.fields = [codeColumnName, summaryColumnName, nameColumnName])
    params.groupBy = [codeColumnName, nameColumnName]

    return params
  }

  const code = fn.toString()
  return parseCode(code)
}

function createTop10Table() {
  const fn = function(require, session, params) {
    const { CreateTableJQL } = require('node-jql')

    const subqueries = (params.subqueries = params.subqueries || {})

    const xAxis = subqueries.xAxis.value // should be shipper/consignee/agent/controllingCustomer/carrier
    const summaryColumnName = subqueries.yAxis.value // should be chargeableWeight/cbm/grossWeight/totalShipment

    const codeColumnName = xAxis === 'carrier' ? `carrierCode` : `${xAxis}PartyId`
    const nameColumnName = xAxis === 'carrier' ? `carrierName` : `${xAxis}PartyName`

    // ------------------------------

    return new CreateTableJQL({
      $temporary: true,
      name: 'top10',
      columns: [
        {
          name: codeColumnName,
          type: 'string',
        },

        {
          name: nameColumnName,
          type: 'string',
        },
        {
          name: summaryColumnName,
          type: 'number',
        },
      ],
    })
  }

  const code = fn.toString()
  return parseCode(code)
}

function insertTop10Data() {
  const fn = async function(require, session, params) {
    const { Resultset } = require('node-jql-core')
    const { InsertJQL, Query } = require('node-jql')

    const subqueries = (params.subqueries = params.subqueries || {})

    const xAxis = subqueries.xAxis.value
    const summaryColumnName = subqueries.yAxis.value

    const codeColumnName = xAxis === 'carrier' ? `carrierCode` : `${xAxis}PartyId`
    const nameColumnName = xAxis === 'carrier' ? `carrierName` : `${xAxis}PartyName`

    const showOther = subqueries.showOther || false
    const topX = subqueries.topX.value

    // ------------------------------

    const bookings = new Resultset(await session.query(new Query('raw'))).toArray() as any[]

    if (!(bookings && bookings.length)) {
      throw new Error('NO_DATA')
    }

    const top10BookingList = bookings.filter(x => x[codeColumnName]).slice(0, topX)

    if (showOther) {
      // use the code of the top10 to find the rest
      const top10BookingCodeList = top10BookingList.map(x => x[codeColumnName])
      const otherBookingList = bookings.filter(
        x => !top10BookingCodeList.includes(x[codeColumnName])
      )

      // sum up all the other
      const otherSum = otherBookingList.reduce((accumulator, currentValue, currentIndex, array) => {
        return accumulator + currentValue[summaryColumnName]
      }, 0)

      // compose the record for other
      const otherResult = {}
      otherResult[codeColumnName] = 'other'
      otherResult[nameColumnName] = 'other'
      otherResult[summaryColumnName] = otherSum

      top10BookingList.push(otherResult)
    }

    return new InsertJQL('top10', ...top10BookingList)
  }

  const code = fn.toString()
  return parseCode(code)
}

function prepareRawTable() {
  const fn = function(require, session, params) {
    const {
      CreateTableJQL,
      ResultColumn,
      FromTable,
      ColumnExpression,
      Query,
      FunctionExpression,
      OrderBy,
    } = require('node-jql')

    const subqueries = (params.subqueries = params.subqueries || {})

    const xAxis = subqueries.xAxis.value // should be shipper/consignee/agent/controllingCustomer/carrier
    const summaryColumnName = subqueries.yAxis.value // should be chargeableWeight/cbm/grossWeight/totalShipment

    const codeColumnName = xAxis === 'carrier' ? `carrierCode` : `${xAxis}PartyId`
    const nameColumnName = xAxis === 'carrier' ? `carrierName` : `${xAxis}PartyName`

    // ------------------------------

    return new CreateTableJQL({
      $temporary: true,
      name: 'raw',

      $as: new Query({
        $select: [
          new ResultColumn(new ColumnExpression(codeColumnName)),
          new ResultColumn(new ColumnExpression(nameColumnName)),
          new ResultColumn(
            new FunctionExpression('NUMBERIFY', new ColumnExpression(summaryColumnName)),
            summaryColumnName
          ),
        ],

        $from: new FromTable(
          {
            method: 'POST',
            url: 'api/booking/query/booking',
            columns: [
              {
                name: codeColumnName,
                type: 'string',
              },
              {
                name: nameColumnName,
                type: 'string',
              },
              {
                name: summaryColumnName,
                type: 'string',
              },
            ],
          },
          'booking'
        ),
      }),
    })
  }

  const code = fn.toString()
  return parseCode(code)
}

function finalQuery() {
  const fn = function(require, session, params) {
    const { ResultColumn, ColumnExpression, Query, Value } = require('node-jql')

    const subqueries = (params.subqueries = params.subqueries || {})

    const xAxis = subqueries.xAxis.value // should be shipper/consignee/agent/controllingCustomer/carrier
    const summaryColumnName = subqueries.yAxis.value // should be chargeableWeight/cbm/grossWeight/totalShipment

    const codeColumnName = xAxis === 'carrier' ? `carrierCode` : `${xAxis}PartyId`
    const nameColumnName = xAxis === 'carrier' ? `carrierName` : `${xAxis}PartyName`

    // ------------------------------

    return new Query({
      $select: [
        new ResultColumn(new ColumnExpression(codeColumnName), 'code'),
        new ResultColumn(new ColumnExpression(nameColumnName), 'name'),
        new ResultColumn(new ColumnExpression(summaryColumnName), 'summary'),
        new ResultColumn(new Value(xAxis), 'xAxis'),
        new ResultColumn(new Value(summaryColumnName), 'yAxis'),
      ],

      $from: 'top10',
    })
  }

  const code = fn.toString()
  return parseCode(code)
}

function createNumerifyFunction() {
  return new CreateFunctionJQL(
    'NUMBERIFY',
    function(parameter: any, value: string) {
      return +value
    },
    'number',
    'string'
  )
}

export default [
  createNumerifyFunction(),

  // get all data
  [prepareParams(), prepareRawTable()],

  createTop10Table(),
  insertTop10Data(),

  finalQuery(),
]

export const filters = [
  {
    display: 'yAxis',
    name: 'yAxis',
    props: {
      items: [
        {
          label: 'weight',
          value: 'weight',
        },
        {
          label: 'cbm',
          value: 'cbm',
        },
        {
          label: 'totalBooking',
          value: 'totalBooking',
        },
      ],
      required: true,
    },
    type: 'list',
  },
  {
    display: 'xAxis',
    name: 'xAxis',
    props: {
      items: [
        {
          label: 'carrier',
          value: 'carrier',
        },
        {
          label: 'shipper',
          value: 'shipper',
        },
        {
          label: 'consignee',
          value: 'consignee',
        },
        {
          label: 'agent',
          value: 'agent',
        },
      ],
      required: true,
    },
    type: 'list',
  },

  {
    display: 'topX',
    name: 'topX',
    props: {
      items: [
        {
          label: '5',
          value: 5,
        },
        {
          label: '10',
          value: 10,
        },
        {
          label: '20',
          value: 20,
        },
      ],
      required: true,
    },
    type: 'list',
  },

  {
    display: 'showOther',
    name: 'showOther',
    type: 'boolean',
  },
]
