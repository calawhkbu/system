import {
  MathExpression, Query, CreateTableJQL, InsertJQL, ResultColumn,
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
    // import
    const moment = require('moment')
    const { BadRequestException } = require('@nestjs/common')

    const subqueries = (params.subqueries = params.subqueries || {})

    if (!subqueries.summaryVariables) throw new BadRequestException('MISSING_summaryVariables')
    let summaryVariables = subqueries.summaryVariables.value // should be chargeableWeight/cbm/grossWeight/totalShipment
    summaryVariables = Array.isArray(summaryVariables) ? summaryVariables : [summaryVariables]

    // limit/extend to 1 year
    const year = (subqueries.data ? moment() : moment(subqueries.date.from, 'YYYY-MM-DD')).year()
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

    name : 'result',
    columns : [
      {
        name : 'type',
        type : 'string'
      },
      {
        name : 'month',
        type : 'string'
      },
      {
        name : 'value',
        type : 'number'
      },

    ]
  })
}

function insertData() {

  return async function(require, session, params)
  {

    const { CreateTableJQL, FromTable, Query } = require('node-jql')
    const { Resultset } = require('node-jql-core')

    let summaryVariables = params.subqueries.summaryVariables.value // should be chargeableWeight/cbm/grossWeight/totalShipment
    summaryVariables = Array.isArray(summaryVariables) ? summaryVariables : [summaryVariables]

    const rawResultList = new Resultset(await session.query(new Query('raw'))).toArray() as any[]

    const finalResult = []

    rawResultList.map(rawResult => {

      summaryVariables.map(variable => {

        if (rawResult[variable])
        {
          finalResult.push({
            type : variable,
            month : rawResult['month'],
            value : rawResult[variable]

          })

        }

      })

    })

    return new InsertJQL('result', ...finalResult)

  }

}

function prepareData(): Function {

  return function(require, session, params) {

    const tableName = 'raw'

    const { CreateTableJQL, FromTable, GroupBy, ColumnExpression, ResultColumn, FunctionExpression } = require('node-jql')

    let summaryVariables = params.subqueries.summaryVariables.value // should be chargeableWeight/cbm/grossWeight/totalShipment
    summaryVariables = Array.isArray(summaryVariables) ? summaryVariables : [summaryVariables]

    const $select = [
      new ResultColumn(
        new FunctionExpression('MONTHNAME', new ColumnExpression('jobMonth'), 'YYYY-MM'),
        'month'
      ),
      ...summaryVariables]

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
              ...summaryVariables.map(variable => ({ name : variable, type : 'number' }))

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

   $from : 'result'
  })

]

// filters avaliable for this card
// all card in DB record using this jql will have these filter
export const filters = [

  {

    // what to find in the groupby
    name : 'summaryVariables',
    type : 'list',
    default : [],
    props : {
      required : true,

      // // note : if set multi into true , user can select multiple summary variable and will return multiple dataset
      // // warning : but still need to config in card db record
      // multi : true,

      items : [

        {
          label: 'chargeableWeight',
          value: 'chargeableWeight'
        },
        {
          label: 'grossWeight',
          value: 'grossWeight'
        },
        {
          label: 'cbm',
          value: 'cbm'
        },
        {
          label: 'totalShipment',
          value: 'totalShipment'
        }

      ]

    }

  }
]
