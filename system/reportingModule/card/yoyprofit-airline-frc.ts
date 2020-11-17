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
        const { moment } = await this.preparePackages(user)
        prevResult.moment = moment
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
        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['shipment', 'profit-frc'],
      onResult(res, params, { moment }: Result): any[] {
        return res.map(row => {
          const row_: any = { carrierName: row.carrierName }
          for (const m of [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) {
            const month = m === -1 ? 'total' : moment().month(m).format('MMMM')
            for (const type of ['F', 'R', 'C']) {
              const key = `${month}_${type}_grossProfit`
              row_[key] = row[key]
            }
          }
          return row_
        })
      }
    }
  ],
} as JqlDefinition
