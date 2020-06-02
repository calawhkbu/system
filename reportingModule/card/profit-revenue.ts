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
        if (subqueries.division && subqueries.division !== true && 'value' in subqueries.division) {
          subqueries.division.value = [subqueries.division.value]
        }
        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['shipment', 'profit'],
      onResult(res, params, prevResult): any[] {
        const moment: typeof Moment = prevResult.moment
        return res.reduce<any[]>((a, row) => {
          const mi = moment(row.jobMonth, 'YYYY-MM')
          const year = mi.format('YYYY')
          const month = mi.format('MMMM')
          a.push({
            type: 'grossProfit',
            year,
            month,
            currency: row.currency,
            value: row.grossProfit,
            percent: row.revenue === 0 ? 0 : row.grossProfit / row.revenue
          })
          a.push({
            type: 'revenue',
            year,
            month,
            currency: row.currency,
            value: row.revenue
          })
          return a
        }, [])
      }
    }
  ],
  filters: [{
    name: 'division',
    type: 'list',
    props: {
      multi: false,
    },
  }]
} as JqlDefinition

/* import {
  BinaryExpression,
  MathExpression,
  Query,
  FromTable,
  CreateTableJQL,
  ResultColumn,
  ColumnExpression,
  FunctionExpression,
  Value,
  JoinClause,
} from 'node-jql'

function prepareParams(): Function {
  return function(require, session, params) {
    // import
    const { moment } = params.packages

    // script
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
    if (subqueries.division) {
      subqueries.division.value = [subqueries.division.value]
    }
    return params
  }
}

function perpareIntermediate(): CreateTableJQL {
  return new CreateTableJQL({
    $temporary: true,
    name: 'intermediate',
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
        new ResultColumn(
          new FunctionExpression('ROUND', new ColumnExpression('revenue'), 0),
          'revenue'
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
            {
              name: 'revenue',
              type: 'number',
            },
          ],
        },
        'intermediate'
      ),
    }),
  })
}

function prepareTable(name: string): CreateTableJQL {
  return new CreateTableJQL({
    $temporary: true,
    name,
    $as: new Query({
      $select: [
        new ResultColumn(new Value(name), 'type'),
        new ResultColumn(new ColumnExpression('lhs', 'year')),
        new ResultColumn(new ColumnExpression('lhs', 'month')),
        new ResultColumn(new ColumnExpression('lhs', 'currency')),
        new ResultColumn(new ColumnExpression('lhs', name), 'value'),
        new ResultColumn(
          new MathExpression(
            new ColumnExpression('lhs', name),
            '/',
            new ColumnExpression('rhs', 'revenue')
          ),
          'percent'
        ),
      ],
      $from: new FromTable(
        'intermediate',
        'lhs',
        new JoinClause(
          'LEFT',
          new FromTable(new Query('intermediate'), 'rhs'),
          new BinaryExpression(
            new ColumnExpression('lhs', 'month'),
            '=',
            new ColumnExpression('rhs', 'month')
          )
        )
      ),
    }),
  })
}

export default [
  [prepareParams(), perpareIntermediate()],
  prepareTable('grossProfit'),
  prepareTable('revenue'),
  new Query({
    $from: 'grossProfit',
    $union: new Query('revenue'),
  }),
]

export const filters = [
  {
    name: 'division',
    type: 'list',
    props: {
      multi: false,
    },
  },
] */
