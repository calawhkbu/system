import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import Moment = require('moment')
import { OrderBy } from 'node-jql'
import { expandSummaryVariable } from 'utils/card'

interface Result {
  moment: typeof Moment
  summaryVariables: string[]
  result: any[]
}

export default {
  constants: {
    typeCodeList: ['F', 'R', 'T']
  },
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
        // if (!(summaryVariables && summaryVariables.length)){
        //   throw new Error('MISSING_summaryVariables')
        // }
        // prevResult.summaryVariables = summaryVariables

        const summaryVariables = expandSummaryVariable(subqueries)
        prevResult.summaryVariables = summaryVariables

        if (subqueries.date && subqueries.date !== true && 'from' in subqueries.date) {
          const year = moment(subqueries.date.from, 'YYYY-MM-DD').year()
          subqueries.date = {
            currentFrom: moment().year(year).startOf('year').format('YYYY-MM-DD'),
            currentTo: moment().year(year).endOf('year').format('YYYY-MM-DD'),
            lastFrom: moment().year(year - 1).startOf('year').format('YYYY-MM-DD'),
            lastTo: moment().year(year - 1).endOf('year').format('YYYY-MM-DD'),
          } as any
        }

        // select
        params.fields = [ ...summaryVariables.map(x => `fr_${x}MonthLastCurrent`)]

        params.sorting = new OrderBy(`total_T_${summaryVariables[0]}Current`, 'DESC')

        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['shipment', 'shipment'],
      onResult(res, params, { moment, summaryVariables }: Result): any[] {
        const { typeCodeList } = params.constants
        return res.reduce<any[]>((r, row) => {
          for (const m of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) {
            const month = moment().month(m).format('MMMM')
            const row_: any = { month }
            for (const variable of summaryVariables) {
              for (const type of typeCodeList) {
                for (const lastOrCurrent of ['Last', 'Current']) {
                  const from = `${month}_${type}_${variable}${lastOrCurrent}`
                  const to = `${type}_${variable}${lastOrCurrent}`
                  const value = +row[from]
                  row_[to] = isNaN(value) ? 0 : value
                }
              }
            }
            r.push(row_)
          }
          return r
        }, [])
      }
    }
  ]
} as JqlDefinition
