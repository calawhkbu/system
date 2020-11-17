import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import Moment = require('moment')
import { ERROR } from 'utils/error'

interface Result {
  moment: typeof Moment
  FCL: any[]
  LCL: any[]
  Consol: any[]
}

function prepareParams(params: IQueryParams, type: string): IQueryParams {
  const subqueries = (params.subqueries = params.subqueries || {})
  if (!subqueries.division) throw ERROR.MISSING_DIVISION()
  if (subqueries.division && subqueries.division !== true && 'value' in subqueries.division) {
    if (subqueries.division.value[0] !== 'SE' && subqueries.division.value[0] !== 'SI') throw ERROR.UNSUPPORTED_DIVISION()
    subqueries.division.value[0] += ' ' + type
  }
  return params
}

function processResult(result: any[], moment: typeof Moment, type: string): any[] {
  return result.reduce<any[]>((a, row) => {
    const mi = moment(row.jobMonth, 'YYYY-MM')
    const year = mi.format('YYYY')
    const month = mi.format('MMMM')
    a.push({
      type: `${type}-grossProfit`,
      year,
      month,
      currency: row.currency,
      value: row.grossProfit
    })
    a.push({
      type: `${type}-revenue`,
      year,
      month,
      currency: row.currency,
      value: row.revenue
    })
    return a
  }, [])
}

export default {
  jqls: [
    {
      type: 'runParallel',
      defaultResult: {},
      jqls: [
        // FCL
        [
          {
            type: 'prepareParams',
            prepareParams(params): IQueryParams {
              return prepareParams(params, 'FCL')
            }
          },
          {
            type: 'callDataService',
            dataServiceQuery: ['shipment', 'profit'],
            async onResult(res, params, prevResult: Result, user): Promise<Result> {
              if (!prevResult.moment) prevResult.moment = (await this.preparePackages(user)).moment
              prevResult.FCL = processResult(res, prevResult.moment, 'FCL')
              return prevResult
            }
          }
        ],
        // LCL
        [
          {
            type: 'prepareParams',
            prepareParams(params): IQueryParams {
              return prepareParams(params, 'LCL')
            }
          },
          {
            type: 'callDataService',
            dataServiceQuery: ['shipment', 'profit'],
            async onResult(res, params, prevResult: Result, user): Promise<Result> {
              if (!prevResult.moment) prevResult.moment = (await this.preparePackages(user)).moment
              prevResult.LCL = processResult(res, prevResult.moment, 'LCL')
              return prevResult
            }
          }
        ],
        // Consol
        [
          {
            type: 'prepareParams',
            prepareParams(params): IQueryParams {
              return prepareParams(params, 'Consol')
            }
          },
          {
            type: 'callDataService',
            dataServiceQuery: ['shipment', 'profit'],
            async onResult(res, params, prevResult: Result, user): Promise<Result> {
              if (!prevResult.moment) prevResult.moment = (await this.preparePackages(user)).moment
              prevResult.Consol = processResult(res, prevResult.moment, 'Consol')
              return prevResult
            }
          }
        ],
      ]
    },
    {
      type: 'postProcess',
      postProcess(params, { FCL, LCL, Consol }: Result): any[] {
        return FCL.concat(LCL).concat(Consol).sort((l, r) => {
          l = l.type.split('-')[1]
          r = r.type.split('-')[1]
          return l.localeCompare(r)
        })
      }
    }
  ]
} as JqlDefinition
