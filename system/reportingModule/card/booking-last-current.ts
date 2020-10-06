import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import Moment = require('moment')
import { OrderBy } from 'node-jql'
import { BadRequestException } from '@nestjs/common'
import { expandGroupEntity, calculateLastCurrent } from 'utils/card'

interface Result {
  moment: typeof Moment
  groupByEntity: string
  codeColumnName: string
  nameColumnName: string
  metricList: string[]
}

export default {
  jqls: [
    {
      type: 'prepareParams',
      defaultResult: {},
      async prepareParams(params, prevResult: Result, user): Promise<IQueryParams> {
        const moment = prevResult.moment = (await this.preparePackages(user)).moment
        const subqueries = params.subqueries = params.subqueries || {}

       

        function guessSortingExpression(sortingValue: string, subqueries) {
          const variablePart = sortingValue.substr(0, sortingValue.lastIndexOf('_'))
          const sortingDirection = sortingValue.substr(sortingValue.lastIndexOf('_') + 1)

          if (!['ASC', 'DESC'].includes(sortingDirection)) throw new Error(`cannot guess sortingDirection`)

          // here will handle 2 special cases : metric , summaryVariable
          const metricRegex = new RegExp('metric[0-9]+')
          const summaryVariableRegex = new RegExp('summaryVariable')

          let finalColumnName: string
          // summaryVariable case
          if (summaryVariableRegex.test(variablePart)) {
            finalColumnName = variablePart.replace('summaryVariable', subqueries.summaryVariable.value)
          }
          else if (metricRegex.test(variablePart)) {
            const metricPart = variablePart.match(metricRegex)[0]
            const metricValue = subqueries[metricPart].value
            finalColumnName = variablePart.replace(metricPart, metricValue)
          }
          else {
            finalColumnName = variablePart
          }

          return new OrderBy(finalColumnName, sortingDirection as 'ASC'|'DESC')
        }

        // warning cannot display from frontend
        if (!subqueries.groupByEntity) throw new Error('MISSING_groupByEntity')
        if (!subqueries.metric1) throw new Error('MISSING_metric1')
        if (!subqueries.metric2) throw new Error('MISSING_metric2')
        if (!subqueries.lastCurrentUnit) throw new Error('MISSING_lastCurrentUnit')
        if (!subqueries.topX) throw new Error('MISSING_topX')

        // most important part of this card
        // dynamically choose the fields and summary value

        // const groupByEntity = prevResult.groupByEntity = (subqueries.groupByEntity as any).value // should be shipper/consignee/agent/controllingCustomer/carrier
        // const codeColumnName = prevResult.codeColumnName = groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierCode` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyCode`
        // const nameColumnName = prevResult.nameColumnName = (groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierName` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyShortNameInReport`) + 'Any'
        var { groupByEntity, codeColumnName,nameColumnName } = expandGroupEntity(subqueries,'groupByEntity',true)
  // -----------------------------groupBy variable
  groupByEntity = prevResult.groupByEntity = subqueries.groupByEntity.value // should be shipper/consignee/agent/controllingCustomer/carrier
  codeColumnName = prevResult.codeColumnName = groupByEntity === 'bookingNo' ? 'bookingNo': groupByEntity === 'carrier' ? `carrierCode`: groupByEntity === 'agentGroup' ? 'agentGroup': groupByEntity === 'moduleType' ? 'moduleTypeCode': `${groupByEntity}PartyCode`
  nameColumnName = prevResult.nameColumnName = (groupByEntity === 'bookingNo' ? 'bookingNo': groupByEntity === 'carrier' ? `carrierName`: groupByEntity === 'agentGroup' ? 'agentGroup': groupByEntity === 'moduleType' ? 'moduleTypeCode': `${groupByEntity}PartyShortNameInReport`) + 'Any'
 
        prevResult.groupByEntity = groupByEntity
        prevResult.codeColumnName = codeColumnName
        prevResult.nameColumnName = nameColumnName

        const metric1 = (subqueries.metric1 as any).value // should be chargeableWeight/cbm/grossWeight/totalShipment
        const metric2 = (subqueries.metric2 as any).value // should be chargeableWeight/cbm/grossWeight/totalShipment
        const metricList = prevResult.metricList = [metric1, metric2]
        const metricFieldList = metricList.map(metric => `${metric}LastCurrent`)

        const topX = (subqueries.topX as any).value
        
        // const lastCurrentUnit = subqueries.lastCurrentUnit && subqueries.lastCurrentUnit !== true && 'value' in subqueries.lastCurrentUnit ? subqueries.lastCurrentUnit.value : '' // should be chargeableWeight/cbm/grossWeight/totalShipment
        
        // ------------------------------
        const { lastFrom, lastTo, currentFrom, currentTo } = calculateLastCurrent(subqueries,moment)

        subqueries.date = {
          lastFrom,
          lastTo,
          currentFrom,
          currentTo
        } as any

        subqueries[`${codeColumnName}IsNotNull`] = { // should be carrierIsNotNull/shipperIsNotNull/controllingCustomerIsNotNull
          value: true
        }

        params.fields = [...new Set([codeColumnName, nameColumnName, ...metricFieldList])]
        params.groupBy = [codeColumnName]

        const sorting = params.sorting = []
        if (subqueries.sorting && subqueries.sorting !== true && 'value' in subqueries.sorting) {
          const sortingValueList = subqueries.sorting.value as string[]
          sortingValueList.forEach(sortingValue => {
            // will try to find in sortingExpressionMap first, if not found , just use the normal value
            const orderByExpression = guessSortingExpression(sortingValue, subqueries)
            sorting.push(orderByExpression)
          })
        }

        params.limit = topX
        console.debug("prepareParams");
        console.debug(params);

        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['booking', 'booking'],
      onResult(res, params, prevResult: Result): any[] {
        const { codeColumnName, nameColumnName, groupByEntity, metricList } = prevResult
        return res.map(row => {
          const row_: any = { code: row[codeColumnName], name: row[nameColumnName], groupByEntity }
          for (const [i, metric] of metricList.entries()) {
            row_[`metric${i + 1}`] = metric
            for (const type of ['Last', 'Current']) {
              const value = +row[`${metric}${type}`]
              row_[`metric${i + 1}${type}`] = isNaN(value) ? 0 : value
            }
          }
          return row_
        })
      }
    },
  ],
  filters: [
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
            label: 'totalBooking',
            value: 'totalBooking',
          },
          {
            label: 'teu',
            value: 'teu',
          },
         
          {
            label: 'quantity',
            value: 'quantity',
          }
        
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
            label: 'totalBooking',
            value: 'totalBooking',
          },
          {
            label: 'teu',
            value: 'teu',
          },
         
          {
            label: 'quantity',
            value: 'quantity',
          }
        
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
            label : 'moduleType',
            value : 'moduleType'
          },
        
        ],
        required: true,
      },
      type: 'list',
    },
  ]
} as JqlDefinition

/* import {
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
        currentTo = moment(from).quarter(currentQuarter).endOf('quarter').format('YYYY-MM-DD')

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

    const metric1 = subqueries.metric1.value // should be chargeableWeight/cbm/grossWeight/totalBooking
    const metric2 = subqueries.metric2.value // should be chargeableWeight/cbm/grossWeight/totalBooking

    const metricList  = [metric1, metric2]
    const metricFieldList = metricList.map(metric => `${metric}LastCurrent`)

    const metricColumnList = metricList.reduce(((accumulator, currentValue) => {

      accumulator.push(`${currentValue}Last`)
      accumulator.push(`${currentValue}Current`)
      return accumulator }), [])

    const topX = subqueries.topX.value

    const lastCurrentUnit = subqueries.lastCurrentUnit.value // should be chargeableWeight/cbm/grossWeight/totalBooking
    // ------------------------------

    const { lastFrom, lastTo, currentFrom, currentTo } = calculateLastCurrent(lastCurrentUnit)

    subqueries.date = {
      lastFrom,
      lastTo,
      currentFrom,
      currentTo
    }

    subqueries[`${codeColumnName}IsNotNull`]  = {// should be carrierIsNotNull/shipperIsNotNull/controllingCustomerIsNotNull
      value : true
    }

    params.fields = [...new Set([codeColumnName, nameColumnName, ...metricFieldList])]
    params.groupBy = [codeColumnName, nameColumnName]

    params.sorting = new OrderBy(metricFieldList[0], 'DESC')

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
    const nameColumnName = groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierName` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyShortNameInReport`

    const metric1 = subqueries.metric1.value // should be chargeableWeight/cbm/grossWeight/totalBooking
    const metric2 = subqueries.metric2.value // should be chargeableWeight/cbm/grossWeight/totalBooking

    const metricList  = [metric1, metric2]
    const metricFieldList = metricList.map(metric => `${metric}LastCurrent`)

    // for easy looping
    const metricColumnList = metricList.reduce(((accumulator, currentValue) => {

      accumulator.push(`${currentValue}Last`)
      accumulator.push(`${currentValue}Current`)
      return accumulator }), [])

    const topX = subqueries.topX.value

    const lastCurrentUnit = subqueries.lastCurrentUnit.value // should be chargeableWeight/cbm/grossWeight/totalBooking
    // ------------------------------

    const tableName = `final`

    return new CreateTableJQL({
      $temporary: true,
      name: tableName,

      $as :  new Query({
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

              ...metricColumnList.map(metricColumn => ({
                name: metricColumn,
                type: 'number',
              })),
            ],
          },
          'booking'
        ),
      })

    })

  }
}

function finalQuery(){

  return function(require, session, params){

    const subqueries = (params.subqueries = params.subqueries || {})

    const groupByEntity = subqueries.groupByEntity.value // should be shipper/consignee/agent/controllingCustomer/carrier
    const codeColumnName = groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierCode` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyCode`
    const nameColumnName = groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierName` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyShortNameInReport`

    const metric1 = subqueries.metric1.value // should be chargeableWeight/cbm/grossWeight/totalBooking
    const metric2 = subqueries.metric2.value // should be chargeableWeight/cbm/grossWeight/totalBooking

    const metricList  = [metric1, metric2]
    const metricFieldList = metricList.map(metric => `${metric}LastCurrent`)

    // for easy looping
    const metricColumnList = metricList.reduce(((accumulator, currentValue) => {

      accumulator.push(`${currentValue}Last`)
      accumulator.push(`${currentValue}Current`)
      return accumulator }), [])

    const $select = [
      new ResultColumn(new ColumnExpression('code')),
      new ResultColumn(new ColumnExpression('name')),
      new ResultColumn(new Value(groupByEntity), 'groupByEntity')
    ]

    for (const [index, metric] of metricList.entries()) {

      $select.push(new ResultColumn(new ColumnExpression(`${metric}Current`), `current_metric${index + 1}`))
      $select.push(new ResultColumn(new ColumnExpression(`${metric}Last`), `last_metric${index + 1}`))

      $select.push(new ResultColumn(new Value(metric), `metric${index + 1}`))

    }

    return new Query({
      $select,
      $from : 'final'
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
      multi : false,
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
          label: 'totalBooking',
          value: 'totalBooking',
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
          label: 'totalBooking',
          value: 'totalBooking',
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
] */
