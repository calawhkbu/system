import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { OrderBy } from 'node-jql'
import Moment = require('moment')
import { expandGroupEntity, groupByEntityList,summaryVariableList,summaryVariableListBooking,groupByEntityListBooking,expandSummaryVariable,
extendDate } from 'utils/card'
import { ERROR } from 'utils/error'
import { dateSourceList } from '../dateSource'
import { entityTypeList } from '../entityType'
let summaryVariables = summaryVariableList






export default {
  jqls: [
    {
      type: 'prepareParams',
      defaultResult: {},
      async prepareParams(params, prevResult: any, user): Promise<IQueryParams> {
        function guessSortingExpression(sortingValue: string, subqueries) {
          const variablePart = sortingValue.substr(0, sortingValue.lastIndexOf('_'))
          let sortingDirection = sortingValue.substr(sortingValue.lastIndexOf('_') + 1)
          const entityType = params.subqueries.entityType && params.subqueries.entityType.value || 'booking'
          const custom = params.subqueries.custom && params.subqueries.custom.value || null



          if (!entityType) throw ERROR.MISSING_ENTITY_TYPE()

         

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

        const moment = prevResult.moment = (await this.preparePackages(user)).moment as typeof Moment
        const subqueries = (params.subqueries = params.subqueries || {})
        const entityType = params.subqueries.entityType && params.subqueries.entityType.value || 'booking'
        const custom = params.subqueries.custom && params.subqueries.custom.value || null

        if (entityType === 'booking'){
          let groupByEntityList = groupByEntityListBooking
         summaryVariables = summaryVariableListBooking 
      }

        // idea: userGroupByVariable and userSummaryVariable is selected within filter by user
        if(params.subqueries.custom !== 'chart'){
          if (!subqueries.groupByEntity || !(subqueries.groupByEntity !== true && 'value' in subqueries.groupByEntity)) throw ERROR.MISSING_GROUP_BY()
          if (!subqueries.topX || !(subqueries.topX !== true && 'value' in subqueries.topX)) throw ERROR.MISSING_TOP_X()
      
        var { groupByEntity, codeColumnName,nameColumnName } = expandGroupEntity(subqueries,'groupByEntity',true)
  // -----------------------------groupBy variable
  groupByEntity = prevResult.groupByEntity = subqueries.groupByEntity.value // should be shipper/consignee/agent/controllingCustomer/carrier
  codeColumnName = prevResult.codeColumnName = groupByEntity === 'bookingNo' ? 'bookingNo': groupByEntity === 'carrier' ? `carrierCode`: groupByEntity === 'agentGroup' ? 'agentGroup': groupByEntity === 'moduleType' ? 'moduleTypeCode': `${groupByEntity}PartyCode`
  nameColumnName = prevResult.nameColumnName = (groupByEntity === 'bookingNo' ? 'bookingNo': groupByEntity === 'carrier' ? `carrierName`: groupByEntity === 'agentGroup' ? 'agentGroup': groupByEntity === 'moduleType' ? 'moduleTypeCode': `${groupByEntity}PartyShortNameInReport`) + 'Any'

        prevResult.groupByEntity = groupByEntity
        prevResult.codeColumnName = codeColumnName
        prevResult.nameColumnName = nameColumnName

        const topX = subqueries.topX.value

    
        

        // extend date into whole year
        extendDate(subqueries,moment,'year')

        subqueries[`${codeColumnName}IsNotNull`]  = { // shoulebe carrierIsNotNull/shipperIsNotNull/controllingCustomerIsNotNull
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
      

        

        // // warning, will orderBy cbmMonth, if choose cbm as summaryVariables
        // params.sorting = new OrderBy(`total_${summaryVariables[0]}`, 'DESC')

        const sorting = params.sorting = []
        if (subqueries.sorting && subqueries.sorting !== true && 'value' in subqueries.sorting) {
          const sortingValueList = subqueries.sorting.value as string[]
          sortingValueList.forEach(sortingValue => {
            // will try to find in sortingExpressionMap first, if not found , just use the normal value
            const orderByExpression = guessSortingExpression(sortingValue, subqueries)
            sorting.push(orderByExpression)
          })
        }
        else {
          params.sorting = new OrderBy(`total_${summaryVariables[0]}`, 'DESC')
        }
      }else if (params.subqueries.custom == 'count'){
        const summaryVariables = expandSummaryVariable(subqueries)

        prevResult.summaryVariables = summaryVariables
        extendDate(subqueries,moment,'year')
        subqueries[`${codeColumnName}IsNotNull`]  = { // shoulebe carrierIsNotNull/shipperIsNotNull/controllingCustomerIsNotNull
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

        // // warning, will orderBy cbmMonth, if choose cbm as summaryVariables
        // params.sorting = new OrderBy(`total_${summaryVariables[0]}`, 'DESC')

        const sorting = params.sorting = []
        if (subqueries.sorting && subqueries.sorting !== true && 'value' in subqueries.sorting) {
          const sortingValueList = subqueries.sorting.value as string[]
          sortingValueList.forEach(sortingValue => {
            // will try to find in sortingExpressionMap first, if not found , just use the normal value
            const orderByExpression = guessSortingExpression(sortingValue, subqueries)
            sorting.push(orderByExpression)
          })
        }
        else {
    
          params.sorting = new OrderBy(`total_${summaryVariables[0]}`, 'DESC')
        }
      }else if(params.subqueries.custom === 'chart') { //previously jql as {booking}-chart-month
        params.groupBy = ['jobMonth']
        params.fields = ['jobMonth', ...summaryVariables]
        delete params.sorting
        params.limit = 10 
       }

       console.log('params..')
       console.log(params)
       console.log('summaryVariables')
       console.log(summaryVariables)

        return params
      }
    },
    {
      type: 'callDataService',
      getDataServiceQuery: (params): [string, string] {
        const entityType = params.subqueries.entityType && params.subqueries.entityType.value || 'shipment'
        return [entityType.toLowerCase(), entityType.toLowerCase()]
      }, 
      onResult(res, params, { moment, groupByEntity, codeColumnName, nameColumnName }: any){
        let row_
        const selectedsummaryVariable=summaryVariables[0];
        res=res.filter(o=>o[`total_${selectedsummaryVariable}`]!=0);
        if (params.subqueries.entityType && params.subqueries.entityType.value === 'booking'){
         summaryVariables = summaryVariableListBooking 
         return res.map(row => {
          var row_: any = { code: row[codeColumnName], name: row[nameColumnName], groupByEntity }
          var empty=true;

          for (const variable of summaryVariables) {
            let total = 0
            for (const m of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) {
              const month = moment().month(m).format('MMMM')
              const key = `${month}_${variable}`
              let value = +row[key]
              if (isNaN(value)) value = 0
              row_[key] = value
              total += value
            }
            row_[`total_${variable}`] = total
          }
              return row_
    
        })
    
}else{
  return res.map(row => {
    let row_: any = { code: row[codeColumnName], name: row[nameColumnName], groupByEntity }
    for (const variable of summaryVariables) {
      let total = 0
      for (const m of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) {
        const month = moment().month(m).format('MMMM')
        const key = `${month}_${variable}`
        let value = +row[key]
        if (isNaN(value)) value = 0
        row_[key] = value
        total += value
      }
      row_[`total_${variable}`] = total
    }
    return row_
      })
      }
    }
  }
  ],
  filters: [
    // for this filter, user can only select single,
    // but when config in card definition, use summaryVariables. Then we can set as multi
{
  ...dateSourceList
},
{...entityTypeList},

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

          ...summaryVariables.map(summaryVariable => {
            return {
              label: summaryVariable,
              value: summaryVariable
            }
          })
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

          ...groupByEntityList.map(item => {
            return {
              label: item,
              value: item
            }
          })
        ],
        required: true,
      },
      type: 'list',
    },
  ]
} as JqlDefinition