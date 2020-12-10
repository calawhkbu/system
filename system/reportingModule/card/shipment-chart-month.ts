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

        // let summaryVariables: string[] = []
        // if (subqueries.summaryVariables && subqueries.summaryVariables !== true && 'value' in subqueries.summaryVariables) {
        //   // sumamary variable
        //   summaryVariables = Array.isArray(subqueries.summaryVariables.value ) ? subqueries.summaryVariables.value  : [subqueries.summaryVariables.value ]
        // }
        // if (subqueries.summaryVariable && subqueries.summaryVariable !== true && 'value' in subqueries.summaryVariable) {
        //   summaryVariables = [...new Set([...summaryVariables, subqueries.summaryVariable.value] as string[])]
        // }
        // if (!(summaryVariables && summaryVariables.length)) {
        //   throw new Error('MISSING_summaryVariables')
        // }
        // prevResult.summaryVariables = summaryVariables

        const summaryVariables = expandSummaryVariable(subqueries)
        prevResult.summaryVariables = summaryVariables

        extendDate(subqueries,moment,'year')

        // // limit/extend to 1 year
        // const year = subqueries.date && subqueries.date !== true && 'from' in subqueries.date ?  moment(subqueries.date.from, 'YYYY-MM-DD').year() : moment().year()
        // subqueries.date = {
        //   from: moment()
        //     .year(year)
        //     .startOf('year')
        //     .format('YYYY-MM-DD'),
        //   to: moment()
        //     .year(year)
        //     .endOf('year')
        //     .format('YYYY-MM-DD')
        // }

        // group by
        params.groupBy = ['jobMonth']

        params.fields = ['jobMonth', ...summaryVariables]

        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['shipment', 'shipment'],
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
      },
    },
  ]
} as JqlDefinition
