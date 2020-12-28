import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { OrderBy, ParameterExpression } from 'node-jql'
import Moment = require('moment')
import { expandGroupEntity, groupByEntityList,summaryVariableList,summaryVariableListBooking,groupByEntityListBooking,expandSummaryVariable,
extendDate } from 'utils/card'
import { ERROR } from 'utils/error'
import { dateSourceList } from '../dateSource'
import { entityTypeList } from '../entityType'
import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript'
let summaryVariables = summaryVariableList






export default {
    constants: [
      { // for custom = frc
      name : 'frc',
      typeCodeList : ['F', 'R', 'C', 'T']

    },
    {
     name: 'fr',
  typeCodeList: ['F', 'R', 'T']
    }
  ],
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
        const custom = params.subqueries.custom && params.subqueries.custom.value || undefined

     
        // idea: userGroupByVariable and userSummaryVariable is selected within filter by user
        var { groupByEntity, codeColumnName,nameColumnName } = expandGroupEntity(subqueries,'groupByEntity',true)
        codeColumnName =  groupByEntity === 'bookingNo' ? 'bookingNo': groupByEntity === 'carrier' ? `carrierCode`: groupByEntity === 'agentGroup' ? 'agentGroup': groupByEntity === 'moduleType' ? 'moduleTypeCode': `${groupByEntity}PartyCode`
        nameColumnName = (groupByEntity === 'bookingNo' ? 'bookingNo': groupByEntity === 'carrier' ? `carrierName`: groupByEntity === 'agentGroup' ? 'agentGroup': groupByEntity === 'moduleType' ? 'moduleTypeCode': `${groupByEntity}PartyShortNameInReport`) + 'Any'
      
              prevResult.groupByEntity = groupByEntity
              prevResult.codeColumnName = codeColumnName
              prevResult.nameColumnName = nameColumnName
              const topX = subqueries.topX && subqueries.topX.value || 10
   
        if(!custom){
          if (!subqueries.groupByEntity || !(subqueries.groupByEntity !== true && 'value' in subqueries.groupByEntity)) throw ERROR.MISSING_GROUP_BY()
          if (!subqueries.topX || !(subqueries.topX !== true && 'value' in subqueries.topX)) throw ERROR.MISSING_TOP_X()

      
  // -----------------------------groupBy variable
  groupByEntity = prevResult.groupByEntity = subqueries.groupByEntity.value || 'carrier' // should be shipper/consignee/agent/controllingCustomer/carrier

        extendDate(subqueries,moment,'year')
        subqueries[`${codeColumnName}IsNotNull`]  = { // shoulebe carrierIsNotNull/shipperIsNotNull/controllingCustomerIsNotNull
          value: true
        }

        summaryVariables = params.subqueries.summaryVariable&& params.subqueries.summaryVariable.value || 
        params.subqueries.summaryVariables&&params.subqueries.summaryVariables.value        
        
        
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

        }else {
          params.sorting = new OrderBy(`total_${summaryVariables[0]}`, 'DESC')

        }

         
      }else if (custom === 'count'){
      
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
        return params
      }else if(custom === 'chart') { //previously jql as {booking}-chart-month
      const summaryVariables = expandSummaryVariable(subqueries)
      prevResult.summaryVariables = summaryVariables
      extendDate(subqueries,moment,'year')
      params.groupBy = ['jobMonth']
      params.fields = ['jobMonth', ...summaryVariables]
      delete params.sorting
       }else if(custom === ('frc' || 'fr')){
          delete params.fields
          delete params.groupBy
          delete params.limit
          extendDate(subqueries,moment,'year')
          subqueries[`${codeColumnName}IsNotNull`]  = { // shoulebe carrierIsNotNull/shipperIsNotNull/controllingCustomerIsNotNull
            value: true
          }
        summaryVariables = params.subqueries.summaryVariable&& params.subqueries.summaryVariable.value || 
                          params.subqueries.summaryVariables&&params.subqueries.summaryVariables.value
        let name =params.constants.find(o=>o.name === params.subqueries.custom.value).name || null
        params.fields = [
          // select Month statistics
          ...summaryVariables.map(variable => `${name}_${variable}Month`),
          codeColumnName,
          nameColumnName,
        ]


        params.groupBy = [codeColumnName]
        params.sorting = new OrderBy(`total_T_${summaryVariables[0]}`, 'DESC')
        params.limit = topX
        return params

        

       }else if(custom === 'dynamic'){
        delete params.fields
        delete params.groupBy
        delete params.limit
        const topX = subqueries.topX.value
        const summaryVariables = expandSummaryVariable(subqueries)
        prevResult.summaryVariables = summaryVariables
        // extend date into whole year
        extendDate(subqueries,moment,'year')
        subqueries[`${codeColumnName}IsNotNull`]  = { // shoulebe carrierCodeIsNotNull/shipperIsNotNull/controllingCustomerIsNotNull
          value: true
        }

        if(groupByEntity=='bookingNo'){
          codeColumnName=groupByEntity;
          nameColumnName=groupByEntity;
        }else if(groupByEntity=='carrier'){
          codeColumnName='carrierCode';
          nameColumnName='carrierName';
        }else if(groupByEntity=='moduleType'){
          codeColumnName='moduleTypeCode';
          nameColumnName='moduleTypeCode';
        }else if(groupByEntity=='portOfLoading'){
          codeColumnName=groupByEntity+"Code";
          nameColumnName=groupByEntity+"Name";
        }else if(groupByEntity=='portOfDischarge'){
          codeColumnName=groupByEntity+"Code";
          nameColumnName=groupByEntity+"Name";
        }else if(groupByEntity=='agent'){
          codeColumnName=groupByEntity+"PartyCode";
          nameColumnName=groupByEntity+"PartyName";
        }else if(groupByEntity=='forwarder'){
          codeColumnName=groupByEntity+"PartyCode";
          nameColumnName=groupByEntity+"PartyName";
        }else{
          codeColumnName=`${groupByEntity}PartyCode`;
          nameColumnName=`${groupByEntity}PartyShortNameInReport` + 'Any';
          
        }

        
        params.fields = [
          ...summaryVariables.map(variable => `${variable}Month`),
          codeColumnName,
          nameColumnName,
          'ErpSite'
        ]

        params.groupBy = [codeColumnName]
        const sorting = params.sorting = []
           if (subqueries.sorting && subqueries.sorting !== true && 'value' in subqueries.sorting) {
             const sortingValueList = subqueries.sorting.value as { value: string; ascOrDesc: 'ASC' | 'DESC' }[]
             sortingValueList.forEach(({ value, ascOrDesc }) => {
               const orderByExpression = new OrderBy(value,ascOrDesc)
               sorting.push(orderByExpression)
             })
           }
           else {
             params.sorting = new OrderBy(`total_${summaryVariables[0]}`, 'DESC')
           }
   
           params.limit = topX
           return params

       }
      }
    },
    {
      type: 'callDataService',
      getDataServiceQuery: (params): [string, string] {
        const entityType = params.subqueries.entityType && params.subqueries.entityType.value || 'shipment'
        return [entityType.toLowerCase(), entityType.toLowerCase()]
      }, 
      onResult(res, params, { moment, groupByEntity, codeColumnName, nameColumnName,summaryVariables,summaryVariable }: any){
        let row_
        let custom = params.subqueries.custom && params.subqueries.custom.value || undefined
        if (custom === 'count'){
          summaryVariables = params.subqueries.summaryVariables.value
          const selectedsummaryVariable=summaryVariables[0] 
          res=res.filter(o=>o[`total_${selectedsummaryVariable}`]!=0)
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
    

      }else if(custom === 'chart'){
         res = res.map(row => {
           row_= { jobMonth: row.jobMonth }
          for (const variable of summaryVariables) {
            const value = row[variable]
            row_[variable] = isNaN(value) ? 0 : value
          }
          return row_
        })

        const result: any[] = []
        for (const row of res) {
          for (const variable of summaryVariables) {
            result.push({
              type: variable,
              month: moment(row.jobMonth, 'YYYY-MM').format('MMMM'),
              value: row[variable]
            })
          }
        }
        return result
      
      }else if(custom === ('frc' || 'fr')){
        summaryVariables = params.subqueries.summaryVariable&& params.subqueries.summaryVariable.value || 
        params.subqueries.summaryVariables&&params.subqueries.summaryVariables.value

         return res.map(row => {

          const row_: any = { groupByEntity, code: row[codeColumnName], name: row[nameColumnName] }
          for (const variable of summaryVariables) {
            let typeCodeList = params.constants.find(o=>o.name === params.subqueries.custom.value).typeCodeList || null
            //typeCodeList= typeCodeList.typeCodeList
            for (const typeCode of typeCodeList) {
              for (const m of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
                const month = m === 12 ? 'total' : moment().month(m).format('MMMM')
                const key = `${month}_${typeCode}_${variable}`
                const value = +row[key]
                row_[key] = isNaN(value) ? 0 : value
              }
            }
          }
          return row_
        })

      }else if(custom === 'dynamic'){
        
        if(groupByEntity=='bookingNo'){
          codeColumnName=groupByEntity;
          nameColumnName=groupByEntity;
        }else if(groupByEntity=='carrier'){
          codeColumnName='carrierCode';
          nameColumnName='carrierName';
        }else if(groupByEntity=='moduleType'){
          codeColumnName='moduleTypeCode';
          nameColumnName='moduleTypeCode';
        }else if(groupByEntity=='portOfLoading'){
          codeColumnName=groupByEntity+"Code";
          nameColumnName=groupByEntity+"Name";
        }else if(groupByEntity=='portOfDischarge'){
          codeColumnName=groupByEntity+"Code";
          nameColumnName=groupByEntity+"Name";
        }else if(groupByEntity=='agent'){
          codeColumnName=groupByEntity+"PartyCode";
          nameColumnName=groupByEntity+"PartyName";
        }else if(groupByEntity=='forwarder'){
          codeColumnName=groupByEntity+"PartyCode";
          nameColumnName=groupByEntity+"PartyName";
        }else{
          codeColumnName=`${groupByEntity}PartyCode`;
          nameColumnName=`${groupByEntity}PartyShortNameInReport` + 'Any';
          
        }
        return res.map(row => {
          const row_: any = { code: row[codeColumnName], name: row[nameColumnName], groupByEntity }

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
          row_['erpCode']=row['ErpSite']
          return row_

        })
      }else if(!params.subqueries.custom){
        return res.map(row => {
           row_ = { code: row[codeColumnName], name: row[nameColumnName], groupByEntity }
          let defaultSummaryVariable = []
          if(params.subqueries.entityType.value === 'booking'){
            defaultSummaryVariable = ['totalBooking']
          }else if(params.subqueries.entityType.value === 'shipment'){
            defaultSummaryVariable = ['totalShipment']
          }


          summaryVariables = params.subqueries.summaryVariables && params.subqueries.summaryVariables.value || defaultSummaryVariable
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
