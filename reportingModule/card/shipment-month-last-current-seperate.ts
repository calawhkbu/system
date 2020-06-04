import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import Moment = require('moment')
import { OrderBy } from 'node-jql'
import { BadRequestException } from '@nestjs/common'

interface Result {
  moment: typeof Moment
  groupByEntity: string
  codeColumnName: string
  nameColumnName: string
  summaryVariables: string[]
  lastCurrentUnit: string
  firstTableLastOrCurrent: string
  result: any[]
}

function calculateLastCurrent(subqueries: any, moment: typeof Moment, lastCurrentUnit: string, lastOrCurrent_: 'last' | 'current') {
  if (!subqueries.date || !(subqueries.date !== true && 'from' in subqueries.date)) {
    throw new BadRequestException('MISSING_DATE')
  }

  const rawFrom = subqueries.date.from
  const currentYear = moment(rawFrom).year()
  const currentQuarter = moment(rawFrom).quarter()
  const currentMonth = moment(rawFrom).month()
  const currentWeek = moment(rawFrom).week()

  let from, to
  if (lastCurrentUnit === 'year') {
    if (lastOrCurrent_ === 'current') {
      from = moment(from).year(currentYear).startOf('year').format('YYYY-MM-DD')
      to = moment(from).year(currentYear).endOf('year').format('YYYY-MM-DD')
    }
    else {
      from = moment(from).year(currentYear - 1).startOf('year').format('YYYY-MM-DD')
      to = moment(from).year(currentYear - 1).endOf('year').format('YYYY-MM-DD')
    }
  }
  else if (lastCurrentUnit === 'quarter') {
    if (lastOrCurrent_ === 'current') {
      from = moment(from).quarter(currentQuarter).startOf('quarter').format('YYYY-MM-DD')
      to = moment(from).quarter(currentQuarter).endOf('quarter').format('YYYY-MM-DD')
    }
    else {
      from = moment(from).quarter(currentQuarter).subtract(1, 'years').startOf('quarter').format('YYYY-MM-DD')
      to = moment(from).quarter(currentQuarter).subtract(1, 'years').endOf('month').format('YYYY-MM-DD')
    }
  }
  else if (lastCurrentUnit === 'month') {
    if (lastOrCurrent_ === 'current') {
      from = moment(from).month(currentMonth).startOf('month').format('YYYY-MM-DD')
      to = moment(from).month(currentMonth).endOf('month').format('YYYY-MM-DD')
    }
    else {
      from = moment(from).month(currentMonth).subtract(1, 'years').startOf('month').format('YYYY-MM-DD')
      to = moment(from).month(currentMonth).subtract(1, 'years').endOf('month').format('YYYY-MM-DD')
    }
  }
  else if (lastCurrentUnit === 'previousQuarter') {
    if (lastOrCurrent_ === 'current') {
      from = moment(from).month(currentMonth).startOf('month').format('YYYY-MM-DD')
      to = moment(from).month(currentMonth).endOf('month').format('YYYY-MM-DD')
    }
    else {
      from = moment(from).subtract(1, 'quarters').startOf('quarter').format('YYYY-MM-DD')
      to = moment(from).subtract(1, 'quarters').endOf('quarter').format('YYYY-MM-DD')
    }
  }
  else if (lastCurrentUnit === 'previousMonth') {
    if (lastOrCurrent_ === 'current') {
      from = moment(from).month(currentMonth).startOf('month').format('YYYY-MM-DD')
      to = moment(from).month(currentMonth).endOf('month').format('YYYY-MM-DD')
    }
    else {
      from = moment(from).subtract(1, 'months').startOf('month').format('YYYY-MM-DD')
      to = moment(from).subtract(1, 'months').endOf('month').format('YYYY-MM-DD')
    }
  }
  else if (lastCurrentUnit === 'previousWeek') {
    if (lastOrCurrent_ === 'current') {
      from = moment(from).week(currentWeek).startOf('week').format('YYYY-MM-DD')
      to = moment(from).week(currentWeek).endOf('week').format('YYYY-MM-DD')
    }
    else {
      from = moment(from).subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD')
      to = moment(from).subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD')
    }
  }
  else if (lastCurrentUnit === 'previousDay') {
    if (lastOrCurrent_ === 'current') {
      from = moment(from).startOf('day').format('YYYY-MM-DD')
      to = moment(from).endOf('day').format('YYYY-MM-DD')
    }
    else {
      from = moment(from).subtract(1, 'days').startOf('day').format('YYYY-MM-DD')
      to = moment(from).subtract(1, 'days').endOf('day').format('YYYY-MM-DD')
    }
  }
  else {
    throw new Error('INVALID_lastCurrentUnit')
  }

  return { from, to }
}

export default {
  jqls: [
    {
      type: 'prepareParams',
      defaultResult: {},
      async prepareParams(params, prevResult: Result, user): Promise<IQueryParams> {
        const moment = prevResult.moment = (await this.preparePackages(user)).moment
        const subqueries = (params.subqueries = params.subqueries || {})

        function guessfirstTableLastOrCurrent(): 'last' | 'current' {
          if (subqueries.sorting && subqueries.sorting !== true && 'value' in subqueries.sorting) {
            const sortingValue = Array.isArray(subqueries.sorting.value) ? subqueries.sorting.value[0] : subqueries.sorting.value
            const variablePart = sortingValue.substr(0, sortingValue.lastIndexOf('_')) as string
            return variablePart.endsWith('Last') ? 'last' : 'current'
          }
          return 'current'
        }

        function guessSortingExpression(sortingValue: string) {
          const variablePart = sortingValue.substr(0, sortingValue.lastIndexOf('_'))
          const sortingDirection = sortingValue.substr(sortingValue.lastIndexOf('_') + 1)

          if (!['ASC', 'DESC'].includes(sortingDirection)) {
            throw new Error(`cannot guess sortingDirection`)
          }

          // here will handle 2 special cases : metric , summaryVariable
          const metricRegex = new RegExp('metric[0-9]+')
          const summaryVariableRegex = new RegExp('summaryVariable')

          let finalColumnName: string
          // summaryVariable case
          if (summaryVariableRegex.test(variablePart)) {
            finalColumnName = variablePart.replace('summaryVariable', (subqueries.summaryVariable as any).value)
          }
          else if (metricRegex.test(variablePart)) {
            const metricPart = variablePart.match(metricRegex)[0]
            const metricValue = (subqueries[metricPart] as any).value
            finalColumnName = variablePart.replace(metricPart, metricValue)
          }
          else {
            finalColumnName = variablePart
          }

          if (finalColumnName.endsWith('Last') || finalColumnName.endsWith('Current')) {
            finalColumnName = finalColumnName.replace('Last','')
            finalColumnName = finalColumnName.replace('Current','')
          }

          return new OrderBy(finalColumnName, sortingDirection as 'ASC' | 'DESC')
        }

        if (!subqueries.groupByEntity || !(subqueries.groupByEntity !== true && 'value' in subqueries.groupByEntity)) throw new Error('MISSING_groupByVariable')
        if (!subqueries.topX || !(subqueries.topX !== true && 'value' in subqueries.topX)) throw new Error('MISSING_topX')

        // -----------------------------groupBy variable
        const groupByEntity = subqueries.groupByEntity.value // should be shipper/consignee/agent/controllingCustomer/carrier
        const codeColumnName = prevResult.codeColumnName = groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierCode` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyCode`
        const nameColumnName = prevResult.nameColumnName = (groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierName` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyShortNameInReport`) + 'Any'
        const topX = subqueries.topX.value

        // ---------------------summaryVariables
        let summaryVariables: string[] = []
        if (subqueries.summaryVariables && subqueries.summaryVariables !== true && 'value' in subqueries.summaryVariables) {
          // sumamary variable
          summaryVariables = Array.isArray(subqueries.summaryVariables.value) ? subqueries.summaryVariables.value : [subqueries.summaryVariables.value]
        }
        if (subqueries.summaryVariable && subqueries.summaryVariable !== true && 'value' in subqueries.summaryVariable) {
          summaryVariables = [...new Set([...summaryVariables, subqueries.summaryVariable.value] as string[])]
        }
        if (!(summaryVariables && summaryVariables.length)) {
          throw new Error('MISSING_summaryVariables')
        }
        prevResult.summaryVariables = summaryVariables

        const lastCurrentUnit = prevResult.lastCurrentUnit = subqueries.lastCurrentUnit && subqueries.lastCurrentUnit !== true && 'value' in subqueries.lastCurrentUnit ? subqueries.lastCurrentUnit.value : '' // should be chargeableWeight/cbm/grossWeight/totalShipment
        // ------------------------------
        const firstTableLastOrCurrent = prevResult.firstTableLastOrCurrent = guessfirstTableLastOrCurrent()
        const { from, to } = calculateLastCurrent(subqueries, moment, lastCurrentUnit, firstTableLastOrCurrent)

        subqueries.date = { from, to }

        // ----------------------- filter
        subqueries[`${codeColumnName}IsNotNull`] = { // shoulebe carrierIsNotNull/shipperIsNotNull/controllingCustomerIsNotNull
          value: true
        }

        params.fields = [
          // select Month statistics
          ...summaryVariables.map(variable => `${variable}Month`),
          codeColumnName,
          nameColumnName,
        ]

        // group by
        params.groupBy = [codeColumnName]

        params.limit = topX

        if (subqueries.sorting && subqueries.sorting !== true && 'value' in subqueries.sorting) {
          const sortingValue = Array.isArray(subqueries.sorting.value) ? subqueries.sorting.value[0] : subqueries.sorting.value
          const sortingExpression = guessSortingExpression(sortingValue)
          params.sorting = [sortingExpression]
        }

        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['shipment', 'shipment'],
      onResult(res, params, prevResult: Result): Result {
        const { moment, codeColumnName, nameColumnName, summaryVariables } = prevResult
        const groupByVariables = [codeColumnName, nameColumnName]
        prevResult.result = res.map(row => {
          const row_: any = groupByVariables.reduce((r, v) => {
            r[v] = row[v]
            return r
          }, {})
          for (const variable of summaryVariables) {
            for (const m of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
              const month = m === 12 ? 'total' : moment().month(m).format('MMMM')
              const key = `${month}_${variable}`
              row_[key] = row[key]
            }
          }
          return row_
        })
        return prevResult
      }
    },
    {
      type: 'prepareParams',
      prepareParams(params, prevResult: Result): IQueryParams {
        const { moment, lastCurrentUnit, codeColumnName, firstTableLastOrCurrent, result } = prevResult
        const subqueries = (params.subqueries = params.subqueries || {})

        const secondTableLastOrCurrent = firstTableLastOrCurrent === 'last' ? 'current' : 'last'
        const { from, to } = calculateLastCurrent(subqueries, moment, lastCurrentUnit, secondTableLastOrCurrent)
        subqueries.date = { from, to }

        const codeList = result.map(r => r[codeColumnName])
        subqueries[codeColumnName] = { value: codeList }
        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['shipment', 'shipment'],
      onResult(res, params, { moment, codeColumnName, nameColumnName, firstTableLastOrCurrent, summaryVariables, result }: Result): any[] {
        let last: any[], current: any[]
        if (firstTableLastOrCurrent === 'last') {
          last = result
          current = res
        }
        else {
          last = res
          current = result
        }

        return result.map(row => {
          const row_: any = { code: row[codeColumnName], name: row[nameColumnName] }
          const lastRow = last.find(r => r[codeColumnName] === row[codeColumnName]) || {}
          const currentRow = current.find(r => r[codeColumnName] === row[codeColumnName]) || {}
          for (const variable of summaryVariables) {
            for (const type of ['Last', 'Current']) {
              const r = type === 'Last' ? lastRow : currentRow
              let total = 0
              for (const m of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) {
                const month = moment().month(m).format('MMMM')
                const key = `${month}_${variable}`
                let value = +r[key]
                if (isNaN(value)) value = 0
                row_[`${key}${type}`] = value
                total += value
              }
              row_[`total_${variable}${type}`] = total
            }
          }
          return row_
        })
      }
    }
  ],
  filters: [
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
} as JqlDefinition

/* import {
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
  IColumn,
  ParameterExpression,
  IResultColumn,
  IExpression,
} from 'node-jql'
import { parseCode } from 'utils/function'



function prepareFirstParam(): Function {

  return function(require, session, params) {

    const { moment } = params.packages
    const { OrderBy } = require('node-jql')

    const subqueries = (params.subqueries = params.subqueries || {})

    function guessfirstTableLastOrCurrent(subqueries): ('last' | 'current') {
      if (subqueries.sorting && subqueries.sorting.value) {

        const sortingValue = Array.isArray(subqueries.sorting.value) ? subqueries.sorting.value[0] : subqueries.sorting.value


        const variablePart = sortingValue.substr(0, sortingValue.lastIndexOf('_')) as string
        const sortingDirection = sortingValue.substr(sortingValue.lastIndexOf('_') + 1) as string

        return variablePart.endsWith('Last') ? 'last' : 'current'
      }

      return 'current'

    }

    function calculateLastCurrent(lastCurrentUnit: string, lastOrCurrent_: 'last' | 'current') {
      const rawFrom = subqueries.date.from

      const currentYear = moment(rawFrom).year()
      const currentQuarter = moment(rawFrom).quarter()
      const currentMonth = moment(rawFrom).month()
      const currentWeek = moment(rawFrom).week()

      let from, to

      if (lastCurrentUnit === 'year') {

        if (lastOrCurrent_ === 'current') {
          from = moment(from).year(currentYear).startOf('year').format('YYYY-MM-DD')
          to = moment(from).year(currentYear).endOf('year').format('YYYY-MM-DD')
        }
        else {
          from = moment(from).year(currentYear - 1).startOf('year').format('YYYY-MM-DD')
          to = moment(from).year(currentYear - 1).endOf('year').format('YYYY-MM-DD')
        }
      }
      else if (lastCurrentUnit === 'quarter') {

        if (lastOrCurrent_ === 'current') {
          from = moment(from).quarter(currentQuarter).startOf('quarter').format('YYYY-MM-DD')
          to = moment(from).quarter(currentQuarter).endOf('quarter').format('YYYY-MM-DD')
        }
        else {
          from = moment(from).quarter(currentQuarter).subtract(1, 'years').startOf('quarter').format('YYYY-MM-DD')
          to = moment(from).quarter(currentQuarter).subtract(1, 'years').endOf('month').format('YYYY-MM-DD')
        }

      }
      else if (lastCurrentUnit === 'month') {

        if (lastOrCurrent_ === 'current') {
          from = moment(from).month(currentMonth).startOf('month').format('YYYY-MM-DD')
          to = moment(from).month(currentMonth).endOf('month').format('YYYY-MM-DD')

        }

        else {
          from = moment(from).month(currentMonth).subtract(1, 'years').startOf('month').format('YYYY-MM-DD')
          to = moment(from).month(currentMonth).subtract(1, 'years').endOf('month').format('YYYY-MM-DD')
        }

      }
      else if (lastCurrentUnit === 'previousQuarter') {

        if (lastOrCurrent_ === 'current') {
          from = moment(from).month(currentMonth).startOf('month').format('YYYY-MM-DD')
          to = moment(from).month(currentMonth).endOf('month').format('YYYY-MM-DD')

        }

        else {
          from = moment(from).subtract(1, 'quarters').startOf('quarter').format('YYYY-MM-DD')
          to = moment(from).subtract(1, 'quarters').endOf('quarter').format('YYYY-MM-DD')
        }
      }
      else if (lastCurrentUnit === 'previousMonth') {


        if (lastOrCurrent_ === 'current') {
          from = moment(from).month(currentMonth).startOf('month').format('YYYY-MM-DD')
          to = moment(from).month(currentMonth).endOf('month').format('YYYY-MM-DD')

        }

        else {
          from = moment(from).subtract(1, 'months').startOf('month').format('YYYY-MM-DD')
          to = moment(from).subtract(1, 'months').endOf('month').format('YYYY-MM-DD')
        }
      }
      else if (lastCurrentUnit === 'previousWeek') {


        if (lastOrCurrent_ === 'current') {
          from = moment(from).week(currentWeek).startOf('week').format('YYYY-MM-DD')
          to = moment(from).week(currentWeek).endOf('week').format('YYYY-MM-DD')

        }

        else {
          from = moment(from).subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD')
          to = moment(from).subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD')
        }
      }
      else if (lastCurrentUnit === 'previousDay') {

        if (lastOrCurrent_ === 'current') {
          from = moment(from).startOf('day').format('YYYY-MM-DD')
          to = moment(from).endOf('day').format('YYYY-MM-DD')

        }

        else {
          from = moment(from).subtract(1, 'days').startOf('day').format('YYYY-MM-DD')
          to = moment(from).subtract(1, 'days').endOf('day').format('YYYY-MM-DD')
        }

      }

      else {
        throw new Error('INVALID_lastCurrentUnit')
      }

      return { from, to }
    }

    function guessSortingExpression(sortingValue: string, subqueries) {
      const variablePart = sortingValue.substr(0, sortingValue.lastIndexOf('_'))
      const sortingDirection = sortingValue.substr(sortingValue.lastIndexOf('_') + 1)

      if (!['ASC', 'DESC'].includes(sortingDirection)) {
        throw new Error(`cannot guess sortingDirection`)
      }

      // here will handle 2 special cases : metric , summaryVariable

      const metricRegex = new RegExp('metric[0-9]+')
      const summaryVariableRegex = new RegExp('summaryVariable')

      let finalColumnName: string

      // summaryVariable case
      if (summaryVariableRegex.test(variablePart)) {
        finalColumnName = variablePart.replace('summaryVariable', subqueries.summaryVariable.value)
      }

      //
      else if (metricRegex.test(variablePart)) {
        const metricPart = variablePart.match(metricRegex)[0]
        const metricValue = subqueries[metricPart].value
        finalColumnName = variablePart.replace(metricPart, metricValue)
      }

      else {
        finalColumnName = variablePart
      }

      if (finalColumnName.endsWith('Last') || finalColumnName.endsWith('Current'))
      {
        finalColumnName = finalColumnName.replace('Last','')
        finalColumnName = finalColumnName.replace('Current','')
      }

      return new OrderBy(finalColumnName, sortingDirection as 'ASC' | 'DESC')
    }

    if (!subqueries.groupByEntity || !subqueries.groupByEntity.value) throw new Error('MISSING_groupByVariable')
    if (!subqueries.topX || !subqueries.topX.value) throw new Error('MISSING_topX')

    // -----------------------------groupBy variable

    const groupByEntity = subqueries.groupByEntity.value // should be shipper/consignee/agent/controllingCustomer/carrier

    const codeColumnName = groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierCode` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyCode`
    const nameColumnName = (groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierName` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyShortNameInReport`) + 'Any'


    const topX = subqueries.topX.value

    // ---------------------summaryVariables

    let summaryVariables: string[] = []
    if (subqueries.summaryVariables && subqueries.summaryVariables.value) {
      // sumamary variable
      summaryVariables = Array.isArray(subqueries.summaryVariables.value) ? subqueries.summaryVariables.value : [subqueries.summaryVariables.value]
    }

    if (subqueries.summaryVariable && subqueries.summaryVariable.value) {
      summaryVariables = [...new Set([...summaryVariables, subqueries.summaryVariable.value] as string[])]
    }

    if (!(summaryVariables && summaryVariables.length)) {
      throw new Error('MISSING_summaryVariables')
    }

    const lastCurrentUnit = subqueries.lastCurrentUnit.value // should be chargeableWeight/cbm/grossWeight/totalShipment
    // ------------------------------

    const firstTableLastOrCurrent = guessfirstTableLastOrCurrent(subqueries)

    const { from, to } = calculateLastCurrent(lastCurrentUnit, firstTableLastOrCurrent)

    subqueries.date = {
      from,
      to
    }


    // ----------------------- filter
    subqueries[`${codeColumnName}IsNotNull`] = {// shoulebe carrierIsNotNull/shipperIsNotNull/controllingCustomerIsNotNull
      value: true
    }

    params.fields = [
      // select Month statistics
      ...summaryVariables.map(variable => `${variable}Month`),
      codeColumnName,
      nameColumnName
    ]

    // group by
    params.groupBy = [
      codeColumnName,
    ]

    params.limit = topX


    if (subqueries.sorting && subqueries.sorting.value) {

      const sortingValue = Array.isArray(subqueries.sorting.value) ? subqueries.sorting.value[0] : subqueries.sorting.value
      const sortingExpression = guessSortingExpression(sortingValue, subqueries)

      params.sorting = [
        sortingExpression
      ]

    }


    console.log(`papapapa`)
    console.log(params)
    return params
  }

}




function prepareSecondParam(): Function {

  return async function(require, session, params) {

    const { moment } = params.packages
    const { Resultset } = require('node-jql-core')
    const { OrderBy } = require('node-jql')

    const subqueries = (params.subqueries = params.subqueries || {})

    function guessfirstTableLastOrCurrent(subqueries): ('last' | 'current') {
      if (subqueries.sorting && subqueries.sorting.value) {

        const sortingValue = Array.isArray(subqueries.sorting.value) ? subqueries.sorting.value[0] : subqueries.sorting.value

        const variablePart = sortingValue.substr(0, sortingValue.lastIndexOf('_')) as string
        const sortingDirection = sortingValue.substr(sortingValue.lastIndexOf('_') + 1) as string

        return variablePart.endsWith('Last') ? 'last' : 'current'
      }

      return 'current'

    }

    function calculateLastCurrent(lastCurrentUnit: string, lastOrCurrent_: 'last' | 'current') {
      const rawFrom = subqueries.date.from

      const currentYear = moment(rawFrom).year()
      const currentQuarter = moment(rawFrom).quarter()
      const currentMonth = moment(rawFrom).month()
      const currentWeek = moment(rawFrom).week()

      let from, to

      if (lastCurrentUnit === 'year') {

        if (lastOrCurrent_ === 'current') {
          from = moment(from).year(currentYear).startOf('year').format('YYYY-MM-DD')
          to = moment(from).year(currentYear).endOf('year').format('YYYY-MM-DD')
        }
        else {
          from = moment(from).year(currentYear - 1).startOf('year').format('YYYY-MM-DD')
          to = moment(from).year(currentYear - 1).endOf('year').format('YYYY-MM-DD')
        }
      }
      else if (lastCurrentUnit === 'quarter') {

        if (lastOrCurrent_ === 'current') {
          from = moment(from).quarter(currentQuarter).startOf('quarter').format('YYYY-MM-DD')
          to = moment(from).quarter(currentQuarter).endOf('quarter').format('YYYY-MM-DD')
        }
        else {
          from = moment(from).quarter(currentQuarter).subtract(1, 'years').startOf('quarter').format('YYYY-MM-DD')
          to = moment(from).quarter(currentQuarter).subtract(1, 'years').endOf('month').format('YYYY-MM-DD')
        }

      }
      else if (lastCurrentUnit === 'month') {

        if (lastOrCurrent_ === 'current') {
          from = moment(from).month(currentMonth).startOf('month').format('YYYY-MM-DD')
          to = moment(from).month(currentMonth).endOf('month').format('YYYY-MM-DD')

        }

        else {
          from = moment(from).month(currentMonth).subtract(1, 'years').startOf('month').format('YYYY-MM-DD')
          to = moment(from).month(currentMonth).subtract(1, 'years').endOf('month').format('YYYY-MM-DD')
        }

      }
      else if (lastCurrentUnit === 'previousQuarter') {

        if (lastOrCurrent_ === 'current') {
          from = moment(from).month(currentMonth).startOf('month').format('YYYY-MM-DD')
          to = moment(from).month(currentMonth).endOf('month').format('YYYY-MM-DD')

        }

        else {
          from = moment(from).subtract(1, 'quarters').startOf('quarter').format('YYYY-MM-DD')
          to = moment(from).subtract(1, 'quarters').endOf('quarter').format('YYYY-MM-DD')
        }
      }
      else if (lastCurrentUnit === 'previousMonth') {


        if (lastOrCurrent_ === 'current') {
          from = moment(from).month(currentMonth).startOf('month').format('YYYY-MM-DD')
          to = moment(from).month(currentMonth).endOf('month').format('YYYY-MM-DD')

        }

        else {
          from = moment(from).subtract(1, 'months').startOf('month').format('YYYY-MM-DD')
          to = moment(from).subtract(1, 'months').endOf('month').format('YYYY-MM-DD')
        }
      }
      else if (lastCurrentUnit === 'previousWeek') {


        if (lastOrCurrent_ === 'current') {
          from = moment(from).week(currentWeek).startOf('week').format('YYYY-MM-DD')
          to = moment(from).week(currentWeek).endOf('week').format('YYYY-MM-DD')

        }

        else {
          from = moment(from).subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD')
          to = moment(from).subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD')
        }
      }
      else if (lastCurrentUnit === 'previousDay') {

        if (lastOrCurrent_ === 'current') {
          from = moment(from).startOf('day').format('YYYY-MM-DD')
          to = moment(from).endOf('day').format('YYYY-MM-DD')

        }

        else {
          from = moment(from).subtract(1, 'days').startOf('day').format('YYYY-MM-DD')
          to = moment(from).subtract(1, 'days').endOf('day').format('YYYY-MM-DD')
        }

      }

      else {
        throw new Error('INVALID_lastCurrentUnit')
      }

      return { from, to }
    }


    if (!subqueries.groupByEntity || !subqueries.groupByEntity.value) throw new Error('MISSING_groupByVariable')
    if (!subqueries.topX || !subqueries.topX.value) throw new Error('MISSING_topX')

    // -----------------------------groupBy variable

    const groupByEntity = subqueries.groupByEntity.value // should be shipper/consignee/agent/controllingCustomer/carrier

    const codeColumnName = groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierCode` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyCode`
    const nameColumnName = (groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierName` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyShortNameInReport`) + 'Any'


    const topX = subqueries.topX.value

    // ---------------------summaryVariables

    let summaryVariables: string[] = []
    if (subqueries.summaryVariables && subqueries.summaryVariables.value) {
      // sumamary variable
      summaryVariables = Array.isArray(subqueries.summaryVariables.value) ? subqueries.summaryVariables.value : [subqueries.summaryVariables.value]
    }

    if (subqueries.summaryVariable && subqueries.summaryVariable.value) {
      summaryVariables = [...new Set([...summaryVariables, subqueries.summaryVariable.value] as string[])]
    }

    if (!(summaryVariables && summaryVariables.length)) {
      throw new Error('MISSING_summaryVariables')
    }

    const lastCurrentUnit = subqueries.lastCurrentUnit.value // should be chargeableWeight/cbm/grossWeight/totalShipment
    // ------------------------------

    const firstTableLastOrCurrent = guessfirstTableLastOrCurrent(subqueries)
    const secondTableLastOrCurrent = firstTableLastOrCurrent === 'last' ? 'current' : 'last'

    const { from, to } = calculateLastCurrent(lastCurrentUnit, secondTableLastOrCurrent)

    subqueries.date = {
      from,
      to
    }


    // ----------------------- filter
    subqueries[`${codeColumnName}IsNotNull`] = {// shoulebe carrierIsNotNull/shipperIsNotNull/controllingCustomerIsNotNull
      value: true
    }

    params.fields = [
      // select Month statistics
      ...summaryVariables.map(variable => `${variable}Month`),
      codeColumnName,
      nameColumnName
    ]

    // group by
    params.groupBy = [
      codeColumnName,
    ]

    params.limit = topX


    subqueries.sorting = []


    const resultList = new Resultset(await session.query(new Query(firstTableLastOrCurrent))).toArray() as any[]

    console.log(resultList)


    const codeList = resultList.map(result => result[codeColumnName])

    subqueries[codeColumnName] = {
      value : codeList
    }

    console.log(codeList)



    console.log(`testest`)
    console.log(params)
    return params
  }

}




function createFirstTable() {

  return function(require, session, params) {

    function guessfirstTableLastOrCurrent(subqueries): ('last' | 'current') {
      if (subqueries.sorting && subqueries.sorting.value) {

        const sortingValue = Array.isArray(subqueries.sorting.value) ? subqueries.sorting.value[0] : subqueries.sorting.value

        const variablePart = sortingValue.substr(0, sortingValue.lastIndexOf('_')) as string
        const sortingDirection = sortingValue.substr(sortingValue.lastIndexOf('_') + 1) as string

        return variablePart.endsWith('Last') ? 'last' : 'current'
      }

      return 'current'

    }



    const {
      Query,
      ResultColumn,
      ColumnExpression,
      FunctionExpression,
      Value,
      InsertJQL,
      FromTable,
      IColumn,
      CreateTableJQL
    } = require('node-jql')

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

    const firstTableLastOrCurrent = guessfirstTableLastOrCurrent(subqueries)

    const groupByEntity = subqueries.groupByEntity.value // should be shipper/consignee/agent/controllingCustomer/carrier

    const codeColumnName = groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierCode` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyCode`
    const nameColumnName = (groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierName` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyShortNameInReport`) + 'Any'


    let summaryVariables: string[] = []
    if (subqueries.summaryVariables && subqueries.summaryVariables.value) {
      // sumamary variable
      summaryVariables = Array.isArray(subqueries.summaryVariables.value) ? subqueries.summaryVariables.value : [subqueries.summaryVariables.value]
    }

    if (subqueries.summaryVariable && subqueries.summaryVariable.value) {
      summaryVariables = [...new Set([...summaryVariables, subqueries.summaryVariable.value] as string[])]
    }

    if (!(summaryVariables && summaryVariables.length)) {
      throw new Error('MISSING_summaryVariables')
    }


    const columns = [
      { name: codeColumnName, type: 'string' },
      { name: nameColumnName, type: 'string' },
    ]

    const lastOrCurrentEnd = firstTableLastOrCurrent === 'last' ? 'Last' : 'Current'

    summaryVariables.map(variable => {

      months.map(month => {
        // January_cbm
        columns.push({ name: `${month}_${variable}`, type: 'number' })
      })

      // total_cbm
      columns.push({ name: `total_${variable}`, type: 'number' })


    })

    return new CreateTableJQL({
      name: firstTableLastOrCurrent,
      $temporary: true,
      $as: new Query({

        $from: new FromTable(
          {
            method: 'POST',
            url: 'api/shipment/query/shipment',
            columns
          },
          'shipment'
        )

      })

    })


  }

}



function createSecondTable()
{
  return function(require, session, params) {

    function guessfirstTableLastOrCurrent(subqueries): ('last' | 'current') {
      if (subqueries.sorting && subqueries.sorting.value) {

        const sortingValue = Array.isArray(subqueries.sorting.value) ? subqueries.sorting.value[0] : subqueries.sorting.value

        const variablePart = sortingValue.substr(0, sortingValue.lastIndexOf('_')) as string
        const sortingDirection = sortingValue.substr(sortingValue.lastIndexOf('_') + 1) as string

        return variablePart.endsWith('Last') ? 'last' : 'current'
      }

      return 'current'

    }


    const {
      Query,
      ResultColumn,
      ColumnExpression,
      FunctionExpression,
      Value,
      InsertJQL,
      FromTable,
      IColumn,
      CreateTableJQL
    } = require('node-jql')

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

    const firstTableLastOrCurrent = guessfirstTableLastOrCurrent(subqueries)
    const secondTableLastOrCurrent = firstTableLastOrCurrent === 'last' ? 'current' : 'last'

    const groupByEntity = subqueries.groupByEntity.value // should be shipper/consignee/agent/controllingCustomer/carrier

    const codeColumnName = groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierCode` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyCode`
    const nameColumnName = (groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierName` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyShortNameInReport`) + 'Any'


    let summaryVariables: string[] = []
    if (subqueries.summaryVariables && subqueries.summaryVariables.value) {
      // sumamary variable
      summaryVariables = Array.isArray(subqueries.summaryVariables.value) ? subqueries.summaryVariables.value : [subqueries.summaryVariables.value]
    }

    if (subqueries.summaryVariable && subqueries.summaryVariable.value) {
      summaryVariables = [...new Set([...summaryVariables, subqueries.summaryVariable.value] as string[])]
    }

    if (!(summaryVariables && summaryVariables.length)) {
      throw new Error('MISSING_summaryVariables')
    }


    const columns = [
      { name: codeColumnName, type: 'string' },
      { name: nameColumnName, type: 'string' },
    ]

    const lastOrCurrentEnd = secondTableLastOrCurrent === 'last' ? 'Last' : 'Current'

    summaryVariables.map(variable => {

      months.map(month => {
        // January_cbm
        columns.push({ name: `${month}_${variable}`, type: 'number' })
      })

      // total_cbm
      columns.push({ name: `total_${variable}`, type: 'number' })


    })

    return new CreateTableJQL({
      name: secondTableLastOrCurrent,
      $temporary: true,
      $as: new Query({

        $from: new FromTable(
          {
            method: 'POST',
            url: 'api/shipment/query/shipment',
            columns
          },
          'shipment'
        )

      })

    })


  }
}


function finalQuery()
{

  return function(require, session, params) {


    function expressionValue(exrepssion : IExpression)
    {

      return new FunctionExpression('IFNULL',exrepssion,new Value(0))
    }

    function guessfirstTableLastOrCurrent(subqueries): ('last' | 'current') {
      if (subqueries.sorting && subqueries.sorting.value) {

        const sortingValue = Array.isArray(subqueries.sorting.value) ? subqueries.sorting.value[0] : subqueries.sorting.value

        const variablePart = sortingValue.substr(0, sortingValue.lastIndexOf('_')) as string
        const sortingDirection = sortingValue.substr(sortingValue.lastIndexOf('_') + 1) as string

        return variablePart.endsWith('Last') ? 'last' : 'current'
      }

      return 'current'

    }

    const subqueries = (params.subqueries = params.subqueries || {})
    const firstTableLastOrCurrent = guessfirstTableLastOrCurrent(subqueries)
    const secondTableLastOrCurrent = firstTableLastOrCurrent === 'last' ? 'current' : 'last'

    const groupByEntity = subqueries.groupByEntity.value // should be shipper/consignee/agent/controllingCustomer/carrier

    const codeColumnName = groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierCode` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyCode`
    const nameColumnName = (groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierName` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyShortNameInReport`) + 'Any'


    let summaryVariables: string[] = []
    if (subqueries.summaryVariables && subqueries.summaryVariables.value) {
      // sumamary variable
      summaryVariables = Array.isArray(subqueries.summaryVariables.value) ? subqueries.summaryVariables.value : [subqueries.summaryVariables.value]
    }

    if (subqueries.summaryVariable && subqueries.summaryVariable.value) {
      summaryVariables = [...new Set([...summaryVariables, subqueries.summaryVariable.value] as string[])]
    }

    if (!(summaryVariables && summaryVariables.length)) {
      throw new Error('MISSING_summaryVariables')
    }


    const $select = [
      new ResultColumn(new ColumnExpression(firstTableLastOrCurrent,codeColumnName),'code'),
      new ResultColumn(new ColumnExpression(firstTableLastOrCurrent,nameColumnName),'name')
    ] as ResultColumn[]

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



    summaryVariables.map(variable => {

      months.map(month => {

        ['last', 'current'].map(lastOrCurrent => {

          const lastOrCurrentEnd = lastOrCurrent === 'last' ? 'Last' : 'Current'

          // January_cbmLast
          $select.push(new ResultColumn(expressionValue(new ColumnExpression(lastOrCurrent,`${month}_${variable}`)),`${month}_${variable}${lastOrCurrentEnd}`))
        })

      });

      // total_cbmLast
      ['last', 'current'].map(lastOrCurrent => {

        const lastOrCurrentEnd = lastOrCurrent === 'last' ? 'Last' : 'Current'

        $select.push(new ResultColumn(expressionValue(new ColumnExpression(lastOrCurrent,`total_${variable}`)),`total_${variable}${lastOrCurrentEnd}`))
      })

    })




    return new Query({

      $select,

      $from : new FromTable({
        table : firstTableLastOrCurrent as string,

        joinClauses : [
          {

            operator : 'LEFT',
            table : secondTableLastOrCurrent,
            $on : [
              new BinaryExpression(new ColumnExpression(firstTableLastOrCurrent,codeColumnName),'=',new ColumnExpression(secondTableLastOrCurrent,codeColumnName))
            ]
          }
        ]
      })




    })
  }
}




export default [


  [prepareFirstParam(), createFirstTable()],
  [prepareSecondParam(), createSecondTable()],

  // new Query({
  //   $from : 'last'
  // })

  finalQuery()

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
] */
