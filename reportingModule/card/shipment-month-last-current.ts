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

    function calculateLastCurrent(lastCurrentUnit: string) {
      const from = subqueries.date.from

      const currentYear = moment(from).year()
      const currentQuarter = moment(from).quarter()
      const currentMonth = moment(from).month()
      const currentWeek = moment(from).week()

      let lastFrom, lastTo, currentFrom, currentTo

      if (lastCurrentUnit === 'year') {

        lastFrom = moment(from).year(currentYear - 1).startOf('year').format('YYYY-MM-DD')
        lastTo = moment(from).year(currentYear - 1).endOf('year').format('YYYY-MM-DD')
        currentFrom = moment(from).year(currentYear).startOf('year').format('YYYY-MM-DD')
        currentTo = moment(from).year(currentYear).endOf('year').format('YYYY-MM-DD')
      }
      else if (lastCurrentUnit === 'quarter') {

        lastFrom = moment(from).subtract(1, 'quaters').startOf('quater').format('YYYY-MM-DD')
        lastTo = moment(from).subtract(1, 'quaters').endOf('quater').format('YYYY-MM-DD')
        currentFrom = moment(from).quater(currentQuarter).startOf('quater').format('YYYY-MM-DD')
        currentTo = moment(from).quater(currentQuarter).endOf('quater').format('YYYY-MM-DD')

      }
      else if (lastCurrentUnit === 'month') {

        lastFrom = moment(from).subtract(1, 'months').startOf('month').format('YYYY-MM-DD')
        lastTo = moment(from).subtract(1, 'months').endOf('month').format('YYYY-MM-DD')
        currentFrom = moment(from).month(currentMonth).startOf('month').format('YYYY-MM-DD')
        currentTo = moment(from).month(currentMonth).endOf('month').format('YYYY-MM-DD')

      }
      else if (lastCurrentUnit === 'week') {
        lastFrom = moment(from).subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD')
        lastTo = moment(from).subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD')
        currentFrom = moment(from).week(currentWeek).startOf('week').format('YYYY-MM-DD')
        currentTo = moment(from).week(currentWeek).endOf('week').format('YYYY-MM-DD')
      }
      else if (lastCurrentUnit === 'day') {
        lastFrom = moment(from).subtract(1, 'days').startOf('day').format('YYYY-MM-DD')
        lastTo = moment(from).subtract(1, 'days').endOf('day').format('YYYY-MM-DD')
        currentFrom = moment(from).startOf('day').format('YYYY-MM-DD')
        currentTo = moment(from).endOf('day').format('YYYY-MM-DD')
      }
      else if (lastCurrentUnit === 'lastYearCurrentMonth') {

        // special case !!!
        lastFrom = moment(from).month(currentMonth).subtract(1, 'years').startOf('month').format('YYYY-MM-DD')
        lastTo = moment(from).month(currentMonth).subtract(1, 'years').endOf('month').format('YYYY-MM-DD')
        currentFrom = moment(from).month(currentMonth).startOf('month').format('YYYY-MM-DD')
        currentTo = moment(from).month(currentMonth).endOf('month').format('YYYY-MM-DD')

      }
      else {
        throw new Error('INVALID_lastCurrentUnit')
      }

      return { lastFrom, lastTo, currentFrom, currentTo }
    }

    function guessSortingExpression(sortingValue: string, subqueries)
    {
      const variablePart = sortingValue.substr(0, sortingValue.lastIndexOf('_'))
      const sortingDirection = sortingValue.substr(sortingValue.lastIndexOf('_') + 1)

      if (!['ASC', 'DESC'].includes(sortingDirection))
      {
        throw new Error(`cannot guess sortingDirection`)
      }

      // here will handle 2 special cases : metric , summaryVariable

      const metricRegex = new RegExp('metric[0-9]+')
      const summaryVariableRegex = new RegExp('summaryVariable')

      let finalColumnName: string

      // summaryVariable case
      if (summaryVariableRegex.test(variablePart))
      {
        finalColumnName = variablePart.replace('summaryVariable', subqueries.summaryVariable.value)
      }

      //
      else if (metricRegex.test(variablePart))
      {
        const metricPart = variablePart.match(metricRegex)[0]
        const metricValue = subqueries[metricPart].value
        finalColumnName = variablePart.replace(metricPart, metricValue)
      }

      else {
        finalColumnName = variablePart
      }

      return new OrderBy(finalColumnName, sortingDirection)
    }

    // import
    const { moment } = params.packages
    const { OrderBy } = require('node-jql')
    const { BadRequestException } = require('@nestjs/common')

    const subqueries = (params.subqueries = params.subqueries || {})

    // idea : userGroupByVariable and userSummaryVariable is selected within filter by user

    if (!subqueries.groupByEntity || !subqueries.groupByEntity.value) throw new Error('MISSING_groupByVariable')
    if (!subqueries.topX || !subqueries.topX.value) throw new Error('MISSING_topX')

    // -----------------------------groupBy variable

    const groupByEntity = subqueries.groupByEntity.value // should be shipper/consignee/agent/controllingCustomer/carrier

    const codeColumnName = groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierCode` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyCode`
    const nameColumnName = groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierName` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyNameInReport`

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

    const lastCurrentUnit = subqueries.lastCurrentUnit.value // should be chargeableWeight/cbm/grossWeight/totalShipment
    // ------------------------------
    const { lastFrom, lastTo, currentFrom, currentTo } = calculateLastCurrent(lastCurrentUnit)

    subqueries.date = {
      lastFrom,
      lastTo,
      currentFrom,
      currentTo
    }

    // ----------------------- filter

    subqueries[`${groupByEntity}IsNotNull`]  = {// shoulebe carrierIsNotNull/shipperIsNotNull/controllingCustomerIsNotNull
      value : true
    }

    params.fields = [
      // select Month statistics
      ...summaryVariables.map(variable => `${variable}MonthLastCurrent`),
      ...groupByVariables,
    ]

    // group by
    params.groupBy = [
      ...groupByVariables,
    ]

    params.limit = topX

    params.sorting = []

    if (subqueries.sorting && subqueries.sorting.value) {

      const sortingValueList = subqueries.sorting.value as string[]

      sortingValueList.forEach(sortingValue => {

        // will try to find in sortingExpressionMap first, if not found , just use the normal value
        const orderByExpression = guessSortingExpression(sortingValue, subqueries)
        params.sorting.push(orderByExpression)

      })

    }

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
    const nameColumnName = groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierName` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyNameInReport`

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

        ['Last', 'Current'].map(lastOrCurrent => {

          // January_cbmLast
          columns.push({ name: `${month}_${variable}${lastOrCurrent}`, type: 'number' })
          $select.push(new ColumnExpression(`${month}_${variable}${lastOrCurrent}`))
        })

        // January_cbmLastCurrentPercentageChange
        columns.push({ name: `${month}_${variable}LastCurrentPercentageChange`, type: 'number' })
        $select.push(new ColumnExpression(`${month}_${variable}LastCurrentPercentageChange`))

      });

      // total_cbmLast
      ['Last', 'Current'].map(lastOrCurrent => {
        columns.push({ name: `total_${variable}${lastOrCurrent}`, type: 'number' })
        $select.push(new ColumnExpression(`total_${variable}${lastOrCurrent}`))
      })

      // total_cbmLastCurrentPercentageChange
      columns.push({ name: `total_${variable}LastCurrentPercentageChange`, type: 'number' })
      $select.push(new ColumnExpression(`total_${variable}LastCurrentPercentageChange`))

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

  {
    display: 'sorting',
    name: 'sorting',
    type: 'list',
    props: {
      multi: true,
      items: [
        {
          label: 'total_summaryVariableCurrent_ASC',
          value: 'total_summaryVariableCurrent_ASC'
        },
        {
          label: 'total_summaryVariableCurrent_DESC',
          value: 'total_summaryVariableCurrent_DESC'
        },
        {
          label: 'total_summaryVariableLast_ASC',
          value: 'total_summaryVariableLast_ASC'
        },
        {
          label: 'total_summaryVariableLast_DESC',
          value: 'total_summaryVariableLast_DESC'
        },
        {
          label: 'total_summaryVariablePercentageChange_ASC',
          value: 'total_summaryVariablePercentageChange_ASC'
        },
        {
          label: 'total_summaryVariablePercentageChange_DESC',
          value: 'total_summaryVariablePercentageChange_DESC'
        },

        {
          label: 'total_totalShipmentLast_ASC',
          value: 'total_totalShipmentLast_ASC'
        },
        {
          label: 'total_totalShipmentLast_DESC',
          value: 'total_totalShipmentLast_DESC'
        },
        {
          label: 'total_totalShipmentCurrent_ASC',
          value: 'total_totalShipmentCurrent_ASC'
        },
        {
          label: 'total_totalShipmentCurrent_DESC',
          value: 'total_totalShipmentCurrent_DESC'
        },
        {
          label: 'total_totalShipmentPercentageChange_ASC',
          value: 'total_totalShipmentPercentageChange_ASC'
        },
        {
          label: 'total_totalShipmentPercentageChange_DESC',
          value: 'total_totalShipmentPercentageChange_DESC'
        },

      ]
    }

  }
]
