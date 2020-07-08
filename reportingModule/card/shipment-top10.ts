import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { OrderBy } from 'node-jql'
import { expandGroupEntity } from 'utils/card'

interface Result {
  result: any[]
  xAxis: string
  summaryColumnName: string
  codeColumnName: string
  nameColumnName: string
}

export default {
  jqls: [
    {
      type: 'prepareParams',
      defaultResult: {},
      prepareParams(params, prevResult: Result): IQueryParams {
        const subqueries = (params.subqueries = params.subqueries || {})

        // warning cannot display from frontend
        if (!subqueries.xAxis) throw new Error('MISSING_xAxis')
        if (!subqueries.yAxis) throw new Error('MISSING_yAxis')
        if (!subqueries.topX) throw new Error('MISSING_topX')

        // most important part of this card
        // dynamically choose the fields and summary value
        const xAxis = (subqueries.xAxis as any).value // should be shipper/consignee/agent/controllingCustomer/carrier
        const summaryColumnName = (subqueries.yAxis as any).value // should be chargeableWeight/cbm/grossWeight/totalShipment

        const { codeColumnName, nameColumnName } = expandGroupEntity(subqueries,'xAxis')

        // const codeColumnName =
        //   xAxis === 'carrier'
        //     ? `carrierCode`
        //     : xAxis === 'portOfLoadingCode'
        //     ? `portOfLoadingCode`
        //     : xAxis === 'portOfDischargeCode'
        //     ? `portOfDischargeCode`
        //     : xAxis === 'agentGroup'
        //     ? `agentGroup`
        //     : `${xAxis}PartyCode`
        // const nameColumnName =
        //   (xAxis === 'carrier'
        //     ? `carrierName`
        //     : xAxis === 'portOfLoadingCode'
        //     ? `portOfLoadingCode`
        //     : xAxis === 'portOfDischargeCode'
        //     ? `portOfDischargeCode`
        //     : xAxis === 'agentGroup'
        //     ? `agentGroup`
        //     : `${xAxis}PartyShortNameInReport`) + 'Any'
        // ------------------------------

        prevResult.xAxis = xAxis
        prevResult.summaryColumnName = summaryColumnName
        prevResult.codeColumnName = codeColumnName
        prevResult.nameColumnName = nameColumnName

        params.sorting = new OrderBy(summaryColumnName, 'DESC')
        params.fields = [...new Set([codeColumnName, summaryColumnName, nameColumnName])]
        params.groupBy = [codeColumnName]

        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['shipment', 'shipment'],
      onResult(res, params, prevResult: Result): Result {
        const { summaryColumnName, codeColumnName, nameColumnName } = prevResult
        prevResult.result = res.map(row => {
          const result = {
            [codeColumnName]: row[codeColumnName],
            [nameColumnName]: row[nameColumnName],
          }
          let value = +row[summaryColumnName]
          if (isNaN(value)) value = 0
          result[summaryColumnName] = value
          return result
        })
        return prevResult
      }
    },
    {
      type: 'postProcess',
      postProcess(params, { xAxis, summaryColumnName, codeColumnName, nameColumnName, result }: Result): any[] {
        const subqueries = (params.subqueries = params.subqueries || {})
        const showOther = subqueries.showOther || false
        const topX = (subqueries.topX as any).value

        const topXShipmentList: any[] = (result as any[]).filter(x => x[codeColumnName]).slice(0, topX)
        if (showOther) {
          // use the code of the top10 to find the rest
          const topXShipmentCodeList = topXShipmentList.map(x => x[codeColumnName])
          const otherShipmentList = result.filter(x => !topXShipmentCodeList.includes(x[codeColumnName]))

          // sum up all the other
          const otherSum = otherShipmentList.reduce((c, row) => c + row[summaryColumnName], 0)

          // compose the record for other
          const otherResult = {}
          otherResult[codeColumnName] = 'other'
          otherResult[nameColumnName] = 'other'
          otherResult[summaryColumnName] = otherSum

          topXShipmentList.push(otherResult)
        }

        return topXShipmentList.map(row => {
          const row_: any = {}
          row_.xAxis = xAxis
          row_.yAxis = summaryColumnName
          row_.code = row[codeColumnName]
          row_.name = row[nameColumnName]
          row_.summary = row[summaryColumnName]
          return row_
        })
      }
    }
  ],
  filters: [
    {
      display: 'yAxis',
      name: 'yAxis',
      props: {
        items: [
          {
            label: 'chargeableWeight',
            value: 'chargeableWeight',
          },
          {
            label: 'grossWeight',
            value: 'grossWeight',
          },
          {
            label: 'cbm',
            value: 'cbm',
          },
          {
            label: 'totalShipment',
            value: 'totalShipment',
          },
          {
            label: 'teu',
            value: 'teu',
          },
          {
            label: 'teuInReport',
            value: 'teuInReport',
          },
          {
            label: 'quantity',
            value: 'quantity',
          },
          {
            label: 'cargoValue',
            value: 'cargoValue'
          }
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
          {
            label: 'office',
            value: 'office',
          },
          {
            label: 'agentGroup',
            value: 'agentGroup',
          },
          {
            label: 'controllingCustomer',
            value: 'controllingCustomer',
          },
          {
            label: 'portOfLoading',
            value: 'portOfLoadingCode',
          },
          {
            label: 'portOfDischarge',
            value: 'portOfDischargeCode',
          }
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
            label: '10',
            value: 10,
          },
          {
            label: '20',
            value: 20,
          },
          {
            label: '50',
            value: 50,
          },
          {
            label: '100',
            value: 100,
          },
          {
            label: '1000',
            value: 1000,
          }
        ],
        multi : false,
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
} as JqlDefinition

/*import { CreateFunctionJQL, Value, Query, ResultColumn, LimitOffset } from 'node-jql'

import { parseCode } from 'utils/function'

function prepareParams(): Function {
  const fn = function(require, session, params) {
    const { OrderBy } = require('node-jql')
    const { BadRequestException } = require('@nestjs/common')

    const subqueries = (params.subqueries = params.subqueries || {})

    // warning cannot display from frontend
    if (!subqueries.xAxis) throw new Error('MISSING_xAxis')
    if (!subqueries.yAxis) throw new Error('MISSING_yAxis')
    if (!subqueries.topX) throw new Error('MISSING_topX')

    // most important part of this card
    // dynamically choose the fields and summary value

    const xAxis = subqueries.xAxis.value // should be shipper/consignee/agent/controllingCustomer/carrier

    const summaryColumnName = subqueries.yAxis.value // should be chargeableWeight/cbm/grossWeight/totalShipment

    const codeColumnName =
      xAxis === 'carrier'
        ? `carrierCode`
        : xAxis === 'portOfLoadingCode'
        ? `portOfLoadingCode`
        : xAxis === 'portOfDischargeCode'
        ? `portOfDischargeCode`
        : xAxis === 'agentGroup'
        ? `agentGroup`
        : `${xAxis}PartyCode`
    const nameColumnName =
      xAxis === 'carrier'
        ? `carrierName`
        : xAxis === 'portOfLoadingCode'
        ? `portOfLoadingCode`
        : xAxis === 'portOfDischargeCode'
        ? `portOfDischargeCode`
        : xAxis === 'agentGroup'
        ? `agentGroup`
        : `${xAxis}PartyShortNameInReport`
    // ------------------------------

    params.sorting = new OrderBy(summaryColumnName, 'DESC')

    // select
    params.fields = [...new Set([codeColumnName, summaryColumnName, nameColumnName])]
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

    const codeColumnName =
      xAxis === 'carrier'
        ? `carrierCode`
        : xAxis === 'portOfLoadingCode'
        ? `portOfLoadingCode`
        : xAxis === 'portOfDischargeCode'
        ? `portOfDischargeCode`
        : xAxis === 'agentGroup'
        ? `agentGroup`
        : `${xAxis}PartyCode`
    const nameColumnName =
      xAxis === 'carrier'
        ? `carrierName`
        : xAxis === 'portOfLoadingCode'
        ? `portOfLoadingCode`
        : xAxis === 'portOfDischargeCode'
        ? `portOfDischargeCode`
        : xAxis === 'agentGroup'
        ? `agentGroup`
        : `${xAxis}PartyShortNameInReport`
    // ------------------------------

    return new CreateTableJQL({
      $temporary: true,
      name: 'top10',
      columns: [
        {
          name: codeColumnName,
          type: 'any',
          nullable : true
        },
        {
          name: nameColumnName,
          type: 'any',
          nullable : true
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
    const xAxis = subqueries.xAxis.value // should be shipper/consignee/agent/controllingCustomer/carrier

    const summaryColumnName = subqueries.yAxis.value // should be chargeableWeight/cbm/grossWeight/totalShipment

    const codeColumnName =
      xAxis === 'carrier'
        ? `carrierCode`
        : xAxis === 'portOfLoadingCode'
        ? `portOfLoadingCode`
        : xAxis === 'portOfDischargeCode'
        ? `portOfDischargeCode`
        : xAxis === 'agentGroup'
        ? `agentGroup`
        : `${xAxis}PartyCode`
    const nameColumnName =
      xAxis === 'carrier'
        ? `carrierName`
        : xAxis === 'portOfLoadingCode'
        ? `portOfLoadingCode`
        : xAxis === 'portOfDischargeCode'
        ? `portOfDischargeCode`
        : xAxis === 'agentGroup'
        ? `agentGroup`
        : `${xAxis}PartyShortNameInReport`

    const showOther = subqueries.showOther || false
    const topX = subqueries.topX.value

    // ------------------------------

    const shipments = new Resultset(await session.query(new Query('raw'))).toArray() as any[]

    if (!(shipments && shipments.length)) {
      throw new Error('NO_DATA')
    }

    const top10ShipmentList = shipments.filter(x => x[codeColumnName]).slice(0, topX)

    if (showOther) {
      // use the code of the top10 to find the rest
      const top10ShipmentCodeList = top10ShipmentList.map(x => x[codeColumnName])

      const otherShipmentList = shipments.filter(
        x => !top10ShipmentCodeList.includes(x[codeColumnName])
      )

      // sum up all the other
      const otherSum = otherShipmentList.reduce(
        (accumulator, currentValue, currentIndex, array) => {
          return accumulator + currentValue[summaryColumnName]
        },
        0
      )

      // compose the record for other
      const otherResult = {}
      otherResult[codeColumnName] = 'other'
      otherResult[nameColumnName] = 'other'
      otherResult[summaryColumnName] = otherSum

      top10ShipmentList.push(otherResult)
    }

    else{
      if (!(top10ShipmentList && top10ShipmentList.length)) {
        throw new Error('top10ShipmentList is empty')
      }
    }

    return new InsertJQL('top10', ...top10ShipmentList)
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

    const codeColumnName =
      xAxis === 'carrier'
        ? `carrierCode`
        : xAxis === 'portOfLoadingCode'
        ? `portOfLoadingCode`
        : xAxis === 'portOfDischargeCode'
        ? `portOfDischargeCode`
        : xAxis === 'agentGroup'
        ? `agentGroup`
        : `${xAxis}PartyCode`
    const nameColumnName =
      xAxis === 'carrier'
        ? `carrierName`
        : xAxis === 'portOfLoadingCode'
        ? `portOfLoadingCode`
        : xAxis === 'portOfDischargeCode'
        ? `portOfDischargeCode`
        : xAxis === 'agentGroup'
        ? `agentGroup`
        : `${xAxis}PartyShortNameInReport`
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
            url: 'api/shipment/query/shipment',
            columns: [
              {
                name: codeColumnName,
                type: 'string',
              },
              {
                name: nameColumnName,
                type: 'string'
              },
              {
                name: summaryColumnName,
                type: 'string',
              },
            ],
          },
          'shipment'
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

    const codeColumnName =
      xAxis === 'carrier'
        ? `carrierCode`
        : xAxis === 'portOfLoadingCode'
        ? `portOfLoadingCode`
        : xAxis === 'portOfDischargeCode'
        ? `portOfDischargeCode`
        : xAxis === 'agentGroup'
        ? `agentGroup`
        : `${xAxis}PartyCode`
    const nameColumnName =
      xAxis === 'carrier'
        ? `carrierName`
        : xAxis === 'portOfLoadingCode'
        ? `portOfLoadingCode`
        : xAxis === 'portOfDischargeCode'
        ? `portOfDischargeCode`
        : xAxis === 'agentGroup'
        ? `agentGroup`
        : `${xAxis}PartyShortNameInReport`
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
          label: 'chargeableWeight',
          value: 'chargeableWeight',
        },
        {
          label: 'grossWeight',
          value: 'grossWeight',
        },
        {
          label: 'cbm',
          value: 'cbm',
        },
        {
          label: 'totalShipment',
          value: 'totalShipment',
        },
        {
          label: 'teu',
          value: 'teu',
        },
        {
          label: 'teuInReport',
          value: 'teuInReport',
        },

        {
          label: 'quantity',
          value: 'quantity',
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
        {
          label: 'office',
          value: 'office',
        },
        {
          label: 'agentGroup',
          value: 'agentGroup',
        },
        {
          label: 'controllingCustomer',
          value: 'controllingCustomer',
        },
        {
          label: 'portOfLoading',
          value: 'portOfLoadingCode',
        },

        {
          label: 'portOfDischarge',
          value: 'portOfDischargeCode',
        }
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
          label: '10',
          value: 10,
        },
        {
          label: '20',
          value: 20,
        },
        {
          label: '50',
          value: 50,
        },
        {
          label: '100',
          value: 100,
        },
        {
          label: '1000',
          value: 1000,
        }
      ],
      multi : false,
      required: true,
    },
    type: 'list',
  },

  {
    display: 'showOther',
    name: 'showOther',
    type: 'boolean',
  },
] */
