import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { OrderBy } from 'node-jql'
import Moment = require('moment')
import { expandGroupEntity, expandSummaryVariable, extendDate } from 'utils/card'
import { dateSourceList } from './booking-month'


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

        // idea: userGroupByVariable and userSummaryVariable is selected within filter by user
        if (!subqueries.groupByEntity || !(subqueries.groupByEntity !== true && 'value' in subqueries.groupByEntity)) throw new Error('MISSING_groupByVariable')
        if (!subqueries.topX || !(subqueries.topX !== true && 'value' in subqueries.topX)) throw new Error('MISSING_topX')

 

        var { groupByEntity, codeColumnName,nameColumnName } = expandGroupEntity(subqueries,'groupByEntity',true)
          // -----------------------------groupBy variable
          groupByEntity = prevResult.groupByEntity = subqueries.groupByEntity.value // should be shipper/consignee/agent/controllingCustomer/carrier
          codeColumnName = prevResult.codeColumnName = groupByEntity === 'bookingNo' ? 'bookingNo': groupByEntity === 'carrier' ? `carrierCode`: groupByEntity === 'agentGroup' ? 'agentGroup': groupByEntity === 'moduleType' ? 'moduleTypeCode': `${groupByEntity}PartyCode`
          nameColumnName = prevResult.nameColumnName = (groupByEntity === 'bookingNo' ? 'bookingNo': groupByEntity === 'carrier' ? `carrierName`: groupByEntity === 'agentGroup' ? 'agentGroup': groupByEntity === 'moduleType' ? 'moduleTypeCode': `${groupByEntity}PartyShortNameInReport`) + 'Any'
         
        
        console.debug('preparParams')
        console.debug(params)
        prevResult.groupByEntity = groupByEntity
        prevResult.codeColumnName = codeColumnName
        prevResult.nameColumnName = nameColumnName

        const topX = subqueries.topX.value
        console.debug("SUBQURIES");
        console.debug(subqueries)



        const summaryVariables = expandSummaryVariable(subqueries)
        console.debug("summaryVariables")
        console.debug(summaryVariables);

        prevResult.summaryVariables = summaryVariables



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

        params.limit = topX
        console.debug("params JQL expressions")
        console.debug(params)
        console.debug(prevResult)
        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['booking', 'booking'],

      onResult(res, params, { moment, groupByEntity, codeColumnName, nameColumnName, summaryVariables }: Result): any[] {
          
        console.debug("callDataService")
        console.debug(res)

        const selectedsummaryVariable=summaryVariables[0];
        res=res.filter(o=>o[`total_${selectedsummaryVariable}`]!=0);
        console.debug("filtered res ")
        console.debug(res);
        


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
              return row_;
      
        
        })
      }
    }
  ],
  filters: [
    // for this filter, user can only select single,
    // but when config in card definition, use summaryVariables. Then we can set as multi
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
        display: 'summaryVariables',
        name: 'summaryVariables',
        props: {
          items: [
            {
                label: 'Total Booking',
                value: 'totalBooking',
              },
            {
              label: 'Chargeable Weight',
              value: 'chargeableWeight',
            },
            {
              label: 'Gross Weight',
              value: 'grossWeight',
            },
            {
              label: 'Volume Weight',
              value: 'volumeWeight',
            },
            

            {
              label: 'TEU',
              value: 'teu',
            },
            {
              label: 'CBM',
              value: 'cbm',
            },
         
            {
              label: 'QTY',
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
            label: 'Carrier',
            value: 'carrier',
          },
          {
            label: 'Shipper',
            value: 'shipper',
          },
          {
            label: 'Consignee',
            value: 'consignee',
          },
          {
            label: 'Agent',
            value: 'agent',
          },
         
          {
            label: 'Controlling Customer',
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
          {
            label : 'bookingNo',
            value : 'bookingNo'
          },
          {
            label : 'Forwarder',
            value : 'forwarder'
          },
          
        ],
        required: true,
      },
      type: 'list',
    },
  ]
} as JqlDefinition
