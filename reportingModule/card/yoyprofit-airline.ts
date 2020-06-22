import { JqlDefinition } from 'modules/report/interface'

export default {
  extend: 'card/yoyprofit-airline-frc',
  override: def => {
    console.log('override', 'yoyprofit-airline')
    def.jqls.push({
      type: 'postProcess',
      async postProcess(params, prevResult: any[], user): Promise<any[]> {
        const { moment } = await this.preparePackages(user)
        console.log('added postprocess', 'yoyprofit-airline')
        return prevResult.map(row => {
          const row_: any = { carrierName: row.carrierName }
          for (const m of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
            const month = m === 12 ? 'total' : moment().month(m).format('MMMM')
            const to = `${month}_grossProfit`
            for (const type of ['F', 'R', 'C']) {
              const from = `${month}_${type}_grossProfit`
              row_[to] = (row_[to] || 0) + row[from]
            }
          }
          return row_
        })
      }
    })
    return def
  },
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
