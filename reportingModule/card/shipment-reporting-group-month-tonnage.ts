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
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'

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

// warning : this card have some special handling on showing cbm and chargeable Weight!!!!!

// hardcode all reportingGroup and divided into SEA and AIR

const convertToTeuModuleTypeCodeList = ['SA', 'SR']

function insertReportingGroupTable() {

  return function(require, session, params) {

    const { user } = params.packages

    const name = 'reportingGroupTable'
    // hardcode all reportingGroup and divided into SEA and AIR

    // controll what to show
    const moduleTypeCodeList = {

      AIR: ['AC', 'AD', 'AM', 'AN', 'AW', 'AX', 'AZ'],
      SEA: ['SA', 'SB', 'SC', 'SR', 'SS', 'ST', 'SW', 'SZ'],
      LOG: ['ZL'],

    }

    // control the security
    const reportingGroupList = {
      AC : ['AIR', 'EXPORT'],
      AD : ['AIR', 'EXPORT'],
      AM : ['AIR', 'IMPORT'],
      AN : ['AIR', 'IMPORT'],

      AX : ['AIR', 'MISCELLANEOUS'],
      AZ : ['AIR', 'MISCELLANEOUS'],

      SA : ['SEA', 'EXPORT'],
      SB : ['SEA', 'EXPORT'],
      SC : ['SEA', 'EXPORT'],

      SR : ['SEA', 'IMPORT'],
      SS : ['SEA', 'IMPORT'],
      ST : ['SEA', 'IMPORT'],

      SW : ['SEA', 'MISCELLANEOUS'],
      SZ : ['SEA', 'MISCELLANEOUS'],

      LZ : ['LOGISTICS']

    }

    const searchUserRoleList = [ 'AIR', 'SEA', 'LOGISTICS', 'EXPORT', 'IMPORT', 'MISCELLANEOUS']

    function getAllowReportingGroup(user: JwtPayload)
    {

      const userRoleList = user.selectedRoles.filter(x => searchUserRoleList.includes(x.name)).map(x => x.name)
      const allowReportingGroupList = []

      for (const reportingGroup of Object.keys(reportingGroupList)){

        const reportingGroupObject = reportingGroupList[reportingGroup] as string[]

        if (reportingGroupObject.every(x => userRoleList.includes(x)))
        {
          allowReportingGroupList.push(reportingGroup)
        }

      }

      return allowReportingGroupList

    }

    const insertList = []

    const allowReportingGroupList = getAllowReportingGroup(user)

    for (const moduleTypeCode in moduleTypeCodeList) {
      if (moduleTypeCodeList.hasOwnProperty(moduleTypeCode)) {
        const reportingGroupList = moduleTypeCodeList[moduleTypeCode] as string[]

        reportingGroupList.map((reportingGroup: string) => {

          if (allowReportingGroupList.includes(reportingGroup))
          {
            insertList.push({ reportingGroup, moduleTypeCode })
          }

        })
      }
    }

    return new InsertJQL(name, ...insertList)

  }

}

function prepareParams(): Function {
  return function(require, session, params) {
    // import
    const { moment } = params.packages

    // limit/extend to 1 year
    const subqueries = (params.subqueries = params.subqueries || {})

    const year = !subqueries.date
      ? moment().year()
      : moment(subqueries.date.from, 'YYYY-MM-DD').year()

    subqueries.date = {
      from: moment()
        .year(year)
        .startOf('year')
        .format('YYYY-MM-DD'),
      to: moment()
        .year(year)
        .endOf('year')
        .format('YYYY-MM-DD'),
    }

    // select
    params.fields = [
      'moduleTypeCode',
      'reportingGroup',
      'jobMonth',
      'teu',
      'cbm',
      'chargeableWeight',
    ]

    // group by
    params.groupBy = ['moduleTypeCode', 'reportingGroup', 'jobMonth']

    return params
  }
}

function prepareTable(): CreateTableJQL {
  return new CreateTableJQL({
    $temporary: true,
    name: 'shipment',

    // condition

    $as: new Query({
      $select: [
        new ResultColumn(new ColumnExpression('moduleTypeCode')),
        new ResultColumn(
          new FunctionExpression('MONTHNAME', new ColumnExpression('jobMonth'), 'YYYY-MM'),
          'month'
        ),
        new ResultColumn(new ColumnExpression('reportingGroup')),

        new ResultColumn(
          new FunctionExpression(
            'IF',

            new InExpression(new ColumnExpression('reportingGroup'), false, ['SA', 'SR']),

            new MathExpression(new ColumnExpression('teu'), '*', 25),

            new FunctionExpression(
              'IF',
              new BinaryExpression(new ColumnExpression('moduleTypeCode'), '=', 'SEA'),
              new ColumnExpression('cbm'),
              new ColumnExpression('chargeableWeight')
            )
          ),
          'value'
        ),
      ],
      $from: new FromTable(
        {
          method: 'POST',
          url: 'api/shipment/query/shipment',
          columns: [
            { name: 'moduleTypeCode', type: 'string' },
            { name: 'jobMonth', type: 'string' },
            { name: 'reportingGroup', type: 'string' },
            { name: 'teu', type: 'number' },
            { name: 'cbm', type: 'number' },
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

            new ColumnExpression('value')
          ),
          0
        ),
        `${month}_value`
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

    // moduleType + unit
    new ResultColumn(

      new FunctionExpression('CONCAT',
        new ColumnExpression('reportingGroupTable', 'moduleTypeCode'),
        new FunctionExpression('IF',

          new BinaryExpression(
            new ColumnExpression('reportingGroupTable', 'moduleTypeCode'), '=', 'AIR'
          ),
          new Value(' (KG)'),
          new Value(' (CBM)')
        )
      ),

      'moduleTypeCode'
    ),
    new ResultColumn(
      new ColumnExpression('reportingGroupTable', 'reportingGroup'),
      'reportingGroup'
    ),

    // convert unit column
    new ResultColumn(
      new FunctionExpression('IF',
        new InExpression(new ColumnExpression('reportingGroupTable', 'reportingGroup'), false, convertToTeuModuleTypeCodeList), new Value('( Convertion Unit: TEU)'), new Value('')
      ), 'convertionUnit'
    )
  ]

  months.map(month => {
    const column = new FunctionExpression(
      'IFNULL',
      new ColumnExpression('final', `${month}_value`),
      0
    )
    $select.push(new ResultColumn(column, `${month}_value`))

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
