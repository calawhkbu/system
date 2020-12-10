import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import Moment = require('moment')
import { OrderBy } from 'node-jql'
import { expandGroupEntity, expandSummaryVariable, calculateLastCurrent } from 'utils/card'
import { ERROR } from 'utils/error'

interface Result {
  moment: typeof Moment
  groupByEntity: string
  codeColumnName: string
  nameColumnName: string
  summaryVariables: string[]
}

export default {
  jqls: [
    {
      type: 'prepareParams',
      defaultResult: {},
      async prepareParams(params, prevResult: Result, user): Promise<IQueryParams> {
        const moment = prevResult.moment = (await this.preparePackages(user)).moment

        // function calculateLastCurrent(lastCurrentUnit: string) {
        //   if (!subqueries.date || !(subqueries.date !== true && 'from' in subqueries.date)) {
        //     throw new BadRequestException('MISSING_DATE')
        //   }

        //   const from = subqueries.date.from
        //   const currentYear = moment(from).year()
        //   const currentQuarter = moment(from).quarter()
        //   const currentMonth = moment(from).month()
        //   const currentWeek = moment(from).week()

        //   let lastFrom, lastTo, currentFrom, currentTo
        //   if (lastCurrentUnit === 'year') {
        //     lastFrom = moment(from).year(currentYear - 1).startOf('year').format('YYYY-MM-DD')
        //     lastTo = moment(from).year(currentYear - 1).endOf('year').format('YYYY-MM-DD')
        //     currentFrom = moment(from).year(currentYear).startOf('year').format('YYYY-MM-DD')
        //     currentTo = moment(from).year(currentYear).endOf('year').format('YYYY-MM-DD')
        //   }
        //   else if (lastCurrentUnit === 'quarter') {
        //     // special case !!!
        //     lastFrom = moment(from).quarter(currentQuarter).subtract(1, 'years').startOf('quarter').format('YYYY-MM-DD')
        //     lastTo = moment(from).quarter(currentQuarter).subtract(1, 'years').endOf('month').format('YYYY-MM-DD')
        //     currentFrom = moment(from).quarter(currentQuarter).startOf('quarter').format('YYYY-MM-DD')
        //     currentTo = moment(from).quarter(currentQuarter).endOf('quarter').format('YYYY-MM-DD')
        //   }
        //   else if (lastCurrentUnit === 'month') {
        //     // special case !!!
        //     lastFrom = moment(from).month(currentMonth).subtract(1, 'years').startOf('month').format('YYYY-MM-DD')
        //     lastTo = moment(from).month(currentMonth).subtract(1, 'years').endOf('month').format('YYYY-MM-DD')
        //     currentFrom = moment(from).month(currentMonth).startOf('month').format('YYYY-MM-DD')
        //     currentTo = moment(from).month(currentMonth).endOf('month').format('YYYY-MM-DD')
        //   }
        //   else if (lastCurrentUnit === 'previousQuarter') {
        //     lastFrom = moment(from).subtract(1, 'quarters').startOf('quarter').format('YYYY-MM-DD')
        //     lastTo = moment(from).subtract(1, 'quarters').endOf('quarter').format('YYYY-MM-DD')
        //     currentFrom = moment(from).quarter(currentQuarter).startOf('quarter').format('YYYY-MM-DD')
        //     currentTo = moment(from).quarter(currentQuarter).endOf('quarter').format('YYYY-MM-DD')
        //   }
        //   else if (lastCurrentUnit === 'previousMonth') {
        //     lastFrom = moment(from).subtract(1, 'months').startOf('month').format('YYYY-MM-DD')
        //     lastTo = moment(from).subtract(1, 'months').endOf('month').format('YYYY-MM-DD')
        //     currentFrom = moment(from).month(currentMonth).startOf('month').format('YYYY-MM-DD')
        //     currentTo = moment(from).month(currentMonth).endOf('month').format('YYYY-MM-DD')
        //   }
        //   else if (lastCurrentUnit === 'previousWeek') {
        //     lastFrom = moment(from).subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD')
        //     lastTo = moment(from).subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD')
        //     currentFrom = moment(from).week(currentWeek).startOf('week').format('YYYY-MM-DD')
        //     currentTo = moment(from).week(currentWeek).endOf('week').format('YYYY-MM-DD')
        //   }
        //   else if (lastCurrentUnit === 'previousDay') {
        //     lastFrom = moment(from).subtract(1, 'days').startOf('day').format('YYYY-MM-DD')
        //     lastTo = moment(from).subtract(1, 'days').endOf('day').format('YYYY-MM-DD')
        //     currentFrom = moment(from).startOf('day').format('YYYY-MM-DD')
        //     currentTo = moment(from).endOf('day').format('YYYY-MM-DD')
        //   }
        //   else {
        //     throw new Error('INVALID_lastCurrentUnit')
        //   }

        //   return { lastFrom, lastTo, currentFrom, currentTo }
        // }

        function guessSortingExpression(sortingValue: string, subqueries) {
          const variablePart = sortingValue.substr(0, sortingValue.lastIndexOf('_'))
          let sortingDirection = sortingValue.substr(sortingValue.lastIndexOf('_') + 1)

          if (!['ASC', 'DESC'].includes(sortingDirection)) {
            sortingDirection = 'ASC'
          }

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

        const subqueries = (params.subqueries = params.subqueries || {})

        // idea : userGroupByVariable and userSummaryVariable is selected within filter by user
        if (!subqueries.groupByEntity || !(subqueries.groupByEntity !== true && 'value' in subqueries.groupByEntity)) throw ERROR.MISSING_GROUP_BY()
        if (!subqueries.topX || !(subqueries.topX !== true && 'value' in subqueries.topX)) throw ERROR.MISSING_TOP_X()

        // -----------------------------groupBy variable
        // const groupByEntity = prevResult.groupByEntity = subqueries.groupByEntity.value // should be shipper/consignee/agent/controllingCustomer/carrier
        // const codeColumnName = prevResult.codeColumnName = groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierCode` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyCode`
        // const nameColumnName = prevResult.nameColumnName = (groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierName` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyShortNameInReport`) + 'Any'
        
        const { groupByEntity, codeColumnName,nameColumnName } = expandGroupEntity(subqueries,'groupBy',true)

        prevResult.groupByEntity = groupByEntity
        prevResult.codeColumnName = codeColumnName
        prevResult.nameColumnName = nameColumnName

        const topX = subqueries.topX.value

        // ---------------------summaryVariables
        // let summaryVariables: string[] = []
        // if (subqueries.summaryVariables && subqueries.summaryVariables !== true && 'value' in subqueries.summaryVariables) {
        //   // sumamary variable
        //   summaryVariables = Array.isArray(subqueries.summaryVariables.value ) ? subqueries.summaryVariables.value  : [subqueries.summaryVariables.value]
        // }
        // if (subqueries.summaryVariable && subqueries.summaryVariable !== true && 'value' in subqueries.summaryVariable) {
        //   summaryVariables = [...new Set([...summaryVariables, subqueries.summaryVariable.value] as string[])]
        // }
        // if (!(summaryVariables && summaryVariables.length)){
        //   throw new Error('MISSING_summaryVariables')
        // }
        // prevResult.summaryVariables = summaryVariables

        const summaryVariables = expandSummaryVariable(subqueries)
        prevResult.summaryVariables = summaryVariables


        // const lastCurrentUnit = subqueries.lastCurrentUnit && subqueries.lastCurrentUnit !== true && 'value' in subqueries.lastCurrentUnit ? subqueries.lastCurrentUnit.value : '' // should be chargeableWeight/cbm/grossWeight/totalShipment
        
        
        // ------------------------------
        const { lastFrom, lastTo, currentFrom, currentTo } = calculateLastCurrent(subqueries,moment)

        subqueries.date = {
          lastFrom,
          lastTo,
          currentFrom,
          currentTo
        } as any

        // ----------------------- filter
        subqueries[`${codeColumnName}IsNotNull`]  = { // shoulebe carrierIsNotNull/shipperIsNotNull/controllingCustomerIsNotNull
          value : true
        }

        params.fields = [
          // select Month statistics
          ...summaryVariables.map(variable => `${variable}MonthLastCurrent`),
          codeColumnName,
          nameColumnName,
        ]

        // group by
        params.groupBy = [codeColumnName]

        params.limit = topX

        const sorting = params.sorting = []
        if (subqueries.sorting && subqueries.sorting !== true && 'value' in subqueries.sorting) {
          const sortingValueList = subqueries.sorting.value as string[]
          sortingValueList.forEach(sortingValue => {
            // will try to find in sortingExpressionMap first, if not found , just use the normal value
            const orderByExpression = guessSortingExpression(sortingValue, subqueries)
            sorting.push(orderByExpression)
          })
        }

        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['shipment', 'shipment'],
      onResult(res, params, { moment, groupByEntity, codeColumnName, nameColumnName, summaryVariables }: Result): any[] {
        return res.map(row => {
          const row_: any = { code: row[codeColumnName], name: row[nameColumnName], groupByEntity }

          for (const variable of summaryVariables) {
            for (const type of ['Last', 'Current']) {
              let total = 0
              for (const m of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) {
                const month = moment().month(m).format('MMMM')
                const key = `${month}_${variable}${type}`
                let value = +row[key]
                if (isNaN(value)) value = 0
                row_[key] = value
                total += value
              }
              row_[`total_${variable}${type}`] = total
            }

            for (const m of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) {
              const month = moment().month(m).format('MMMM')
              const key = `${month}_${variable}LastCurrentPercentageChange`
              const value = +row[key]
              row_[key] = isNaN(value) ? 0 : value
            }

            const key = `total_${variable}LastCurrentPercentageChange`
            const value = +row[key]
            row_[key] = isNaN(value) ? 0 : value
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
          },
          {
            label: 'containerCount',
            value: 'containerCount'
          }
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
} as JqlDefinition

