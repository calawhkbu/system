import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import Moment = require('moment')
import { OrderBy } from 'node-jql'
import { ERROR } from 'utils/error'

interface Result {
  moment: typeof Moment
  current: any[]
  last: any[]
}

const groupbyList=["poNo",
"productCategoryId",
"moduleType",
"incoTerms",
"freightTerms",
"portOfLoading",
"portOfDischarge"
];

function prepareParams(params: IQueryParams, moment: typeof Moment, current: boolean): IQueryParams {
  const subqueries = (params.subqueries = params.subqueries || {})

  // warning cannot display from frontend
  if (!subqueries.yAxis) throw ERROR.MISSING_Y_AXIS_METRIC()

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

  // most important part of this card
  // dynamically choose the fields and summary value

  const summaryColumnName = (subqueries.yAxis as any).value
  // ------------------------------
  params.sorting = new OrderBy(summaryColumnName, 'DESC')
  // select
  params.fields = ['jobMonth', summaryColumnName]
  params.groupBy = ['jobMonth']

  return params
}

function processResult(result: any[], params: IQueryParams, moment: typeof Moment, current: boolean): any[] {
  const subqueries = (params.subqueries = params.subqueries || {})
  const summaryColumnName = (subqueries.yAxis as any).value

  return result.map(row => {
    const mi = moment(row.jobMonth, 'YYYY-MM')
    const year = mi.format('YYYY')
    const month = mi.format('MMMM')
    return { year, month, summary: summaryColumnName, value: row[summaryColumnName] }
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
            dataServiceQuery: ['purchase_order', 'purchase_order'],
            onResult(res, params, prevResult: Result): Result {
              prevResult.current = processResult(res, params, prevResult.moment, true)
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
            dataServiceQuery: ['purchase_order', 'purchase_order'],
            onResult(res, params, prevResult: Result): Result {
              prevResult.last = processResult(res, params, prevResult.moment, false)
              return prevResult
            }
          }
        ],
      ]
    },
    {
      type: 'postProcess',
      postProcess(params, { current, last }: Result): any[] {
        return current.concat(last)
      }
    },
  ],
  filters: [{
    display: 'yAxis',
    name: 'yAxis',
    props: {
      items: [
        {
          label: 'totalpo',
          value: 'totalpo',
        },
        {
          label: 'quantity',
          value: 'quantity',
        },
        
      ],
      required: true,
    },
    type: 'list',
  }]
} as JqlDefinition

