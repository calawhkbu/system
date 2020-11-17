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

function processResult(result: any[], params: IQueryParams, moment: typeof Moment, current: boolean): any[] {
  const subqueries = (params.subqueries = params.subqueries || {})
  let profitSummaryVariables = ['grossProfit']
  if (subqueries.profitSummaryVariables && subqueries.profitSummaryVariables !== true && 'value' in subqueries.profitSummaryVariables) {
    profitSummaryVariables = subqueries.profitSummaryVariables.value
  }
  return result.map(row => {
    const row_: any = { current }
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
            onResult(data, params, prevResult: Result): Result {
              prevResult.current = processResult(data, params, prevResult.moment, true)
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
            onResult(data, params, prevResult: Result): Result {
              prevResult.last = processResult(data, params, prevResult.moment, false)
              return prevResult
            }
          }
        ],
      ]
    },
    {
      type: 'postProcess',
      postProcess(params, { current, last }: Result): any[] {
        const result: any[] = current.concat(last)

        return result.reduce<any[]>((a, row) => {
          let row_ = a.find(r => r.month === row.month)
          if (!row_) a.push(row_ = { month: row.month })
          for (const key of Object.keys(row)) {
            if (key !== 'month') {
              row_[`${row.current ? 'current' : 'last'}_${key}`] = row[key]
            }
          }
          return a
        }, [])
      }
    }
  ],
  filters: [
    {
      name: 'showMonth',
      type: 'boolean',
    },
    {
      name: 'showYear',
      props: {
        items: [
          {
            label: 'current',
            value: 'current',
          },
          {
            label: 'last',
            value: 'last',
          },
        ],
        required: true,
      },
      type: 'list',
    },
  ]
} as JqlDefinition
