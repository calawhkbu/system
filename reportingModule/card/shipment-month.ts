import {
  AndExpressions,
  BinaryExpression,
  ColumnExpression,
  CreateTableJQL,
  FromTable,
  FunctionExpression,
  InsertJQL,
  Value,
  Query,
  ResultColumn,
  Column,
  GroupBy,
  OrderBy,
  MathExpression,
  IsNullExpression,
} from 'node-jql'
import { parseCode } from 'utils/function'

function prepareParams(): Function {
  return function(require, session, params) {
    // import
    const moment = require('moment')
    const { BadRequestException } = require('@nestjs/common')

    const subqueries = (params.subqueries = params.subqueries || {})

    // idea : userGroupByVariable and userSummaryVariable is selected within filter by user

    if (!subqueries.groupByVariable || !subqueries.groupByVariable.value) throw new Error('MISSING_groupByVariable')
    if (!subqueries.topX || !subqueries.topX.value) throw new Error('MISSING_topX')

    // -----------------------------groupBy variable
    const groupByVariable = subqueries.groupByVariable.value // should be shipper/consignee/agent/controllingCustomer/carrier
    const codeColumnName = groupByVariable === 'carrier' ? `carrierCode` : `${groupByVariable}PartyCode`
    const nameColumnName = groupByVariable === 'carrier' ? `carrierName` : `${groupByVariable}PartyName`

    const groupByVariables = [codeColumnName, nameColumnName]

    const topX = subqueries.topX.value

    // ---------------------summaryVariables

    let summaryVariables: string[]
    if (subqueries.summaryVariables && subqueries.summaryVariables.value)
    {
      // sumamary variable
      summaryVariables = subqueries.summaryVariables.value // should be chargeableWeight/cbm/grossWeight/totalShipment
    }

    else if (subqueries.summaryVariable && subqueries.summaryVariable.value)
    {
      summaryVariables = [subqueries.summaryVariable.value]
    }
    else {
      throw new Error('MISSING_summaryVariables')
    }

    // ----------------------- filter

    // limit/extend to 1 year
    const year = (subqueries.date ? moment() : moment(subqueries.date.from, 'YYYY-MM-DD')).year()
    subqueries.date.from = moment()
      .year(year)
      .startOf('year')
      .format('YYYY-MM-DD')
    subqueries.date.to = moment()
      .year(year)
      .endOf('year')
      .format('YYYY-MM-DD')

    // select

    subqueries[`${groupByVariable}IsNotNull`]  = {// shoulebe carrierIsNotNull/shipperIsNotNull/controllingCustomerIsNotNull
      value : true
    }

    params.fields = [
      // select Month statistics
      ...summaryVariables.map(variable => `${variable}Month`),
      ...groupByVariables,
    ]

    // group by
    params.groupBy = [
      ...groupByVariables,
    ]

    // warning, will orderBy cbmMonth, if choose cbm as summaryVariables
    params.sorting = new OrderBy(`${summaryVariables[0]}Month`, 'DESC')

    params.limit = topX

    console.log(`params`)
    console.log(params)

    return params
  }
}

function finalQuery()
{

  return function(require, session, params) {

    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]

    const {
      OrderBy,
      CreateTableJQL,
      Query,
      ResultColumn,
      ColumnExpression,
      FunctionExpression,
      IsNullExpression,
      FromTable,
      BadRequestException
    } = require('node-jql')

    const subqueries = (params.subqueries = params.subqueries || {})
    // groupBy variable
    const groupByVariable = subqueries.groupByVariable.value // should be shipper/consignee/agent/controllingCustomer/carrier
    const codeColumnName = groupByVariable === 'carrier' ? `carrierCode` : `${groupByVariable}PartyCode`
    const nameColumnName = groupByVariable === 'carrier' ? `carrierName` : `${groupByVariable}PartyName`

    const groupByVariables = [codeColumnName, nameColumnName]

    let summaryVariables: string[]
    if (subqueries.summaryVariables && subqueries.summaryVariables.value)
    {
      // sumamary variable
      summaryVariables = subqueries.summaryVariables.value // should be chargeableWeight/cbm/grossWeight/totalShipment
    }

    else if (subqueries.summaryVariable && subqueries.summaryVariable.value)
    {
      summaryVariables = [subqueries.summaryVariable.value]
    }
    else {
      throw new Error('MISSING_summaryVariables')
    }

    const columns = [
      ...groupByVariables.map(variable => ({ name: variable, type: 'string' })),
    ]

    const $select = [
      new ResultColumn(new ColumnExpression(codeColumnName), 'code'),
      new ResultColumn(new ColumnExpression(nameColumnName), 'name'),
      new ResultColumn(new Value(groupByVariable), 'groupByVariable'),
    ]

    summaryVariables.map(variable => {
      months.map(month => {
        columns.push({ name: `${month}_${variable}`, type: 'number' })
        $select.push(new ColumnExpression(`${month}_${variable}`))

      })
      columns.push({ name: `total_${variable}`, type: 'number' })
      $select.push(new ColumnExpression(`total_${variable}`))
    })

    return new Query({
      $select,
      $from: new FromTable(
        {
          method: 'POST',
          url: 'api/shipment/query/shipment',
          columns
        },
        'shipment'
      )
    })

  }
}

export default [

  [prepareParams(), finalQuery()]
]

export const filters = [

  // for this filter, user can only select single,
  // but when config in card definition, use summaryVariables. Then we can set as multi

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
        }
      ],
      multi : false,
      required: true,
    },
    type: 'list',
  },

  {
    display: 'summaryVariable',
    name: 'summaryVariable',
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
      multi : false,
      required: true,
    },
    type: 'list',
  },
  {
    display: 'groupByVariable',
    name: 'groupByVariable',
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
  }
]
