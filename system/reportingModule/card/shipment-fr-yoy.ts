import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import Moment = require('moment')
import { OrderBy } from 'node-jql'
import { expandSummaryVariable } from 'utils/card'

interface Result {
  moment: typeof Moment
  summaryVariables: string[]
  result: any[]
}

export default {
  constants: {
    typeCodeList: ['F', 'R', 'T']
  },
  jqls: [
    {
      type: 'prepareParams',
      defaultResult: {},
      async prepareParams(params, prevResult: Result, user): Promise<IQueryParams> {
        const moment = prevResult.moment = (await this.preparePackages(user)).moment

        const subqueries = (params.subqueries = params.subqueries || {})

        // let summaryVariables: string[] = []
        // if (subqueries.summaryVariables && subqueries.summaryVariables !== true && 'value' in subqueries.summaryVariables) {
        //   // sumamary variable
        //   summaryVariables = Array.isArray(subqueries.summaryVariables.value ) ? subqueries.summaryVariables.value  : [subqueries.summaryVariables.value ]
        // }
        // if (subqueries.summaryVariable && subqueries.summaryVariable !== true && 'value' in subqueries.summaryVariable) {
        //   summaryVariables = [...new Set([...summaryVariables, subqueries.summaryVariable.value] as string[])]
        // }
        // if (!(summaryVariables && summaryVariables.length)){
        //   throw new Error('MISSING_summaryVariables')
        // }
        // prevResult.summaryVariables = summaryVariables

        const summaryVariables = expandSummaryVariable(subqueries)
        prevResult.summaryVariables = summaryVariables

        if (subqueries.date && subqueries.date !== true && 'from' in subqueries.date) {
          const year = moment(subqueries.date.from, 'YYYY-MM-DD').year()
          subqueries.date = {
            currentFrom: moment().year(year).startOf('year').format('YYYY-MM-DD'),
            currentTo: moment().year(year).endOf('year').format('YYYY-MM-DD'),
            lastFrom: moment().year(year - 1).startOf('year').format('YYYY-MM-DD'),
            lastTo: moment().year(year - 1).endOf('year').format('YYYY-MM-DD'),
          } as any
        }

        // select
        params.fields = [ ...summaryVariables.map(x => `fr_${x}MonthLastCurrent`)]

        params.sorting = new OrderBy(`total_T_${summaryVariables[0]}Current`, 'DESC')

        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['shipment', 'shipment'],
      onResult(res, params, { moment, summaryVariables }: Result): any[] {
        const { typeCodeList } = params.constants
        return res.reduce<any[]>((r, row) => {
          for (const m of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) {
            const month = moment().month(m).format('MMMM')
            const row_: any = { month }
            for (const variable of summaryVariables) {
              for (const type of typeCodeList) {
                for (const lastOrCurrent of ['Last', 'Current']) {
                  const from = `${month}_${type}_${variable}${lastOrCurrent}`
                  const to = `${type}_${variable}${lastOrCurrent}`
                  const value = +row[from]
                  row_[to] = isNaN(value) ? 0 : value
                }
              }
            }
            r.push(row_)
          }
          return r
        }, [])
      }
    }
  ]
} as JqlDefinition

/* import {
  ColumnExpression,
  CreateTableJQL,
  FromTable,
  FunctionExpression,
  GroupBy,
  Query,
  ResultColumn,
  OrderBy,
  JoinClause,
  BinaryExpression,
  IsNullExpression,
  CreateFunctionJQL,
  Value,
  AndExpressions,
  InsertJQL,
  Column,
} from 'node-jql'

import { parseCode } from 'utils/function'

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function prepareParams(): Function {
  return function(require, session, params) {

    const { moment } = params.packages

    const { OrderBy } = require('node-jql')

    const subqueries = (params.subqueries = params.subqueries || {})

    let summaryVariables: string[] = []
    if (subqueries.summaryVariables && subqueries.summaryVariables.value)
    {
      // sumamary variable
      summaryVariables = Array.isArray(subqueries.summaryVariables.value ) ? subqueries.summaryVariables.value  : [subqueries.summaryVariables.value ]
    }

    if (subqueries.summaryVariable && subqueries.summaryVariable.value)
    {
      summaryVariables = [...new Set([...summaryVariables, subqueries.summaryVariable.value] as string[])]
    }

    if (!(summaryVariables && summaryVariables.length)){
      throw new Error('MISSING_summaryVariables')
    }

    if (subqueries.date) {
      const year = moment(subqueries.date.from, 'YYYY-MM-DD').year()
      subqueries.date = {
        currentFrom: moment().year(year).startOf('year').format('YYYY-MM-DD'),
        currentTo: moment().year(year).endOf('year').format('YYYY-MM-DD'),

        lastFrom: moment().year(year - 1).startOf('year').format('YYYY-MM-DD'),
        lastTo: moment().year(year - 1).endOf('year').format('YYYY-MM-DD'),

      }
    }

    // select
    params.fields = [ ...summaryVariables.map(x => `fr_${x}MonthLastCurrent`)]

    params.sorting = new OrderBy(`total_T_${summaryVariables[0]}Current`, 'DESC')

    return params
  }

}

// create Table first
function createTable() {

  return function(require, session, params) {

    const subqueries = (params.subqueries = params.subqueries || {})

    let summaryVariables: string[] = []
    if (subqueries.summaryVariables && subqueries.summaryVariables.value)
    {
      // sumamary variable
      summaryVariables = Array.isArray(subqueries.summaryVariables.value ) ? subqueries.summaryVariables.value  : [subqueries.summaryVariables.value ]
    }

    if (subqueries.summaryVariable && subqueries.summaryVariable.value)
    {
      summaryVariables = [...new Set([...summaryVariables, subqueries.summaryVariable.value] as string[])]
    }

    if (!(summaryVariables && summaryVariables.length)){
      throw new Error('MISSING_summaryVariables')
    }

    const columns = [{
      name: 'month',
      type: 'string'
    }]

    const typeCodeList = ['F', 'R', 'T']

    summaryVariables.map(summaryVariable => {

      typeCodeList.map(typeCode => {
        columns.push({
          name: `${typeCode}_${summaryVariable}Last`,
          type: 'number'
        })

        columns.push({
          name: `${typeCode}_${summaryVariable}Current`,
          type: 'number'
        })

      })

    })

    return new CreateTableJQL({

      name: 'result',
      columns
    })
  }

}

function insertTable() {

  return async function(require, session, params) {

    const { InsertJQL } = require('node-jql')
    const { Resultset } = require('node-jql-core')

    const subqueries = (params.subqueries = params.subqueries || {})

    let summaryVariables: string[] = []
    if (subqueries.summaryVariables && subqueries.summaryVariables.value)
    {
      // sumamary variable
      summaryVariables = Array.isArray(subqueries.summaryVariables.value ) ? subqueries.summaryVariables.value  : [subqueries.summaryVariables.value ]
    }

    if (subqueries.summaryVariable && subqueries.summaryVariable.value)
    {
      summaryVariables = [...new Set([...summaryVariables, subqueries.summaryVariable.value] as string[])]
    }

    if (!(summaryVariables && summaryVariables.length)){
      throw new Error('MISSING_summaryVariables')
    }

    const typeCodeList = ['F', 'R', 'T']

    const queryResultList = new Resultset(await session.query(new Query('raw'))).toArray() as any[]
    const queryResultObject = queryResultList[0]

    const resultList = months.map(month => {

      const insertObject = {
        month
      }

      summaryVariables.map(summaryVariable => {

        typeCodeList.map(typeCode => {

          const insertColumnNameLast = `${typeCode}_${summaryVariable}Last`
          const insertColumnNameCurrent = `${typeCode}_${summaryVariable}Current`

          const columnNameLast = `${month}_${typeCode}_${summaryVariable}Last`
          const columnNameCurrent = `${month}_${typeCode}_${summaryVariable}Current`

          insertObject[insertColumnNameLast] = queryResultObject[columnNameLast]
          insertObject[insertColumnNameCurrent] = queryResultObject[columnNameCurrent]

        })
      })
      return insertObject

    })

    return new InsertJQL('result', ...resultList)

  }

}

function prepareRaw() {

  return function(require, session, params) {

    const subqueries = (params.subqueries = params.subqueries || {})

    let summaryVariables: string[] = []
    if (subqueries.summaryVariables && subqueries.summaryVariables.value)
    {
      // sumamary variable
      summaryVariables = Array.isArray(subqueries.summaryVariables.value ) ? subqueries.summaryVariables.value  : [subqueries.summaryVariables.value ]
    }

    if (subqueries.summaryVariable && subqueries.summaryVariable.value)
    {
      summaryVariables = [...new Set([...summaryVariables, subqueries.summaryVariable.value] as string[])]
    }

    if (!(summaryVariables && summaryVariables.length)){
      throw new Error('MISSING_summaryVariables')
    }

    const typeCodeList = ['F', 'R', 'T']

    const columns = []

    summaryVariables.map(summaryVariable => {

      months.map(month => {
        typeCodeList.map(typeCode => {

          columns.push({
            name: `${month}_${typeCode}_${summaryVariable}Last`,
            type: 'number'
          })

          columns.push({
            name: `${month}_${typeCode}_${summaryVariable}Current`,
            type: 'number'
          })

        })
      })
    })

    return new CreateTableJQL({
      $temporary: true,
      name: 'raw',

      $as: new Query({
        $from: new FromTable(
          {
            method: 'POST',
            url: 'api/shipment/query/shipment',
            columns
          },
          'shipment'
        )
      }),

    })

  }

}

export default [
  // prepare 2 table and union them

  [prepareParams(), createTable()],
  [prepareParams(), prepareRaw()],
  insertTable(),

  new Query({

    $from: 'result'
  })
]

// filters avaliable for this card
// all card in DB record using this jql will have these filter
export const filters = [] */
