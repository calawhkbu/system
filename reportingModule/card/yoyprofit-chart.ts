import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import Moment = require('moment')

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
            async prepareParams(params, prevResult, user): Promise<IQueryParams> {
              if (!prevResult.moment) prevResult.moment = (await this.preparePackages(user)).moment
              return prepareParams(params, prevResult.moment, true)
            }
          },
          {
            type: 'callAxios',
            injectParams: true,
            axiosConfig: {
              method: 'POST',
              url: 'api/shipment/query/profit'
            },
            onAxiosResponse(res, params, prevResult): any {
              prevResult.current = processResult(res.data, prevResult.moment)
              return prevResult
            }
          }
        ],
        // last year
        [
          {
            type: 'prepareParams',
            async prepareParams(params, prevResult, user): Promise<IQueryParams> {
              if (!prevResult.moment) prevResult.moment = (await this.preparePackages(user)).moment
              return prepareParams(params, prevResult.moment, false)
            }
          },
          {
            type: 'callAxios',
            injectParams: true,
            axiosConfig: {
              method: 'POST',
              url: 'api/shipment/query/profit'
            },
            onAxiosResponse(res, params, prevResult): any {
              prevResult.last = processResult(res.data, prevResult.moment)
              return prevResult
            }
          }
        ],
      ]
    },
    {
      type: 'postProcess',
      postProcess(params, prevResult): any[] {
        return prevResult.current.concat(prevResult.last)
      }
    }
  ]
} as JqlDefinition

/* import {
  Query,
  FromTable,
  CreateTableJQL,
  ResultColumn,
  ColumnExpression,
  FunctionExpression,
} from 'node-jql'
import { parseCode } from 'utils/function'

function prepareParams(thisYear?: boolean): Function {
  const fn = function(require, session, params) {
    const { moment } = params.packages
    const subqueries = (params.subqueries = params.subqueries || {})
    if (subqueries.date) {
      let year = moment(subqueries.date.from, 'YYYY-MM-DD').year()
      if (!thisYear) year -= 1
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
  let code = fn.toString()
  code = code.replace(new RegExp('thisYear', 'g'), String(thisYear))
  return parseCode(code)
}

function prepareTable(name: string): CreateTableJQL {
  return new CreateTableJQL({
    $temporary: true,
    name,
    $as: new Query({
      $select: [
        new ResultColumn(
          new FunctionExpression('YEAR', new ColumnExpression('jobMonth'), 'YYYY-MM'),
          'year'
        ),
        new ResultColumn(
          new FunctionExpression('MONTHNAME', new ColumnExpression('jobMonth'), 'YYYY-MM'),
          'month'
        ),
        new ResultColumn('currency'),
        new ResultColumn(
          new FunctionExpression('ROUND', new ColumnExpression('grossProfit'), 0),
          'grossProfit'
        ),
      ],
      $from: new FromTable(
        {
          method: 'POST',
          url: 'api/shipment/query/profit',
          columns: [
            {
              name: 'officePartyCode',
              type: 'string',
            },
            {
              name: 'currency',
              type: 'string',
            },
            {
              name: 'jobMonth',
              type: 'string',
            },
            {
              name: 'grossProfit',
              type: 'number',
            },
          ],
        },
        name
      ),
    }),
  })
}

export default [
  [prepareParams(true), prepareTable('current')],
  [prepareParams(), prepareTable('last')],
  new Query({
    $from: 'last',
    $union: new Query('current'),
  }),
] */
