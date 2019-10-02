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
  JoinClause,
  IsNullExpression,
  InExpression,
  CreateFunctionJQL,
  MathExpression,
} from 'node-jql'

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

// hardcode all reportingGroup and divided into SEA and AIR
const moduleTypeCodeList = {
  AIR: ['AC', 'AD', 'AM', 'AN', 'AW', 'AX', 'AZ'],
  SEA: ['SA', 'SB', 'SC', 'SR', 'SS', 'ST', 'SW', 'SZ', 'SA'],
  LOG: ['ZL']
}

function prepareParams(): Function {
  return function(require, session, params) {
    // import
    const moment = require('moment')

    // limit/extend to 1 year
    const subqueries = (params.subqueries = params.subqueries || {})
    const year = (subqueries.data ? moment() : moment(subqueries.date.from, 'YYYY-MM-DD')).year()
    subqueries.date.from = moment()
      .year(year)
      .startOf('year')
      .format('YYYY-MM-DD')
    subqueries.date.to = moment()
      .year(year)
      .endOf('year')
      .format('YYYY-MM-DD')

    // select
    params.fields = ['moduleTypeCode', 'reportingGroup', 'jobMonth', 'shipments']

    // group by
    params.groupBy = ['moduleTypeCode', 'reportingGroup', 'jobMonth']

    return params
  }
}

function prepareTable(): CreateTableJQL {

  return new CreateTableJQL({
    $temporary: true,
    name: 'shipment',

    $as: new Query({

      $select: [

        new ResultColumn(new ColumnExpression('moduleTypeCode')),
        new ResultColumn(
          new FunctionExpression('MONTHNAME', new ColumnExpression('jobMonth'), 'YYYY-MM'),
          'month'
        ),
        new ResultColumn(new ColumnExpression('reportingGroup')),
        new ResultColumn(new ColumnExpression('shipments'), 'count'),

      ],
      $from: new FromTable(
        {
          method: 'POST',
          url: 'api/shipment/query/shipment',
          columns: [

            { name: 'moduleTypeCode', type: 'string' },
            { name: 'jobMonth', type: 'string' },
            { name: 'reportingGroup', type: 'string' },
            { name: 'shipments', type: 'number' }
          ],
        },
        'shipment'
      ),
    }),
  })
}

function prepareFinalTable(): CreateTableJQL {

  const $select = [

    new ResultColumn(new ColumnExpression('moduleTypeCode')),
    new ResultColumn(new ColumnExpression('reportingGroup'))
  ]

  months.forEach((month: string) => {

    $select.push(new ResultColumn(new FunctionExpression('IFNULL', new FunctionExpression('FIND',

      new AndExpressions([
        new BinaryExpression(new ColumnExpression('month'), '=', month),
      ]),

      new ColumnExpression('count'),

    ), 0), `${month}-count`)

    )

  })

  return new CreateTableJQL({
    $temporary: true,
    name: 'final',

    $as: new Query({

      $select,

      $from: 'shipment',

      $group: new GroupBy([new ColumnExpression('moduleTypeCode'), new ColumnExpression('reportingGroup')]),

    }),
  })

}

function prepareReportingGroupTable(): CreateTableJQL {

  const name = 'reportingGroupTable'

  return new CreateTableJQL({
    $temporary: true,
    name,
    columns: [
      new Column('moduleTypeCode', 'string'),
      new Column('reportingGroup', 'string')

    ],
  })
}

function insertReportingGroupTable(): InsertJQL {

  const name = 'reportingGroupTable'

  const insertList = []

  for (const moduleTypeCode in moduleTypeCodeList) {
    if (moduleTypeCodeList.hasOwnProperty(moduleTypeCode)) {
      const reportingGroupList = moduleTypeCodeList[moduleTypeCode] as string[]

      reportingGroupList.map((reportingGroup: string) => {
        insertList.push({ reportingGroup, moduleTypeCode })
      })

    }
  }

  return new InsertJQL(name, ...insertList)
}

function prepareResultTable(): CreateTableJQL {

  const $select = [
    new ResultColumn(new ColumnExpression('reportingGroupTable', 'moduleTypeCode'), 'moduleTypeCode'),
    new ResultColumn(new ColumnExpression('reportingGroupTable', 'reportingGroup'), 'reportingGroup'),
  ]

  months.map((month) => {

    $select.push(new ResultColumn(new FunctionExpression(

      new FunctionExpression('IFNULL', new ColumnExpression('final', `${month}-count`), 0),

    ), `${month}-count`))

  })

  return new CreateTableJQL({

    $temporary: true,
    name: 'result',

    $as: new Query({

      $select,

      $from: new FromTable('reportingGroupTable', 'reportingGroupTable', {
        operator: 'LEFT',
        table: 'final',
        $on: new BinaryExpression(
          new ColumnExpression('final', 'reportingGroup'),
          '=',
          new ColumnExpression('reportingGroupTable', 'reportingGroup')
        ),
      }),

    }),

  })

}

export default [

  [prepareParams(), prepareTable()],
  prepareFinalTable(),

  prepareReportingGroupTable(),
  insertReportingGroupTable(),

  prepareResultTable(),

  new Query({

    $select: [
      new ResultColumn('moduleTypeCode', '__id'),
      new ResultColumn('moduleTypeCode', '__value'),
      new ResultColumn(new FunctionExpression('ROWS', new ColumnExpression('*')), '__rows'),
    ],

    $from: 'result',
    $group: 'moduleTypeCode',
  })

]
