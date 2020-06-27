import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import Moment = require('moment')

interface Result {
  moment: typeof Moment
  summaryVariables: string[]
}

export default {
  jqls: [
    {
      type: 'prepareParams',
      defaultResult: {},
      async prepareParams(params, prevResult: Result, user): Promise<IQueryParams> {
        const moment = prevResult.moment = (await this.preparePackages(user)).moment
        const subqueries = (params.subqueries = params.subqueries || {})

        let summaryVariables: string[] = []
        if (subqueries.summaryVariables && subqueries.summaryVariables !== true && 'value' in subqueries.summaryVariables) {
          // sumamary variable
          summaryVariables = Array.isArray(subqueries.summaryVariables.value ) ? subqueries.summaryVariables.value  : [subqueries.summaryVariables.value ]
        }
        if (subqueries.summaryVariable && subqueries.summaryVariable !== true && 'value' in subqueries.summaryVariable) {
          summaryVariables = [...new Set([...summaryVariables, subqueries.summaryVariable.value] as string[])]
        }
        if (!(summaryVariables && summaryVariables.length)) {
          throw new Error('MISSING_summaryVariables')
        }
        prevResult.summaryVariables = summaryVariables

        // limit/extend to 1 year
        const year = subqueries.date && subqueries.date !== true && 'from' in subqueries.date ?  moment(subqueries.date.from, 'YYYY-MM-DD').year() : moment().year()
        subqueries.date = {
          from: moment()
            .year(year)
            .startOf('year')
            .format('YYYY-MM-DD'),
          to: moment()
            .year(year)
            .endOf('year')
            .format('YYYY-MM-DD')
        }

        // group by
        params.groupBy = ['jobMonth']

        params.fields = ['jobMonth', ...summaryVariables]

        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['shipment', 'shipment'],
      onResult(res, params, { moment, summaryVariables }): any[] {
        res = res.map(row => {
          const row_: any = { jobMonth: row.jobMonth }
          for (const variable of summaryVariables) {
            const value = row[variable]
            row_[variable] = isNaN(value) ? 0 : value
          }
          return row_
        })

        const result: any[] = []
        for (const row of res) {
          for (const variable of summaryVariables) {
            result.push({
              type: variable,
              month: moment(row.jobMonth, 'YYYY-MM').format('MMMM'),
              value: row[variable]
            })
          }
        }
        return result
      }
    }
  ],
  filters: [
    {
      // what to find in the groupby
      name: 'summaryVariables',
      type: 'list',
      default: [],
      props: {
        required: true,
        // // note : if set multi into true , user can select multiple summary variable and will return multiple dataset
        // // warning : but still need to config in card db record
        // multi : true,
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
          {
            label: 'teu',
            value: 'teu',
          },
          {
            label: 'teuInReport',
            value: 'teuInReport',
          },
          {
            label: 'quantity',
            value: 'quantity',
          },
        ],
      },
    },
  ]
} as JqlDefinition

/* import { MathExpression, Query, CreateTableJQL, InsertJQL, ResultColumn } from 'node-jql'

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
    // import
    const { moment } = params.packages
    const { BadRequestException } = require('@nestjs/common')

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

    // limit/extend to 1 year
    const year = subqueries.date ?  moment(subqueries.date.from, 'YYYY-MM-DD').year() : moment().year()
    subqueries.date.from = moment()
      .year(year)
      .startOf('year')
      .format('YYYY-MM-DD')
    subqueries.date.to = moment()
      .year(year)
      .endOf('year')
      .format('YYYY-MM-DD')

    // group by
    params.groupBy = ['jobMonth']

    params.fields = ['jobMonth', ...summaryVariables]

    return params
  }
}

function createTable() {
  return new CreateTableJQL({
    name: 'result',
    columns: [
      {
        name: 'type',
        type: 'string',
      },
      {
        name: 'month',
        type: 'string',
      },
      {
        name: 'value',
        type: 'number',
      },
    ],
  })
}

function insertData() {
  return async function(require, session, params) {
    const { CreateTableJQL, FromTable, Query } = require('node-jql')
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

    const rawResultList = new Resultset(await session.query(new Query('raw'))).toArray() as any[]

    const finalResult = []

    rawResultList.map(rawResult => {
      summaryVariables.map(variable => {
        if (rawResult[variable]) {
          finalResult.push({
            type: variable,
            month: rawResult['month'],
            value: rawResult[variable],
          })
        }
      })
    })

    if (! (finalResult && finalResult.length))
    {
      throw new Error('NO_DATA')
    }

    return new InsertJQL('result', ...finalResult)
  }
}

function prepareData(): Function {
  return function(require, session, params) {
    const tableName = 'raw'

    const {
      CreateTableJQL,
      FromTable,
      GroupBy,
      ColumnExpression,
      ResultColumn,
      FunctionExpression,
    } = require('node-jql')

    let summaryVariables = params.subqueries.summaryVariables.value // should be chargeableWeight/cbm/grossWeight/totalShipment
    summaryVariables = Array.isArray(summaryVariables) ? summaryVariables : [summaryVariables]

    const $select = [
      new ResultColumn(
        new FunctionExpression('MONTHNAME', new ColumnExpression('jobMonth'), 'YYYY-MM'),
        'month'
      ),
      ...summaryVariables,
    ]

    return new CreateTableJQL({
      $temporary: true,
      name: tableName,

      $as: new Query({
        $select,
        $from: new FromTable(
          {
            method: 'POST',
            url: 'api/shipment/query/shipment',
            columns: [
              { name: 'jobMonth', type: 'string' },
              ...summaryVariables.map(variable => ({ name: variable, type: 'number' })),
            ],
          },
          'shipment'
        ),

        $group: new GroupBy(new ColumnExpression('jobMonth')),
      }),
    })
  }
}

export default [
  [prepareParams(), prepareData()],
  createTable(),
  insertData(),

  new Query({
    $from: 'result',
  }),
]

// filters avaliable for this card
// all card in DB record using this jql will have these filter
export const filters = [
  {
    // what to find in the groupby
    name: 'summaryVariables',
    type: 'list',
    default: [],
    props: {
      required: true,

      // // note : if set multi into true , user can select multiple summary variable and will return multiple dataset
      // // warning : but still need to config in card db record
      // multi : true,

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
        {
          label: 'teu',
          value: 'teu',
        },
        {
          label: 'teuInReport',
          value: 'teuInReport',
        },
        {
          label: 'quantity',
          value: 'quantity',
        },

      ],
    },
  },
] */
