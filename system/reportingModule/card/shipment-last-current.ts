import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import Moment = require('moment')
import { OrderBy } from 'node-jql'
import { expandGroupEntity, calculateLastCurrent } from 'utils/card'
import { ERROR } from 'utils/error'

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

        // warning cannot display from frontend
        if (!subqueries.groupByEntity) throw ERROR.MISSING_GROUP_BY()
        if (!subqueries.metric1) throw ERROR.MISSING_METRIC_1()
        if (!subqueries.metric2) throw ERROR.MISSING_METRIC_2()
        if (!subqueries.lastCurrentUnit) throw ERROR.MISSING_LAST_CURRENT_UNIT()
        if (!subqueries.topX) throw ERROR.MISSING_TOP_X()

        // most important part of this card
        // dynamically choose the fields and summary value

        // const groupByEntity = prevResult.groupByEntity = (subqueries.groupByEntity as any).value // should be shipper/consignee/agent/controllingCustomer/carrier
        // const codeColumnName = prevResult.codeColumnName = groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierCode` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyCode`
        // const nameColumnName = prevResult.nameColumnName = (groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierName` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyShortNameInReport`) + 'Any'
        
        const { groupByEntity, codeColumnName,nameColumnName } = expandGroupEntity(subqueries,'groupByEntity',true)

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

        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['shipment', 'shipment'],
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
} as JqlDefinition
