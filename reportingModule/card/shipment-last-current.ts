import {
  CreateFunctionJQL,
  Value,
  Query,
  InsertJQL,
  FromTable,
  CreateTableJQL,
  GroupBy,
  BinaryExpression,
  ColumnExpression,
  IsNullExpression,
  ResultColumn,
  FunctionExpression,
  OrderBy,
  IExpression,
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

        // special case !!!
        lastFrom = moment(from).quarter(currentQuarter).subtract(1, 'years').startOf('quarter').format('YYYY-MM-DD')
        lastTo = moment(from).quarter(currentQuarter).subtract(1, 'years').endOf('month').format('YYYY-MM-DD')
        currentFrom = moment(from).quarter(currentQuarter).startOf('quarter').format('YYYY-MM-DD')
        currentTo = moment(from).quarter(currentQuarter).endOf('month').format('YYYY-MM-DD')

      }
      else if (lastCurrentUnit === 'month') {

        // special case !!!
        lastFrom = moment(from).month(currentMonth).subtract(1, 'years').startOf('month').format('YYYY-MM-DD')
        lastTo = moment(from).month(currentMonth).subtract(1, 'years').endOf('month').format('YYYY-MM-DD')
        currentFrom = moment(from).month(currentMonth).startOf('month').format('YYYY-MM-DD')
        currentTo = moment(from).month(currentMonth).endOf('month').format('YYYY-MM-DD')

      }
      else if (lastCurrentUnit === 'previousQuarter') {

        lastFrom = moment(from).subtract(1, 'quarters').startOf('quarter').format('YYYY-MM-DD')
        lastTo = moment(from).subtract(1, 'quarters').endOf('quarter').format('YYYY-MM-DD')
        currentFrom = moment(from).quarter(currentQuarter).startOf('quarter').format('YYYY-MM-DD')
        currentTo = moment(from).quarter(currentQuarter).endOf('quarter').format('YYYY-MM-DD')

      }
      else if (lastCurrentUnit === 'previousMonth') {

        lastFrom = moment(from).subtract(1, 'months').startOf('month').format('YYYY-MM-DD')
        lastTo = moment(from).subtract(1, 'months').endOf('month').format('YYYY-MM-DD')
        currentFrom = moment(from).month(currentMonth).startOf('month').format('YYYY-MM-DD')
        currentTo = moment(from).month(currentMonth).endOf('month').format('YYYY-MM-DD')

      }
      else if (lastCurrentUnit === 'previousWeek') {
        lastFrom = moment(from).subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD')
        lastTo = moment(from).subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD')
        currentFrom = moment(from).week(currentWeek).startOf('week').format('YYYY-MM-DD')
        currentTo = moment(from).week(currentWeek).endOf('week').format('YYYY-MM-DD')
      }
      else if (lastCurrentUnit === 'previousDay') {
        lastFrom = moment(from).subtract(1, 'days').startOf('day').format('YYYY-MM-DD')
        lastTo = moment(from).subtract(1, 'days').endOf('day').format('YYYY-MM-DD')
        currentFrom = moment(from).startOf('day').format('YYYY-MM-DD')
        currentTo = moment(from).endOf('day').format('YYYY-MM-DD')
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

    const { moment } = params.packages
    const { OrderBy } = require('node-jql')

    const subqueries = (params.subqueries = params.subqueries || {})

    // warning cannot display from frontend
    if (!subqueries.groupByEntity) throw new Error('MISSING_groupByEntity')

    if (!subqueries.metric1) throw new Error('MISSING_metric1')
    if (!subqueries.metric2) throw new Error('MISSING_metric2')
    if (!subqueries.lastCurrentUnit) throw new Error('MISSING_lastCurrentUnit')
    if (!subqueries.topX) throw new Error('MISSING_topX')

    // most important part of this card
    // dynamically choose the fields and summary value

    const groupByEntity = subqueries.groupByEntity.value // should be shipper/consignee/agent/controllingCustomer/carrier
    const codeColumnName = groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierCode` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyCode`
    const nameColumnName = groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierName` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyNameInReport`
    const metric1 = subqueries.metric1.value // should be chargeableWeight/cbm/grossWeight/totalShipment
    const metric2 = subqueries.metric2.value // should be chargeableWeight/cbm/grossWeight/totalShipment

    const metricList = [metric1, metric2]
    const metricFieldList = metricList.map(metric => `${metric}LastCurrent`)

    const metricColumnList = metricList.reduce(((accumulator, currentValue) => {

      accumulator.push(`${currentValue}Last`)
      accumulator.push(`${currentValue}Current`)
      return accumulator
    }), [])

    const topX = subqueries.topX.value
    const lastCurrentUnit = subqueries.lastCurrentUnit.value // should be chargeableWeight/cbm/grossWeight/totalShipment
    // ------------------------------

    const { lastFrom, lastTo, currentFrom, currentTo } = calculateLastCurrent(lastCurrentUnit)

    subqueries.date = {
      lastFrom,
      lastTo,
      currentFrom,
      currentTo
    }

    subqueries[`${groupByEntity}IsNotNull`] = {// should be carrierIsNotNull/shipperIsNotNull/controllingCustomerIsNotNull
      value: true
    }

    params.fields = [...new Set([codeColumnName, nameColumnName, ...metricFieldList])]
    params.groupBy = [codeColumnName, nameColumnName]

    params.sorting = []

    if (subqueries.sorting && subqueries.sorting.value) {

      const sortingValueList = subqueries.sorting.value as string[]

      sortingValueList.forEach(sortingValue => {

        // will try to find in sortingExpressionMap first, if not found , just use the normal value
        const orderByExpression = guessSortingExpression(sortingValue, subqueries)
        params.sorting.push(orderByExpression)

      })

    }

    // if (subqueries.sorting && subqueries.sorting.value) {

    //   const sortingExpressionMap = composeSortingExpressionMap(subqueries)

    //   const sortingValueList = subqueries.sorting.value as string[]

    //   sortingValueList.forEach(sortingValue => {

    //     if (!sortingExpressionMap[sortingValue]) {
    //       throw new Error('sortingValue not found in sortingExpressionMap')
    //     }

    //     // will try to find in sortingExpressionMap first, if not found , just use the normal value
    //     const orderByExpression = sortingExpressionMap[sortingValue]
    //     params.sorting.push(orderByExpression)

    //   })

    // }

    // metricFieldList[0] = totalShipmentLastCurrent
    // metricList[0] = totalShipment
    // params.sorting = new OrderBy(`${metricList[0]}Current`, sortingDirection)

    params.limit = topX

    return params

  }

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

function dataQuery(): Function {
  return function(require, session, params) {

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

    const subqueries = (params.subqueries = params.subqueries || {})

    const groupByEntity = subqueries.groupByEntity.value // should be shipper/consignee/agent/controllingCustomer/carrier
    const codeColumnName = groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierCode` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyCode`
    const nameColumnName = groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierName` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyNameInReport`
    const metric1 = subqueries.metric1.value // should be chargeableWeight/cbm/grossWeight/totalShipment
    const metric2 = subqueries.metric2.value // should be chargeableWeight/cbm/grossWeight/totalShipment

    const metricList = [metric1, metric2]
    const metricFieldList = metricList.map(metric => `${metric}LastCurrent`)

    // for easy looping
    const metricColumnList = metricList.reduce(((accumulator, currentValue) => {

      accumulator.push(`${currentValue}Last`)
      accumulator.push(`${currentValue}Current`)
      return accumulator
    }), [])

    const topX = subqueries.topX.value

    const lastCurrentUnit = subqueries.lastCurrentUnit.value // should be chargeableWeight/cbm/grossWeight/totalShipment
    // ------------------------------

    const tableName = `final`

    return new CreateTableJQL({
      $temporary: true,
      name: tableName,

      $as: new Query({
        $select: [
          new ResultColumn(new ColumnExpression(codeColumnName), 'code'),
          new ResultColumn(new ColumnExpression(nameColumnName), 'name'),

          ...metricColumnList.map(
            metricColumn =>
              new ResultColumn(new FunctionExpression('NUMBERIFY', new ColumnExpression(metricColumn)), metricColumn)
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
                type: 'string',
              },

              ...metricColumnList.map(metricColumn => ({
                name: metricColumn,
                type: 'number',
              })),
            ],
          },
          'shipment'
        ),
      })

    })

  }
}

function finalQuery() {

  return function(require, session, params) {

    const subqueries = (params.subqueries = params.subqueries || {})

    const groupByEntity = subqueries.groupByEntity.value // should be shipper/consignee/agent/controllingCustomer/carrier
    const codeColumnName = groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierCode` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyCode`
    const nameColumnName = groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierName` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyNameInReport`
    const metric1 = subqueries.metric1.value // should be chargeableWeight/cbm/grossWeight/totalShipment
    const metric2 = subqueries.metric2.value // should be chargeableWeight/cbm/grossWeight/totalShipment

    const metricList = [metric1, metric2]
    const metricFieldList = metricList.map(metric => `${metric}LastCurrent`)

    // for easy looping
    const metricColumnList = metricList.reduce(((accumulator, currentValue) => {

      accumulator.push(`${currentValue}Last`)
      accumulator.push(`${currentValue}Current`)
      return accumulator
    }), [])

    const $select = [
      new ResultColumn(new ColumnExpression('code')),
      new ResultColumn(new ColumnExpression('name')),
      new ResultColumn(new Value(groupByEntity), 'groupByEntity')
    ]

    for (const [index, metric] of metricList.entries()) {

      $select.push(new ResultColumn(new ColumnExpression(`${metric}Current`), `metric${index + 1}Current`))
      $select.push(new ResultColumn(new ColumnExpression(`${metric}Last`), `metric${index + 1}Last`))

      $select.push(new ResultColumn(new Value(metric), `metric${index + 1}`))

    }

    return new Query({
      $select,
      $from: 'final'
    })

  }

}

export default [

  createNumerifyFunction(),
  [prepareParams(), dataQuery()],
  finalQuery()

]

export const filters = [

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
      multi: false,
      required: true,
    },
    type: 'list',
  },

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
          label: 'quarter',
          value: 'quarter',
        },
        {
          label: 'month',
          value: 'month',
        },
        {
          label: 'previousQuarter',
          value: 'previousQuarter',
        },
        {
          label: 'previousMonth',
          value: 'previousMonth',
        },
        {

          label: 'previousWeek',
          value: 'previousWeek'
        },
        {

          label: 'previousDay',
          value: 'previousDay'

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
          label: 'moduleType',
          value: 'moduleType'
        },
        {
          label: 'houseNo',
          value: 'houseNo'
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
          label: 'metric1Current_ASC',
          value: 'metric1Current_ASC'
        },
        {
          label: 'metric1Last_ASC',
          value: 'metric1Last_ASC'
        },
        {
          label: 'metric1PercentageChange_ASC',
          value: 'metric1PercentageChange_ASC'
        },

        {
          label: 'metric2Current_ASC',
          value: 'metric2Current_ASC'
        },
        {
          label: 'metric2Last_ASC',
          value: 'metric2Last_ASC'
        },
        {
          label: 'metric2PercentageChange_ASC',
          value: 'metric2PercentageChange_ASC'
        },
        {
          label: 'metric1Current_DESC',
          value: 'metric1Current_DESC'
        },
        {
          label: 'metric1Last_DESC',
          value: 'metric1Last_DESC'
        },
        {
          label: 'metric1PercentageChange_DESC',
          value: 'metric1PercentageChange_DESC'
        },

        {
          label: 'metric2Current_DESC',
          value: 'metric2Current_DESC'
        },
        {
          label: 'metric2Last_DESC',
          value: 'metric2Last_DESC'
        },
        {
          label: 'metric2PercentageChange_DESC',
          value: 'metric2PercentageChange_DESC'
        },
      ]
    }

  }
]
