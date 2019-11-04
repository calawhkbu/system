import { CreateFunctionJQL, Value, Query, InsertJQL, FromTable, CreateTableJQL, GroupBy, BinaryExpression, ColumnExpression, IsNullExpression, ResultColumn, FunctionExpression, OrderBy } from 'node-jql'

import { parseCode } from 'utils/function'

function prepareParams(isCurrent_: boolean): Function {
  const fn = function(require, session, params) {

    const moment = require('moment')
    const { OrderBy } = require('node-jql')
    const { BadRequestException } = require('@nestjs/common')

    const subqueries = (params.subqueries = params.subqueries || {})

    // warning cannot display from frontend
    if (!subqueries.groupByEntity) throw new BadRequestException('MISSING_groupByEntity')

    if (!subqueries.metric1) throw new BadRequestException('MISSING_metric1')
    if (!subqueries.metric2) throw new BadRequestException('MISSING_metric2')
    if (!subqueries.lastCurrentUnit) throw new BadRequestException('lastCurrentUnit')

        // most important part of this card
    // dynamically choose the fields and summary value

    const groupByEntity = subqueries.groupByEntity.value // should be shipper/consignee/agent/controllingCustomer/carrier

    const metric1 = subqueries.metric1.value // should be chargeableWeight/cbm/grossWeight/totalShipment
    const metric2 = subqueries.metric2.value // should be chargeableWeight/cbm/grossWeight/totalShipment

    const metricList = [metric1, metric2]

    const codeColumnName = groupByEntity === 'carrier' ?  `carrierCode` : (groupByEntity === 'agentGroup' ?  `agentGroupName` : `${groupByEntity}PartyCode`)
    const nameColumnName = groupByEntity === 'carrier' ?  `carrierName` : (groupByEntity === 'agentGroup' ?  `agentGroupName` : `${groupByEntity}PartyName`)

    const lastCurrentUnit = subqueries.lastCurrentUnit.value // should be chargeableWeight/cbm/grossWeight/totalShipment
    // ------------------------------

    let dateFrom: any
    let dateTo: any

    if (lastCurrentUnit === 'year')
    {
      let year = moment().year()
      if (!isCurrent_)
      {
        year = year - 1
      }
      dateFrom = moment().year(year).startOf('year').format('YYYY-MM-DD')
      dateTo = moment().year(year).endOf('year').format('YYYY-MM-DD')
    }

    else if (lastCurrentUnit === 'month')
    {

      const month = moment().month()
      if (!isCurrent_)
      {
        dateFrom = moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD')
        dateTo = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD')
      }

      else
      {
        dateFrom = moment().month(month).startOf('month').format('YYYY-MM-DD')
        dateTo = moment().month(month).endOf('month').format('YYYY-MM-DD')
      }

    }

    else if (lastCurrentUnit === 'lastYearCurrentMonth')
    {

      let year = moment().year()
      if (!isCurrent_)
      {
        year = year - 1
      }
      dateFrom = moment().year(year).startOf('month').format('YYYY-MM-DD')
      dateTo = moment().year(year).endOf('month').format('YYYY-MM-DD')

    }

    else
    {
      throw new BadRequestException('INVALID_lastCurrentUnit')
    }

    subqueries.date.from = dateFrom
    subqueries.date.to = dateTo

    params.fields = [...new Set([codeColumnName, nameColumnName, ...metricList])]
    params.groupBy = [codeColumnName]

    return params
  }

  let code = fn.toString()
  code = code.replace(new RegExp('isCurrent_', 'g'), String(isCurrent_))
  return parseCode(code)
}

function prepareRawTable(isCurrent_: boolean) {
  const fn = function(require, session, params) {
    const {
      Value,
      CreateTableJQL,
      ResultColumn,
      FromTable,
      ColumnExpression,
      Query,
      FunctionExpression,
      OrderBy,
    } = require('node-jql')

    const tableName = isCurrent_ ? 'current' : 'last'

    const subqueries = (params.subqueries = params.subqueries || {})

    const groupByEntity = subqueries.groupByEntity.value // should be shipper/consignee/agent/controllingCustomer/carrier

    const metric1 = subqueries.metric1.value // should be chargeableWeight/cbm/grossWeight/totalShipment
    const metric2 = subqueries.metric2.value // should be chargeableWeight/cbm/grossWeight/totalShipment

    const metricList = [metric1, metric2]

    const codeColumnName = groupByEntity === 'carrier' ?  `carrierCode` : (groupByEntity === 'agentGroup' ?  `agentGroupName` : `${groupByEntity}PartyCode`)
    const nameColumnName = groupByEntity === 'carrier' ?  `carrierName` : (groupByEntity === 'agentGroup' ?  `agentGroupName` : `${groupByEntity}PartyName`)

    const lastCurrentUnit = subqueries.lastCurrentUnit.value // should be chargeableWeight/cbm/grossWeight/totalShipment
    // ------------------------------
    return new CreateTableJQL({
      $temporary: true,
      name: tableName,

      $as: new Query({
        $select: [
          new ResultColumn(new ColumnExpression(codeColumnName), 'code'),
          new ResultColumn(new ColumnExpression(nameColumnName), 'name'),

          ...metricList.map(metric => new ResultColumn(
              new FunctionExpression('NUMBERIFY', new ColumnExpression(metric)),
              metric
            )
          ),

          new ResultColumn(
            new Value(isCurrent_),
            'isCurrent'
          )
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
                type: 'string',
              },
              ...metricList.map(metric => (
                {
                  name: metric,
                  type: 'number'
                })
              )
            ],
          },
          'shipment'
        ),
      }),
    })
  }
  let code = fn.toString()
  code = code.replace(new RegExp('isCurrent_', 'g'), String(isCurrent_))
  return parseCode(code)
}

function createUnionTable() {

  return new CreateTableJQL({

    $temporary : true,
    name : 'union',
    $as : new Query({
      $from  : 'current',
      $union : new Query({
        $from : 'last'
      })
    })

  })
}

function finalQuery() {
  const fn = function(require, session, params) {
    const {
      ResultColumn,
      OrderBy,
      GroupBy,
      FunctionExpression,
      BinaryExpression,
      ColumnExpression,
      IsNullExpression,
      Query,
      Value
    } = require('node-jql')

    const subqueries = (params.subqueries = params.subqueries || {})
    const groupByEntity = subqueries.groupByEntity.value // should be shipper/consignee/agent/controllingCustomer/carrier

    const metric1 = subqueries.metric1.value // should be chargeableWeight/cbm/grossWeight/totalShipment
    const metric2 = subqueries.metric2.value // should be chargeableWeight/cbm/grossWeight/totalShipment

    const metricList = [metric1, metric2]

    const codeColumnName = groupByEntity === 'carrier' ?  `carrierCode` : (groupByEntity === 'agentGroup' ?  `agentGroupName` : `${groupByEntity}PartyCode`)
    const nameColumnName = groupByEntity === 'carrier' ?  `carrierName` : (groupByEntity === 'agentGroup' ?  `agentGroupName` : `${groupByEntity}PartyName`)

    const lastCurrentUnit = subqueries.lastCurrentUnit.value // should be chargeableWeight/cbm/grossWeight/totalShipment

    // ------------------------------

    const $select = [

      new ResultColumn(new ColumnExpression('union', 'name'), 'name'),
      new ResultColumn(new ColumnExpression('union', 'code'), 'code'),

      new ResultColumn(new Value(lastCurrentUnit), 'lastCurrentUnit'),
      ...metricList.map((metric, index) => new ResultColumn(new Value(metric), `metric${index + 1}`))

    ]

    // a list for easy listing
    const isCurrentList = [true, false]

    metricList.map((metric, index) => {

      isCurrentList.map(isCurrent => {

        $select.push(

          new ResultColumn(

            new FunctionExpression('IFNULL',
              new FunctionExpression('FIND',
              new BinaryExpression(new ColumnExpression('union', 'isCurrent'), '=', isCurrent),
              new ColumnExpression('union', metric)
              ),
            0), `${isCurrent ? 'current' : 'last'}_metric${index + 1}`)

        )

      })

    })

    return new Query({

      $select,

      $from  : 'union',

      // the ordering

      // $order : new OrderBy(new ColumnExpression('union', 'code'), 'ASC'),
      $order : new OrderBy(new ColumnExpression('current_metric1'), 'DESC'),

      $where : new IsNullExpression(new ColumnExpression('union', 'code'), true),
      $group : new GroupBy('code')

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

  /// get data for last/current
  [prepareParams(true), prepareRawTable(true)],
  [prepareParams(false), prepareRawTable(false)],

  createUnionTable(),

  finalQuery()
]

export const filters = [

  {
    display: 'lastCurrentUnit',
    name: 'lastCurrentUnit',
    props: {
      items: [
        {
          label: 'year',
          value: 'year',
        },
        {
          label: 'month',
          value: 'month',
        },
        {
          label: 'lastYearCurrentMonth',
          value: 'lastYearCurrentMonth',
        }
      ],
      required: true,
    },
    type: 'list',
  },
  {
    display: 'summaryVariables',
    name: 'summaryVariables',
    props: {
      multi : true,
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
      ],
      required: true,
    },
    type: 'list',
  },

  {
    display: 'metric1',
    name: 'metric1',
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
      ],
      required: true,
    },
    type: 'list',
  },

  {
    display: 'metric2',
    name: 'metric2',
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
      ],
      required: true,
    },
    type: 'list',
  },

  {
    display: 'groupByEntity',
    name: 'groupByEntity',
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
          label: 'agentGroup',
          value: 'agentGroup',
        },
        {
          label: 'controllingCustomer',
          value: 'controllingCustomer',
        },
      ],
      required: true,
    },
    type: 'list',
  },

]
