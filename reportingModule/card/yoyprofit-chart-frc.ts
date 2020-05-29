import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import Moment = require('moment')

export default {
  jqls: [
    {
      type: 'prepareParams',
      defaultResult: {},
      async prepareParams(params, prevResult, user): Promise<IQueryParams> {
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
      type: 'callAxios',
      injectParams: true,
      axiosConfig: {
        method: 'POST',
        url: 'api/shipment/query/profit-frc'
      },
      onAxiosResponse(res, params, prevResult): any[] {
        const moment: typeof Moment = prevResult.moment
        return res.data.map(row => {
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

/* import {
  Query,
  FromTable,
  ResultColumn,
  ColumnExpression,
  FunctionExpression,
} from 'node-jql'
import moment = require('moment')

function prepareParams(): Function {
  return function(require, session, params) {
    const { moment } = params.packages
    const subqueries = (params.subqueries = params.subqueries || {})
    if (subqueries.date) {
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
}

function prepareQuery(): Query {
  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => moment(month, 'M').format('MMMM'))

  return new Query({
    $select: [
      new ResultColumn(
        'carrierName'
      ),
      new ResultColumn(
        new FunctionExpression('ROUND', new ColumnExpression(`total_F_grossProfit`), 0),
        `total_F_grossProfit`
      ),
      new ResultColumn(
        new FunctionExpression('ROUND', new ColumnExpression(`total_R_grossProfit`), 0),
        `total_R_grossProfit`
      ),
      new ResultColumn(
        new FunctionExpression('ROUND', new ColumnExpression(`total_C_grossProfit`), 0),
        `total_C_grossProfit`
      ),
      ...months.map(month => new ResultColumn(
        new FunctionExpression('ROUND', new ColumnExpression(`${month}_F_grossProfit`), 0),
        `${month}_F_grossProfit`
      )),
      ...months.map(month => new ResultColumn(
        new FunctionExpression('ROUND', new ColumnExpression(`${month}_R_grossProfit`), 0),
        `${month}_R_grossProfit`
      )),
      ...months.map(month => new ResultColumn(
        new FunctionExpression('ROUND', new ColumnExpression(`${month}_C_grossProfit`), 0),
        `${month}_C_grossProfit`
      )),
    ],
    $from: new FromTable(
      {
        method: 'POST',
        url: 'api/shipment/query/profit-frc',
        columns: [
          {
            name: 'officePartyCode',
            type: 'string',
          },
          {
            name: 'carrierName',
            type: 'string',
          },
          {
            name: 'currency',
            type: 'string',
          },
          {
            name: `total_F_grossProfit`,
            type: 'number' as any,
          },
          {
            name: `total_R_grossProfit`,
            type: 'number' as any,
          },
          {
            name: `total_C_grossProfit`,
            type: 'number' as any,
          },
          ...months.map(month => ({
            name: `${month}_F_grossProfit`,
            type: 'number' as any,
          })),
          ...months.map(month => ({
            name: `${month}_R_grossProfit`,
            type: 'number' as any,
          })),
          ...months.map(month => ({
            name: `${month}_C_grossProfit`,
            type: 'number' as any,
          })),
        ],
      },
      'profit'
    ),
  })
}

export default [
  [prepareParams(), prepareQuery()]
] */
