import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import Moment = require('moment')

interface Result {
  moment: typeof Moment
}

export default {
  jqls: [
    {
      type: 'prepareParams',
      defaultResult: {},
      async prepareParams(params, prevResult: Result, user): Promise<IQueryParams> {
        const moment = prevResult.moment = (await this.preparePackages(user)).moment
        const subqueries = (params.subqueries = params.subqueries || {})
        if (subqueries.date && subqueries.date !== true && 'from' in subqueries.date) {
          const year = moment(subqueries.date.from, 'YYYY-MM-DD').year()
          subqueries.date.from = moment()
            .year(year)
            .startOf('year')
            .format('YYYY-MM-DD')
          subqueries.date.to = moment()
            .year(year)
            .endOf('year')
            .format('YYYY-MM-DD')
        }
        if (subqueries.divisionCode && subqueries.divisionCode !== true && 'value' in subqueries.divisionCode) {
          subqueries.divisionCode.value = [subqueries.divisionCode.value]
        }
        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['shipment', 'profit'],
      onResult(res, params, { moment }: Result): any[] {
        return res.reduce<any[]>((a, row) => {
          const mi = moment(row.jobMonth, 'YYYY-MM')
          const year = mi.format('YYYY')
          const month = mi.format('MMMM')
          a.push({
            type: 'grossProfit',
            year,
            month,
            currency: row.currency,
            value: row.grossProfit,
            percent: row.revenue === 0 ? 0 : row.grossProfit / row.revenue
          })
          a.push({
            type: 'revenue',
            year,
            month,
            currency: row.currency,
            value: row.revenue
          })
          return a
        }, [])
      }
    }
  ],
  filters: [{
    name: 'divisionCode',
    type: 'list',
    props: {
      multi: false,
    },
  }]
} as JqlDefinition
