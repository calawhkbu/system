import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import Moment = require('moment')
import { expandSummaryVariable, extendDate } from 'utils/card'

interface Result {
  moment: typeof Moment
  summaryVariables: string[]
}

export default {
    jqls: [
      {
        type: 'prepareParams',
        defaultResult: {},
        async prepareParams(params, prevResult: Result, user): Promise<IQueryParams> {
          const moment = prevResult.moment = (await this.preparePackages(user)).moment
          const subqueries = (params.subqueries = params.subqueries || {})
  
      
  
          const summaryVariables = expandSummaryVariable(subqueries)
          prevResult.summaryVariables = summaryVariables
  
          extendDate(subqueries,moment,'year')
  
    
  
          // group by
          params.groupBy = ['jobMonth']
  
          params.fields = ['jobMonth', ...summaryVariables]
          console.log("paramsFIELD")
          console.log(params)
  
          return params
        }
      },
      {
        type: 'callDataService',
        dataServiceQuery: ['booking', 'booking'],
        onResult(res, params, { moment, summaryVariables }): any[] {
          res = res.map(row => {
            const row_: any = { jobMonth: row.jobMonth }
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
        }
      }
    ],
    filters: [
      {
        // what to find in the groupby
        name: 'summaryVariables',
        type: 'list',
        default: [],
        props: {
          required: true,
          // // note : if set multi into true , user can select multiple summary variable and will return multiple dataset
          // // warning : but still need to config in card db record
          // multi : true,
          items: [
            {
              label: 'Chargeable Weight',
              value: 'chargeableWeight',
            },
            {
              label: 'Gross Weight',
              value: 'grossWeight',
            },
            {
              label: 'cbm',
              value: 'cbm',
            },
            {
              label: 'Total Booking',
              value: 'totalBooking',
            },
            {
              label: 'teu',
              value: 'teu',
            },
        
            {
              label: 'Quantity',
              value: 'quantity',
            }
       
            
          ],
        },
      },
    ]
  } as JqlDefinition