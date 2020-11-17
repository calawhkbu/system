import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import Moment from 'moment'
import { ERROR } from 'utils/error'

interface Result {
  moment: typeof Moment
  currentF: any[]
  currentR: any[]
  lastF: any[]
  lastR: any[]
  tonnage: any[]
  summaryVariables: string[]
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

function prepareTonnageParams(params: IQueryParams, moment: typeof Moment, prevResult: Result): IQueryParams {
  const subqueries = (params.subqueries = params.subqueries || {})

  if (subqueries.date && subqueries.date !== true && 'from' in subqueries.date) {
    const from = subqueries.date.from
    const currentYear = moment(from).year()
    const lastFrom = moment(from).year(currentYear - 1).startOf('year').format('YYYY-MM-DD')
    const lastTo = moment(from).year(currentYear - 1).endOf('year').format('YYYY-MM-DD')
    const currentFrom = moment(from).year(currentYear).startOf('year').format('YYYY-MM-DD')
    const currentTo = moment(from).year(currentYear).endOf('year').format('YYYY-MM-DD')
    subqueries.date = {
      lastFrom,
      lastTo,
      currentFrom,
      currentTo,
    } as any
  }

  let tonnageSummaryVariables: string[] = []
  if (subqueries.tonnageSummaryVariables && subqueries.tonnageSummaryVariables !== true && 'value' in subqueries.tonnageSummaryVariables) {
    tonnageSummaryVariables = Array.isArray(subqueries.tonnageSummaryVariables.value) ? subqueries.tonnageSummaryVariables.value : [subqueries.tonnageSummaryVariables.value]
  }
  if (!(tonnageSummaryVariables && tonnageSummaryVariables.length)) {
    throw ERROR.MISSING_TONNAGE_SUMMARY_VARIABLE()
  }
  prevResult.summaryVariables = tonnageSummaryVariables

  params.fields = [
    ...tonnageSummaryVariables.map(tonnageSummaryVariable => {
      return `fr_${tonnageSummaryVariable}MonthLastCurrent`
    })
  ]

  return params
}

function processTonnageResult(result: any[], params: IQueryParams, moment: typeof Moment) {
  const subqueries = (params.subqueries = params.subqueries || {})
  let tonnageSummaryVariables: string[] = []
  if (subqueries.tonnageSummaryVariables && subqueries.tonnageSummaryVariables !== true && 'value' in subqueries.tonnageSummaryVariables) {
    tonnageSummaryVariables = Array.isArray(subqueries.tonnageSummaryVariables.value) ? subqueries.tonnageSummaryVariables.value : [subqueries.tonnageSummaryVariables.value]
  }
  const fields: string[] = []
  for (const m of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) {
    const month = moment().month(m).format('MMMM')
    for (const type of ['F', 'R']) {
      for (const type2 of ['Last', 'Current']) {
        for (const key of tonnageSummaryVariables) {
          fields.push(`${month}_${type}_${key}${type2}`)
        }
      }
    }
  }
  return result.map(row => {
    const row_: any = {}
    for (const key of fields) {
      const value = +row[key]
      row_[key] = isNaN(value) ? 0 : value
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
        ],
        // tonnage
        [
          {
            type: 'prepareParams',
            async prepareParams(params, prevResult: Result, user): Promise<IQueryParams> {
              if (!prevResult.moment) prevResult.moment = (await this.preparePackages(user)).moment
              return prepareTonnageParams(params, prevResult.moment, prevResult)
            }
          },
          {
            type: 'callDataService',
            dataServiceQuery: ['shipment', 'shipment'],
            onResult(res, params, prevResult: Result): Result {
              prevResult.tonnage = processTonnageResult(res, params, prevResult.moment)
              return prevResult
            }
          }
        ],
      ]
    },
    {
      type: 'postProcess',
      postProcess(params, { lastF, lastR, currentF, currentR, tonnage, moment, summaryVariables }: Result): any[] {
        let result: any[] = lastF.concat(lastR).concat(currentF).concat(currentR)

        const tonnageSummaryVariable = summaryVariables[0]

        // profit
        result = result.reduce<any[]>((a, row) => {
          let row_ = a.find(r => r.month === row.month)
          if (!row_) a.push(row_ = { month: row.month, tonnageSummaryVariable0: tonnageSummaryVariable })
          for (const key of Object.keys(row)) {
            if (key !== 'month' && key !== 'freehand' && key !== 'current') {
              row_[`${row.freehand ? 'F' : 'R'}_${key}${row.current ? 'Current' : 'Last'}`] = row[key]
            }
          }
          return a
        }, [])

        // tonnage
        const tonnageRow = tonnage[0] || {}
        for (const m of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) {
          const month = moment().month(m).format('MMMM')
          const row = result.find(r => r.month === month) || { month, tonnageSummaryVariable0: tonnageSummaryVariable }
          for (const type of ['F', 'R']) {
            for (const type2 of ['Last', 'Current']) {
              const from = `${month}_${type}_${tonnageSummaryVariable}${type2}`
              const to = `${type}_${tonnageSummaryVariable}${type2}`
              row[to] = tonnageRow[from]
            }
          }
        }

        return result
      }
    }
  ],
  filters: [{
    display: 'tonnageSummaryVariables',
    name: 'tonnageSummaryVariables',
    props: {
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
      ],
      multi: false,
      required: true,
    },
    type: 'list',
  }]
} as JqlDefinition
