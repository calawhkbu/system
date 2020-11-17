import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import Moment from 'moment'

interface Result {
  moment: typeof Moment
  currentF: any[]
  currentR: any[]
  lastF: any[]
  lastR: any[]
}

function prepareProfitParams(params: IQueryParams, moment: typeof Moment, current: boolean, freehand: boolean): IQueryParams {
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
  subqueries.nominatedTypeCode = { value: [freehand ? 'F' : 'R'] }
  return params
}

function processProfitResult(result: any[], params: IQueryParams, moment: typeof Moment, current: boolean, freehand: boolean): any[] {
  const subqueries = (params.subqueries = params.subqueries || {})
  let profitSummaryVariables = ['grossProfit']
  if (subqueries.profitSummaryVariables && subqueries.profitSummaryVariables !== true && 'value' in subqueries.profitSummaryVariables) {
    profitSummaryVariables = subqueries.profitSummaryVariables.value
  }
  return result.map(row => {
    const row_: any = { current, freehand }
    for (const key of ['month', ...profitSummaryVariables]) {
      switch (key) {
        case 'month':
          row_[key] = moment(row.jobMonth, 'YYYY-MM').format('MMMM')
          break
        case 'margin':
          row_[key] = row.revenue === 0 ? 0 : row.grossProfit / row.revenue
          break
        default:
          row_[key] = row[key]
      }
    }
    return row_
  })
}

export default {
  jqls: [
    {
      type: 'runParallel',
      defaultResult: {},
      jqls: [
        // current year F
        [
          {
            type: 'prepareParams',
            async prepareParams(params, prevResult: Result, user): Promise<IQueryParams> {
              if (!prevResult.moment) prevResult.moment = (await this.preparePackages(user)).moment
              return prepareProfitParams(params, prevResult.moment, true, true)
            }
          },
          {
            type: 'callDataService',
            dataServiceQuery: ['shipment', 'profit'],
            onResult(res, params, prevResult: Result): Result {
              prevResult.currentF = processProfitResult(res, params, prevResult.moment, true, true)
              return prevResult
            }
          }
        ],
        // current year R
        [
          {
            type: 'prepareParams',
            async prepareParams(params, prevResult: Result, user): Promise<IQueryParams> {
              if (!prevResult.moment) prevResult.moment = (await this.preparePackages(user)).moment
              return prepareProfitParams(params, prevResult.moment, true, false)
            }
          },
          {
            type: 'callDataService',
            dataServiceQuery: ['shipment', 'profit'],
            onResult(res, params, prevResult: Result): Result {
              prevResult.currentR = processProfitResult(res, params, prevResult.moment, true, false)
              return prevResult
            }
          }
        ],
        // last year F
        [
          {
            type: 'prepareParams',
            async prepareParams(params, prevResult: Result, user): Promise<IQueryParams> {
              if (!prevResult.moment) prevResult.moment = (await this.preparePackages(user)).moment
              return prepareProfitParams(params, prevResult.moment, false, true)
            }
          },
          {
            type: 'callDataService',
            dataServiceQuery: ['shipment', 'profit'],
            onResult(res, params, prevResult: Result): Result {
              prevResult.lastF = processProfitResult(res, params, prevResult.moment, false, true)
              return prevResult
            }
          }
        ],
        // last year R
        [
          {
            type: 'prepareParams',
            async prepareParams(params, prevResult: Result, user): Promise<IQueryParams> {
              if (!prevResult.moment) prevResult.moment = (await this.preparePackages(user)).moment
              return prepareProfitParams(params, prevResult.moment, false, false)
            }
          },
          {
            type: 'callDataService',
            dataServiceQuery: ['shipment', 'profit'],
            onResult(res, params, prevResult: Result): Result {
              prevResult.lastR = processProfitResult(res, params, prevResult.moment, false, false)
              return prevResult
            }
          }
        ]
      ]
    },
    {
      type: 'postProcess',
      postProcess(params, { lastF, lastR, currentF, currentR }: Result): any[] {
        let result: any[] = lastF.concat(lastR).concat(currentF).concat(currentR)

        // profit
        result = result.reduce<any[]>((a, row) => {
          let row_ = a.find(r => r.month === row.month)
          if (!row_) a.push(row_ = { month: row.month })
          for (const key of Object.keys(row)) {
            if (key !== 'month' && key !== 'freehand' && key !== 'current') {
              row_[`${row.current ? 'current' : 'last'}_${row.freehand ? 'F' : 'R'}_${key}`] = row[key]
            }
          }
          return a
        }, [])

        return result
      }
    }
  ]
} as JqlDefinition
