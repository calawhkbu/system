import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { BadRequestException } from '@nestjs/common'
import { AxiosResponse } from 'axios'
import Moment = require('moment')

function prepareParams(params: IQueryParams, type: string): IQueryParams {
  const subqueries = (params.subqueries = params.subqueries || {})
  if (!subqueries.division) throw new BadRequestException('MISSING_DIVISION')
  if (subqueries.division && subqueries.division !== true && 'value' in subqueries.division) {
    if (subqueries.division.value[0] !== 'SE' && subqueries.division.value[0] !== 'SI') throw new Error('DIVISION_NOT_SUPPORTED')
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
            async onResult(res, params, prevResult, user): Promise<any> {
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
            async onResult(res, params, prevResult, user): Promise<any> {
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
            async onResult(res, params, prevResult, user): Promise<any> {
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
      postProcess(params, prevResult): any[] {
        return prevResult.FCL.concat(prevResult.LCL).concat(prevResult.Consol).sort((l, r) => {
          l = l.type.split('-')[1]
          r = r.type.split('-')[1]
          return l.localeCompare(r)
        })
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
  Value,
} from 'node-jql'
import { parseCode } from 'utils/function'

function prepareParams(type: string): Function {
  const fn = function(require, session, params) {
    // import
    const { BadRequestException } = require('@nestjs/common')

    // script
    const subqueries = (params.subqueries = params.subqueries || {})
    if (!subqueries.division) throw new BadRequestException('MISSING_DIVISION')
    if (subqueries.division) {
      if (subqueries.division.value[0] !== 'SE' && subqueries.division.value[0] !== 'SI')
        throw new Error('DIVISION_NOT_SUPPORTED')
      subqueries.division.value[0] += ' ' + type
    }
    return params
  }
  let code = fn.toString()
  code = code.replace(new RegExp('type', 'g'), `'${type}'`)
  return parseCode(code)
}

function prepareTable(name: string): CreateTableJQL {
  return new CreateTableJQL({
    $temporary: true,
    name,
    $as: new Query({
      $select: [
        new ResultColumn(new Value(name), 'type'),
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
        name
      ),
    }),
  })
}

function prepareSubTable(type: string, name: string): CreateTableJQL {
  return new CreateTableJQL({
    $temporary: true,
    name: `${type}-${name}`,
    $as: new Query({
      $select: [
        new ResultColumn(new Value(`${type}-${name}`), 'type'),
        new ResultColumn('year'),
        new ResultColumn('month'),
        new ResultColumn('currency'),
        new ResultColumn(new ColumnExpression(name), 'value'),
      ],
      $from: type,
    }),
  })
}

export default [
  [prepareParams('FCL'), prepareTable('FCL')],
  [prepareParams('LCL'), prepareTable('LCL')],
  [prepareParams('Consol'), prepareTable('Consol')],
  prepareSubTable('FCL', 'grossProfit'),
  prepareSubTable('LCL', 'grossProfit'),
  prepareSubTable('Consol', 'grossProfit'),
  prepareSubTable('FCL', 'revenue'),
  prepareSubTable('LCL', 'revenue'),
  prepareSubTable('Consol', 'revenue'),
  new Query({
    $from: 'FCL-grossProfit',
    $union: new Query({
      $from: 'LCL-grossProfit',
      $union: new Query({
        $from: 'Consol-grossProfit',
        $union: new Query({
          $from: 'FCL-revenue',
          $union: new Query({
            $from: 'LCL-revenue',
            $union: new Query('Consol-revenue'),
          }),
        }),
      }),
    }),
  }),
] */
