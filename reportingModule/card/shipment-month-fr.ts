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
  OrExpressions,
} from 'node-jql'

import { parseCode } from 'utils/function'
import { months } from 'moment'

function prepareParams(): Function {
  return function(require, session, params) {
    // import
    const moment = require('moment')
    const { OrderBy } = require('node-jql')
    const subqueries = (params.subqueries = params.subqueries || {})

    // idea : userGroupByVariable and userSummaryVariable is selected within filter by user

    if (!subqueries.groupByEntity || !subqueries.groupByEntity.value) throw new Error('MISSING_groupByVariable')
    if (!subqueries.topX || !subqueries.topX.value) throw new Error('MISSING_topX')

    // -----------------------------groupBy variable
    const groupByEntity = subqueries.groupByEntity.value // should be shipper/consignee/agent/controllingCustomer/carrier
    const codeColumnName = groupByEntity === 'carrier' ? `carrierCode` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyCode`
    const nameColumnName = groupByEntity === 'carrier' ? `carrierName` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyName`

    const groupByVariables = [codeColumnName, nameColumnName]

    const topX = subqueries.topX.value

    const specialMonth = {
      name : `fr`,
      typeCodeList : ['F', 'R', 'T']
    }

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

    subqueries[`${groupByEntity}IsNotNull`] = {
      value: true
    }

    // select
    params.fields = [
      // select Month statistics
      ...summaryVariables.map(variable => `${specialMonth.name}_${variable}Month`),
      ...groupByVariables,
    ]

    // group by
    params.groupBy = [
      ...groupByVariables,
    ]

    // warning, will orderBy cbmMonth, if choose cbm as summaryVariables
    params.sorting = new OrderBy(`total_T_${summaryVariables[0]}`, 'DESC')

    params.limit = topX

    return params
  }

}

function finalQuery(): Function {

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

    const subqueries = (params.subqueries = params.subqueries || {})

    // idea : userGroupByVariable and userSummaryVariable is selected within filter by user

    if (!subqueries.groupByEntity || !subqueries.groupByEntity.value) throw new Error('MISSING_groupByVariable')
    if (!subqueries.topX || !subqueries.topX.value) throw new Error('MISSING_topX')

    // -----------------------------groupBy variable
    const groupByEntity = subqueries.groupByEntity.value // should be shipper/consignee/agent/controllingCustomer/carrier
    const codeColumnName = groupByEntity === 'carrier' ? `carrierCode` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyCode`
    const nameColumnName = groupByEntity === 'carrier' ? `carrierName` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyName`

    const groupByVariables = [codeColumnName, nameColumnName]

    const topX = subqueries.topX.value

    const specialMonth = {
      name : `fr`,
      typeCodeList : ['F', 'R', 'T']
    }

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
    // -------------------------------------

    const $select = [
      new ResultColumn(new ColumnExpression(codeColumnName), 'code'),
      new ResultColumn(new ColumnExpression(nameColumnName), 'name'),
      new ResultColumn(new Value(groupByEntity), 'groupByEntity'),
    ]

    const columns = [
      ...groupByVariables.map(variable => new Column(variable, 'string', true)),
    ] as any[]

    summaryVariables.map(variable => {

      specialMonth.typeCodeList.map(typeCode => {

        months.map(month => {
          const columnName = `${month}_${typeCode}_${variable}`
          $select.push(new ResultColumn(new ColumnExpression(columnName)))
          columns.push(new Column(columnName, 'number'))
        })

        const totalColumnName = `total_${typeCode}_${variable}`

        $select.push(new ResultColumn(new ColumnExpression(totalColumnName)))
        columns.push(new Column(totalColumnName, 'number'))

      })

    })

    return new Query({

      $select,
      $from: new FromTable({

        method: 'POST',
        url: 'api/shipment/query/shipment',
        columns

      }, 'shipment')
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
      multi: false,
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
      multi: false,
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
        // currently disabled
        {
          label: 'agentGroup',
          value: 'agentGroup',
        },
        {
          label : 'moduleType',
          value : 'moduleType'
        }
      ],
      required: true,
    },
    type: 'list',
  }
]
