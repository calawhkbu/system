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
    const { moment } = params.packages
    const { BadRequestException } = require('@nestjs/common')

    const subqueries = (params.subqueries = params.subqueries || {})

    // idea : userGroupByVariable and userSummaryVariable is selected within filter by user

    if (!subqueries.groupByEntity || !subqueries.groupByEntity.value) throw new Error('MISSING_groupByVariable')
    if (!subqueries.topX || !subqueries.topX.value) throw new Error('MISSING_topX')

    // -----------------------------groupBy variable
    const groupByEntity = subqueries.groupByEntity.value // should be shipper/consignee/agent/controllingCustomer/carrier
    const codeColumnName = groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierCode` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyCode`
    const nameColumnName = groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierName` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyShortNameInReport`

    const groupByVariables = [codeColumnName, nameColumnName]

    const topX = subqueries.topX.value

    // ---------------------summaryVariables

    let summaryVariables: string[] = []
    if (subqueries.summaryVariables && subqueries.summaryVariables.value)
    {
      // sumamary variable
      summaryVariables = Array.isArray(subqueries.summaryVariables.value ) ? subqueries.summaryVariables.value  : [subqueries.summaryVariables.value ]
    }

    if (subqueries.summaryVariable && subqueries.summaryVariable.value)
    {
      summaryVariables = [...new Set([...summaryVariables, subqueries.summaryVariable.value] as string[])]
    }

    if (!(summaryVariables && summaryVariables.length)){
      throw new Error('MISSING_summaryVariables')
    }

    // ----------------------- filter

    // limit/extend to 1 year
    const year = (subqueries.date ? moment(subqueries.date.from, 'YYYY-MM-DD') : moment()).year()
    subqueries.date.from = moment()
      .year(year)
      .startOf('year')
      .format('YYYY-MM-DD')
    subqueries.date.to = moment()
      .year(year)
      .endOf('year')
      .format('YYYY-MM-DD')

    // select

    subqueries[`${groupByEntity}IsNotNull`]  = {// shoulebe carrierIsNotNull/shipperIsNotNull/controllingCustomerIsNotNull
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
    params.sorting = new OrderBy(`total_${summaryVariables[0]}`, 'DESC')

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
    const groupByEntity = subqueries.groupByEntity.value // should be shipper/consignee/agent/controllingCustomer/carrier
    const codeColumnName = groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierCode` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyCode`
    const nameColumnName = groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierName` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyShortNameInReport`

    const groupByVariables = [codeColumnName, nameColumnName]

    let summaryVariables: string[] = []
    if (subqueries.summaryVariables && subqueries.summaryVariables.value)
    {
      // sumamary variable
      summaryVariables = Array.isArray(subqueries.summaryVariables.value ) ? subqueries.summaryVariables.value  : [subqueries.summaryVariables.value ]
    }

    if (subqueries.summaryVariable && subqueries.summaryVariable.value)
    {
      summaryVariables = [...new Set([...summaryVariables, subqueries.summaryVariable.value] as string[])]
    }

    if (!(summaryVariables && summaryVariables.length)){
      throw new Error('MISSING_summaryVariables')
    }

    const columns = [
      ...groupByVariables.map(variable => ({ name: variable, type: 'string' })),
    ]

    const $select = [
      new ResultColumn(new ColumnExpression(codeColumnName), 'code'),
      new ResultColumn(new ColumnExpression(nameColumnName), 'name'),
      new ResultColumn(new Value(groupByEntity), 'groupByEntity'),
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
          url: 'api/booking/query/booking',
          columns
        },
        'booking'
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
    display: 'summaryVariable',
    name: 'summaryVariable',
    props: {
      items: [
        {
          label: 'quantity',
          value: 'quantity',
        },
        {
          label: 'weight',
          value: 'weight',
        },
        {
          label: 'totalBooking',
          value: 'totalBooking',
        },
      ],
      multi : false,
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

        {
          label: 'linerAgent',
          value: 'linerAgent',
        },

        {
          label: 'roAgent',
          value: 'roAgent',
        },
        {
          label: 'office',
          value: 'office',
        },
        {
          label : 'moduleType',
          value : 'moduleType'
        },
        {
          label : 'houseNo',
          value : 'houseNo'
        }
      ],
      required: true,
    },
    type: 'list',
  },
]
