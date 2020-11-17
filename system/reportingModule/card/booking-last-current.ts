import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import Moment = require('moment')
import { OrderBy } from 'node-jql'
import { expandGroupEntity, calculateLastCurrent } from 'utils/card'
import { dateSourceList } from './booking-month'
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
    {...dateSourceList},
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
