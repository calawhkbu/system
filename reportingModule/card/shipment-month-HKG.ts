import {
  AndExpressions,
  BinaryExpression,
  ColumnExpression,
  CreateTableJQL,
  FromTable,
  FunctionExpression,
  InsertJQL,
  Value,
  Query,
  ResultColumn,
  Column,
  GroupBy,
  OrderBy,
  MathExpression,
} from 'node-jql'

import { parseCode } from 'utils/function'

function prepareParams(likeHouseNo_: string): Function {
  const fn = function(require, session, params) {
    // import
    const moment = require('moment')
    const subqueries = (params.subqueries = params.subqueries || {})

    // ---------------------summaryVariables

    let summaryVariables: string[]
    if (subqueries.summaryVariables && subqueries.summaryVariables.value)
    {
      // sumamary variable
      summaryVariables = subqueries.summaryVariables.value // should be chargeableWeight/cbm/grossWeight/totalShipment
    }

    else if (subqueries.summaryVariable && subqueries.summaryVariable.value)
    {
      summaryVariables = [subqueries.summaryVariable.value]
    }
    else {
      throw new Error('MISSING_summaryVariables')
    }

    // limit/extend to 1 year
    const year = (subqueries.date ? moment(subqueries.date.from, 'YYYY-MM-DD') : moment()).year()
    subqueries.date.from = moment()
      .year(year)
      .startOf('year')
      .format('YYYY-MM-DD')
    subqueries.date.to = moment()
      .year(year)
      .endOf('year')
      .format('YYYY-MM-DD')

    // warning : hardCode, very hardcode
    // TODO : need to hardcode partyId in new 360
    subqueries.viaHKG = true
    subqueries.likeHouseNo = { value: likeHouseNo_ }

    const codeColumnName = `officePartyCode`
    const nameColumnName = `officePartyName`

    const groupByVariables = [codeColumnName, nameColumnName]

    params.fields = [
      // select Month statistics
      ...summaryVariables.map(variable => `${variable}Month`),
      ...groupByVariables,
    ]

    // group by
    params.groupBy = [
      ...groupByVariables
    ]

    console.log(`params`)
    console.log(params)

    return params
  }

  let code = fn.toString()
  code = code.replace(new RegExp('likeHouseNo_', 'g'), `'${likeHouseNo_}'`)
  return parseCode(code)
}

function createTable() {
  return function(require, session, params) {
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

    const { CreateTableJQL, Column } = require('node-jql')

    const subqueries = (params.subqueries = params.subqueries || {})
    let summaryVariables: string[]

    if (subqueries.summaryVariables && subqueries.summaryVariables.value)
    {
      // sumamary variable
      summaryVariables = subqueries.summaryVariables.value // should be chargeableWeight/cbm/grossWeight/totalShipment
    }

    else if (subqueries.summaryVariable && subqueries.summaryVariable.value)
    {
      summaryVariables = [subqueries.summaryVariable.value]
    }
    else {
      throw new Error('MISSING_summaryVariables')
    }

    const columns = [
      new Column('name', 'string', true),
      new Column('code', 'string', true),
    ]

    summaryVariables.map(variable => {
      months.map(month => {

        const columnName = `${month}_${variable}`
        columns.push(new Column(columnName, 'number'))

      })

      const totalColumnName = `total_${variable}`
      columns.push(new Column(totalColumnName, 'number'))

    })

    // prepare temp table
    return new CreateTableJQL(true, 'shipment', columns)
  }
}

// call API
function prepareData(hardCodeOfficePartyName_: string) {
  const fn = function(require, session, params) {

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

    const {
      Query,
      ResultColumn,
      ColumnExpression,
      FunctionExpression,
      Value,
      InsertJQL,
      FromTable,
    } = require('node-jql')

    const subqueries = (params.subqueries = params.subqueries || {})

    let summaryVariables: string[]
    if (subqueries.summaryVariables && subqueries.summaryVariables.value)
    {
      // sumamary variable
      summaryVariables = subqueries.summaryVariables.value // should be chargeableWeight/cbm/grossWeight/totalShipment
    }

    else if (subqueries.summaryVariable && subqueries.summaryVariable.value)
    {
      summaryVariables = [subqueries.summaryVariable.value]
    }
    else {
      throw new Error('MISSING_summaryVariables')
    }

    const codeColumnName = `officePartyCode`

    const groupByVariables = [codeColumnName]

    const columns = [
      ...groupByVariables.map(variable => ({ name: variable, type: 'string', nullable: true })),
    ] as any

    const insertColumn = ['code', 'name']

    const $select = [
      new ResultColumn(new ColumnExpression(codeColumnName), 'code'),
      new ResultColumn(new Value(hardCodeOfficePartyName_), 'name'),
    ]

    summaryVariables.map(variable => {
      months.map(month => {

        const columnName = `${month}_${variable}`

        columns.push({ name: columnName, type: 'number' })
        insertColumn.push(columnName)
        $select.push(new ColumnExpression(columnName))

      })

      const totalColumnName = `total_${variable}`
      columns.push({ name: totalColumnName, type: 'number' })
      insertColumn.push(totalColumnName)
      $select.push(new ColumnExpression(totalColumnName))
    })

    return new InsertJQL({
      name: 'shipment',
      columns : insertColumn,
      query : new Query({
        $select,
        $from: new FromTable(
          {
            method: 'POST',
            url: 'api/shipment/query/shipment',
            columns
          },
          'shipment'
        ),

      })
    })
  }

  let code = fn.toString()
  code = code.replace(new RegExp('hardCodeOfficePartyName_', 'g'), `'${hardCodeOfficePartyName_}'`)
  return parseCode(code)
}

function finalQuery(types_?: string[]): Function {
  return function(require, session, params) {
    const {
      OrderBy,
      MathExpression,
      Query,
      ResultColumn,
      ColumnExpression,
      FunctionExpression,
      AndExpressions,
      BinaryExpression,
    } = require('node-jql')

    const fromTableName = 'shipment'

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

    return new Query({
      $from: fromTableName,
    })
  }
}

export default [

  createTable(),
  // prepare data

  // // insert one by one
  [prepareParams('GZH%'), prepareData('GGL GZH')],
  [prepareParams('XMN%'), prepareData('GGL XMN')],

  finalQuery(),

]

export const filters = [

  // for this filter, user can only select single,
  // but when config in card definition, use summaryVariables. Then we can set as multi
  {
    display: 'summaryVariable',
    name: 'summaryVariable',
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
      multi : false,
      required: true,
    },
    type: 'list',
  }
]
