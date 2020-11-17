import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import Moment = require('moment')

interface Result {
  moment: typeof Moment
  current: any[]
  last: any[]
}

function prepareParams(params: IQueryParams, moment: typeof Moment, current: boolean): IQueryParams {
  const subqueries = (params.subqueries = params.subqueries || {})
  if (subqueries.date && subqueries.date !== true && 'from' in subqueries.date) {
    let year = moment(subqueries.date.from, 'YYYY-MM-DD').year()
    if (!current) year -= 1
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

function processResult(result: any[], moment: typeof Moment): any[] {
  return result.map(row => {
    const row_: any = {}
    const mi = moment(row.jobMonth, 'YYYY-MM')
    row_.year = mi.format('YYYY')
    row_.month = mi.format('MMMM')
    row_.currency = row.currency
    row_.grossProfit = row.grossProfit
    return row_
  })
}

export default {
  jqls: [
    {
      type: 'runParallel',
      defaultResult: {},
      jqls: [
        // current year
        [
          {
            type: 'prepareParams',
            async prepareParams(params, prevResult: Result, user): Promise<IQueryParams> {
              if (!prevResult.moment) prevResult.moment = (await this.preparePackages(user)).moment
              return prepareParams(params, prevResult.moment, true)
            }
          },
          {
            type: 'callDataService',
            dataServiceQuery: ['shipment', 'profit'],
            onResult(res, params, prevResult: Result): Result {
              prevResult.current = processResult(res, prevResult.moment)
              return prevResult
            }
          }
        ],
        // last year
        [
          {
            type: 'prepareParams',
            async prepareParams(params, prevResult: Result, user): Promise<IQueryParams> {
              if (!prevResult.moment) prevResult.moment = (await this.preparePackages(user)).moment
              return prepareParams(params, prevResult.moment, false)
            }
          },
          {
            type: 'callDataService',
            dataServiceQuery: ['shipment', 'profit'],
            onResult(res, params, prevResult: Result): Result {
              prevResult.last = processResult(res, prevResult.moment)
              return prevResult
            }
          }
        ],
      ]
    },
    {
      type: 'postProcess',
      postProcess(params, { last, current }: Result): any[] {
        return last.concat(current)
      }
    }
  ]
} as JqlDefinition
