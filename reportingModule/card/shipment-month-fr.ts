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
  IsNullExpression,
  OrExpressions,
} from 'node-jql'

import { parseCode } from 'utils/function'

function prepareParams(type_: 'F' | 'R'): Function {
  const fn = function(require, session, params) {
    // import
    const moment = require('moment')
    const { OrderBy } = require('node-jql')
    const subqueries = (params.subqueries = params.subqueries || {})

    // idea : userGroupByVariable and userSummaryVariable is selected within filter by user

    if (!subqueries.groupByVariable || !subqueries.groupByVariable.value) throw new Error('MISSING_groupByVariable')
    if (!subqueries.topX || !subqueries.topX.value) throw new Error('MISSING_topX')

    // -----------------------------groupBy variable
    const groupByVariable = subqueries.groupByVariable.value // should be shipper/consignee/agent/controllingCustomer/carrier
    const codeColumnName = groupByVariable === 'carrier' ? `carrierCode` : `${groupByVariable}PartyCode`
    const nameColumnName = groupByVariable === 'carrier' ? `carrierName` : `${groupByVariable}PartyName`

    const groupByVariables = [codeColumnName, nameColumnName]

    const topX = subqueries.topX.value

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
    const year = subqueries.date ?  moment(subqueries.date.from, 'YYYY-MM-DD').year() : moment().year()
    subqueries.date.from = moment()
      .year(year)
      .startOf('year')
      .format('YYYY-MM-DD')
    subqueries.date.to = moment()
      .year(year)
      .endOf('year')
      .format('YYYY-MM-DD')

    // select
    params.fields = [
      ...groupByVariables, 'jobMonth', ...summaryVariables]

    // group by
    params.groupBy = [...groupByVariables, 'jobMonth']

    subqueries[`${groupByVariable}IsNotNull`]  = {
      value : true
    }

    // warning, will orderBy cbmMonth, if choose cbm as summaryVariables
    // params.sorting = new OrderBy(`${summaryVariables[0]}Month`, 'DESC')

    // // wait until uber3
    // params.limit = topX

    switch (type_) {
      case 'F':
        subqueries.nominatedTypeCode = { value: ['F'] }
        break
      case 'R':
        subqueries.nominatedTypeCode = { value: ['R'] }
        break
    }

    return params
  }

  let code = fn.toString()
  code = code.replace(new RegExp('type_', 'g'), `'${type_}'`)
  return parseCode(code)
}

// call API
function prepareData(type_: 'F' | 'R') {
  const fn = function(require, session, params) {
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

    // idea : userGroupByVariable and userSummaryVariable is selected within filter by user

    if (!subqueries.groupByVariable) throw new Error('MISSING_groupByVariable')

    // -----------------------------groupBy variable
    const groupByVariable = subqueries.groupByVariable.value // should be shipper/consignee/agent/controllingCustomer/carrier
    const codeColumnName = groupByVariable === 'carrier' ? `carrierCode` : `${groupByVariable}PartyCode`
    const nameColumnName = groupByVariable === 'carrier' ? `carrierName` : `${groupByVariable}PartyName`

    const groupByVariables = [codeColumnName, nameColumnName]

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

    return new InsertJQL({
      name: 'shipment',
      columns: [
        'type',
        'month',
        ...groupByVariables,
        ...summaryVariables
      ],
      query: new Query({
        $select: [
          new ResultColumn(new Value(type_), 'type'),

          new ResultColumn(
            new FunctionExpression('MONTHNAME', new ColumnExpression('jobMonth'), 'YYYY-MM'),
            'month'
          ),

          ...groupByVariables.map(
            variable =>
              new ResultColumn(new ColumnExpression(variable))
          ),

          ...summaryVariables.map(
            variable =>
              new ResultColumn(
                new FunctionExpression('IFNULL', new ColumnExpression(variable), 0),
                variable
              )
          ),
        ],
        $from: new FromTable(
          {
            method: 'POST',
            url: 'api/shipment/query/shipment',
            columns: [

              ...groupByVariables.map(variable => ({ name: variable, type: 'string', nullable : true })),
              { name: 'jobMonth', type: 'string' },
              ...summaryVariables.map(variable => ({ name: variable, type: 'number' })),
            ],
          },
          'shipment'
        ),
      }),
    })
  }

  let code = fn.toString()
  code = code.replace(new RegExp('type_', 'g'), `'${type_}'`)
  return parseCode(code)
}

function finalQuery(types_?: string[]): Function {
  const fn = function(require, session, params) {
    const {
      OrderBy,
      MathExpression,
      Query,
      ResultColumn,
      ColumnExpression,
      FunctionExpression,
      AndExpressions,
      BinaryExpression,
      Value
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

    const subqueries = (params.subqueries = params.subqueries || {})
    // groupBy variable
    const groupByVariable = subqueries.groupByVariable.value // should be shipper/consignee/agent/controllingCustomer/carrier
    const codeColumnName = groupByVariable === 'carrier' ? `carrierCode` : `${groupByVariable}PartyCode`
    const nameColumnName = groupByVariable === 'carrier' ? `carrierName` : `${groupByVariable}PartyName`

    const groupByVariables = [codeColumnName, nameColumnName]

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

    // ------------------ final order by
    let finalOrderBy: string[]
    if (subqueries.finalOrderBy && subqueries.finalOrderBy.value) {
      finalOrderBy = subqueries.finalOrderBy.value
    }
    else{
      // guess the final Order By
      finalOrderBy = [(types_ && types_.length) ? `total_T_${summaryVariables[0]}` : `total_${summaryVariables[0]}`]
    }

    // uber2
    const topX = subqueries.topX.value

    // ----------------------------------
    function composeSumExpression(dumbList: any[]): MathExpression {
      if (dumbList.length === 2) {
        return new MathExpression(dumbList[0], '+', dumbList[1])
      }

      const popResult = dumbList.pop()

      return new MathExpression(popResult, '+', composeSumExpression(dumbList))
    }

    const $select = [
      new ResultColumn(new ColumnExpression(codeColumnName), 'code'),
      new ResultColumn(new ColumnExpression(nameColumnName), 'name'),
      new ResultColumn(new Value(groupByVariable), 'groupByVariable'),
    ]

    summaryVariables.map(variable => {
      const finalSumList = []

      months.map(month => {
        const monthSumList = []

        if (types_ && types_.length) {
          // case when types is given

          types_.map((type: string) => {
            const expression = new FunctionExpression(
              'IFNULL',
              new FunctionExpression(
                'FIND',
                new AndExpressions([
                  new BinaryExpression(new ColumnExpression('month'), '=', month),
                  // hardcode
                  new BinaryExpression(new ColumnExpression('type'), '=', type),
                ]),
                new ColumnExpression(variable)
              ),
              0
            )

            const columnName = `${month}_${type}_${variable}`

            $select.push(new ResultColumn(expression, columnName))
            monthSumList.push(expression)
            finalSumList.push(expression)
          })

          // add the month sum expression
          const monthSumExpression = composeSumExpression(monthSumList)
          $select.push(new ResultColumn(monthSumExpression, `${month}_T_${variable}`))
        } else {
          // case when types is not given
          // month summary (e.g. January_T_cbm , sum of all type of Jan) is not needed

          const expression = new FunctionExpression(
            'IFNULL',
            new FunctionExpression(
              'FIND',
              new AndExpressions([
                new BinaryExpression(new ColumnExpression('month'), '=', month),
                // hardcode
              ]),
              new ColumnExpression(variable)
            ),
            0
          )

          const columnName = `${month}_${variable}`

          $select.push(new ResultColumn(expression, columnName))
          finalSumList.push(expression)
        }
      })

      // ----perform type total e.g. total_F_shipment-------------------------

      if (types_ && types_.length) {
        types_.map((type: string) => {
          const typeSumList = []

          months.map(month => {
            const columnName = `${month}_${type}_${variable}`

            const expression = new FunctionExpression(
              'IFNULL',
              new FunctionExpression(
                'FIND',
                new AndExpressions([
                  new BinaryExpression(new ColumnExpression('month'), '=', month),
                  // hardcode
                  new BinaryExpression(new ColumnExpression('type'), '=', type),
                ]),
                new ColumnExpression(variable)
              ),
              0
            )

            typeSumList.push(expression)
          })

          const typeSumExpression = composeSumExpression(typeSumList)
          $select.push(new ResultColumn(typeSumExpression, `total_${type}_${variable}`))
        })
      }

      // final total

      const finalSumExpression = composeSumExpression(finalSumList)

      if (types_ && types_.length) {
        $select.push(new ResultColumn(finalSumExpression, `total_T_${variable}`))
      } else {
        $select.push(new ResultColumn(finalSumExpression, `total_${variable}`))
      }
    })

    return new Query({
      $select,
      $from: fromTableName,

      $group: groupByVariables,
      $order: finalOrderBy.map(x => new OrderBy(x, 'DESC')),
    })
  }

  let code = fn.toString()

  code = code.replace(
    new RegExp('types_', 'g'),
    types_ && types_.length ? `[${types_.map(x => `'${x}'`)}]` : `[]`
  )

  return parseCode(code)
}

function createTable() {
  return function(require, session, params) {
    const { CreateTableJQL, Column } = require('node-jql')

    const subqueries = (params.subqueries = params.subqueries || {})

    if (!subqueries.groupByVariable || !subqueries.groupByVariable.value) throw new Error('MISSING_groupByVariable')
    if (!subqueries.topX || !subqueries.topX.value) throw new Error('MISSING_topX')
    // groupBy variable
    const groupByVariable = subqueries.groupByVariable.value // should be shipper/consignee/agent/controllingCustomer/carrier
    const codeColumnName = groupByVariable === 'carrier' ? `carrierCode` : `${groupByVariable}PartyCode`
    const nameColumnName = groupByVariable === 'carrier' ? `carrierName` : `${groupByVariable}PartyName`

    const groupByVariables = [codeColumnName, nameColumnName]

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

    // prepare temp table
    return new CreateTableJQL(true, 'shipment', [

      new Column(codeColumnName, 'string', true),
      new Column(nameColumnName, 'string', true),
      new Column('type', 'string'),
      new Column('month', 'string'),
      ...summaryVariables.map(variable => new Column(variable, 'number')),
    ])
  }
}

export default [
  createTable(),
  // prepare data

  [prepareParams('F'), prepareData('F')],
 [prepareParams('R'), prepareData('R')],

  finalQuery(['F', 'R']),
]

export const filters = [

  // for this filter, user can only select single,
  // but when config in card definition, use summaryVariables. Then we can set as multi

  {
    display: 'topX',
    name: 'topX',
    props: {
      items: [
        {
          label: '10',
          value: 10,
        },
        {
          label: '20',
          value: 20,
        },
        {
          label: '50',
          value: 50,
        }
      ],
      multi : false,
      required: true,
    },
    type: 'list',
  },

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
  },
  {
    display: 'groupByVariable',
    name: 'groupByVariable',
    props: {
      items: [
        {
          label: 'carrier',
          value: 'carrier',
        },
        // {
        //   label: 'shipper',
        //   value: 'shipper',
        // },
        // {
        //   label: 'consignee',
        //   value: 'consignee',
        // },
        // {
        //   label: 'agent',
        //   value: 'agent',
        // },
      ],
      required: true,
    },
    type: 'list',
  }
]
