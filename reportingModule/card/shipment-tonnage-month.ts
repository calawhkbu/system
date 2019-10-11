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
  LOG: ['ZL'],
}

function prepareParams(): Function {
  return function(require, session, params) {
    // import
    const moment = require('moment')

    // limit/extend to 1 year
    const subqueries = (params.subqueries = params.subqueries || {})

    const year = !subqueries.date
      ? moment().year()
      : moment(subqueries.date.from, 'YYYY-MM-DD').year()

    subqueries.date = {
      from : moment().year(year).startOf('year').format('YYYY-MM-DD'),
      to : moment().year(year).endOf('year').format('YYYY-MM-DD')
    }

    // select
    params.fields = ['moduleTypeCode', 'reportingGroup', 'jobMonth', 'teuOrCbm', 'chargeableWeight']

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
        new ResultColumn(new ColumnExpression('chargeableWeight')),
        new ResultColumn(new ColumnExpression('teuOrCbm')),
      ],
      $from: new FromTable(
        {
          method: 'POST',
          url: 'api/shipment/query/shipment',
          columns: [
            { name: 'moduleTypeCode', type: 'string' },
            { name: 'jobMonth', type: 'string' },
            { name: 'reportingGroup', type: 'string' },
            { name: 'teuOrCbm', type: 'number' },
            { name: 'chargeableWeight', type: 'number' },
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
    new ResultColumn(new ColumnExpression('reportingGroup')),
  ]

  months.forEach((month: string) => {
    $select.push(
      new ResultColumn(
        new FunctionExpression(
          'IFNULL',
          new FunctionExpression(
            'FIND',

            new AndExpressions([new BinaryExpression(new ColumnExpression('month'), '=', month)]),

            new FunctionExpression(
              'IF',
              new BinaryExpression(new ColumnExpression('moduleTypeCode'), '=', 'AIR'),
              new ColumnExpression('chargeableWeight'),
              new ColumnExpression('teuOrCbm')
            )
          ),
          0
        ),
        `${month}-value`
      )
    )
  })

  return new CreateTableJQL({
    $temporary: true,
    name: 'final',

    $as: new Query({
      $select,

      $from: 'shipment',

      $group: new GroupBy([
        new ColumnExpression('moduleTypeCode'),
        new ColumnExpression('reportingGroup'),
      ]),
    }),
  })
}

function prepareReportingGroupTable(): CreateTableJQL {
  const name = 'reportingGroupTable'

  return new CreateTableJQL({
    $temporary: true,
    name,
    columns: [new Column('moduleTypeCode', 'string'), new Column('reportingGroup', 'string')],
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
  function composeSumExpression(dumbList: any[]): MathExpression {
    if (dumbList.length === 2) {
      return new MathExpression(dumbList[0], '+', dumbList[1])
    }

    const popResult = dumbList.pop()

    return new MathExpression(popResult, '+', composeSumExpression(dumbList))
  }

  const sumList = []

  const $select = [
    new ResultColumn(
      new ColumnExpression('reportingGroupTable', 'moduleTypeCode'),
      'moduleTypeCode'
    ),
    new ResultColumn(
      new ColumnExpression('reportingGroupTable', 'reportingGroup'),
      'reportingGroup'
    ),
  ]

  months.map(month => {
    const column = new FunctionExpression(
      'IF',
      new InExpression(new ColumnExpression('reportingGroupTable', 'reportingGroup'), false, [
        'SA',
        'SR',
      ]),

      // times 25
      new FunctionExpression(
        'IF',
        new IsNullExpression(new ColumnExpression('final', `${month}-value`), true),
        new MathExpression(new ColumnExpression('final', `${month}-value`), '*', 25),
        0
      ),

      new FunctionExpression('IFNULL', new ColumnExpression('final', `${month}-value`), 0)
    )

    $select.push(new ResultColumn(column, `${month}-value`))

    sumList.push(column)
  })

  const sumExpression = composeSumExpression(sumList)

  $select.push(new ResultColumn(sumExpression, 'total'))

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
  }),
]
