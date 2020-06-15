import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import _ = require('lodash')
import Moment = require('moment')

interface Result {
  moment: typeof Moment
  allowed: string[]
  result: any[]
}

export default {
  constants: {
    moduleTypeCodeList: {
      AIR: ['AC', 'AD', 'AM', 'AN', 'AZ'],
      SEA: ['SA', 'SB', 'SC', 'SR', 'SS', 'ST'],
      LOGISTICS: ['ZL'],
    },
    reportingGroupList: {
      AC: ['AIR', 'EXPORT'],
      AD: ['AIR', 'EXPORT'],
      AM: ['AIR', 'IMPORT'],
      AN: ['AIR', 'IMPORT'],
      AX: ['AIR', 'MISCELLANEOUS'],
      AZ: ['AIR', 'MISCELLANEOUS'],
      SA: ['SEA', 'EXPORT'],
      SB: ['SEA', 'EXPORT'],
      SC: ['SEA', 'EXPORT'],
      SR: ['SEA', 'IMPORT'],
      SS: ['SEA', 'IMPORT'],
      ST: ['SEA', 'IMPORT'],
      SW: ['SEA', 'MISCELLANEOUS'],
      SZ: ['SEA', 'MISCELLANEOUS'],
      ZL: ['LOGISTICS']
    },
    teuReportingGroupList: [
    ],
    searchUserRoleList: [
      'AIR',
      'SEA',
      'LOGISTICS',
      'EXPORT',
      'IMPORT',
      'MISCELLANEOUS'
    ],
    teuToCbm(teu: number, cbm: number) {
      return teu * 25
    },
    moduleTypeCodeToId(moduleTypeCode:string)
    {
      switch (moduleTypeCode) {
        case 'SEA':
          return 'SEA (CBM)'

        case 'AIR':
          return 'AIR (KG)'

        default:
          return moduleTypeCode
      }
    }
  },
  jqls: [
    {
      type: 'prepareParams',
      defaultResult: {},
      prepareParams(params, prevResult: Result, user): IQueryParams {
        const reportingGroupList: { [key: string]: string[] } = params.constants.reportingGroupList
        const searchUserRoleList: string[] = params.constants.searchUserRoleList

        // check reporting group available
        function getAllowReportingGroup(user: JwtPayload): string[] {
          const userRoleList = user.selectedRoles.filter(x => searchUserRoleList.includes(x.name)).map(x => x.name)
          const allowReportingGroupList: string[] = []
          for (const reportingGroup of Object.keys(reportingGroupList)) {
            const reportingGroupObject = reportingGroupList[reportingGroup]
            if (reportingGroupObject.every(x => userRoleList.includes(x))) {
              allowReportingGroupList.push(reportingGroup)
            }
          }
          if (!(allowReportingGroupList && allowReportingGroupList.length)) {
            throw new Error('allowReportingGroupList is empty')
          }
          return allowReportingGroupList
        }
        prevResult.allowed = getAllowReportingGroup(user)

        return params
      }
    },
    {
      type: 'prepareParams',
      defaultResult: {},
      async prepareParams(params, prevResult: Result, user): Promise<IQueryParams> {
        const moment = prevResult.moment = (await this.preparePackages(user)).moment as typeof Moment
        const subqueries = (params.subqueries = params.subqueries || {})

        // limit/extend to 1 year
        const year = subqueries.date && subqueries.date !== true && 'from' in subqueries.date
          ? moment(subqueries.date.from, 'YYYY-MM-DD').year()
          : moment().year()

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
          'teuInReport',
          'cbm',
          'chargeableWeight',
        ]

        // group by
        params.groupBy = ['moduleTypeCode', 'reportingGroup', 'jobMonth']

        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['shipment', 'shipment'],
      onResult(res, params, prevResult: Result): Result {
        const { moment } = prevResult
        prevResult.result = res.map(row => {
          const row_: any = {}
          row_.month = moment(row.jobMonth, 'YYYY-MM').format('MMMM')
          row_.moduleTypeCode = row.moduleTypeCode
          row_.reportingGroup = row.reportingGroup
          if (params.constants.teuReportingGroupList.indexOf(row.reportingGroup) > -1) {
            row_.value = params.constants.teuToCbm(+row.teuInReport, +row.cbm)
          }
          else {
            row_.value = row.moduleTypeCode === 'SEA' ? +row.cbm : +row.chargeableWeight
          }
          return row_
        })
        return prevResult
      }
    },
    {
      type: 'postProcess',
      postProcess(params, { allowed, result, moment }: Result): any[] {
        const moduleTypeCodeList: { [key: string]: string[] } = params.constants.moduleTypeCodeList

        // filter by allowed reporting groups
        let rows = (result as any[]).filter(r => (allowed as any[]).indexOf(r.reportingGroup) > -1)

        // group by reporting groups
        const intermediate = _.groupBy(rows, r => r.reportingGroup)
        rows = Object.keys(intermediate).map(reportingGroup => {
          const row_: any = { reportingGroup }
          for (const m of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) {
            const month = moment().month(m).format('MMMM')
            const row = intermediate[reportingGroup].find(r => r.month === month)
            let value = row_[`${month}_value`] = (row && +row.value) || 0
            if (isNaN(value)) value = 0
            row_.total = (row_.total || 0) + value
          }
          return row_
        })

        const final: any[] = []

        for (const moduleTypeCode of Object.keys(moduleTypeCodeList)) {

          // const __id = moduleTypeCode === 'SEA' ? 'SEA (CBM)' : 'AIR (KG)'

          const __id = params.constants.moduleTypeCodeToId(moduleTypeCode)

          const __rows: any[] = []
          for (const reportingGroup of moduleTypeCodeList[moduleTypeCode]) {
            let row = rows.find(r => r.reportingGroup === reportingGroup)
            if (!row) {
              row = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].reduce((r, m) => {
                const month = moment().month(m).format('MMMM')
                r[`${month}_value`] = 0
                return r
              }, { reportingGroup, total: 0 })
            }
            const conversionUnit = params.constants.teuReportingGroupList.indexOf(reportingGroup) > -1 ? '(Conversion Unit: TEU)' : ''
            __rows.push({ ...row, conversionUnit, moduleTypeCode })
          }
          final.push({ __id, __rows, __value: __id })
        }

        return final.filter(row => row.__rows.length)
      }
    }
  ]
} as JqlDefinition

/* import {
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

const convertToTeuReportinGroupList = ['SA', 'SR']

function insertReportingGroupTable() {

  return function(require, session, params) {

    const { user } = params.packages

    const name = 'reportingGroupTable'
    // hardcode all reportingGroup and divided into SEA and AIR

    // controll what to show
    const moduleTypeCodeList = {

      AIR: ['AC', 'AD', 'AM', 'AN', 'AW', 'AX', 'AZ'],
      SEA: ['SA', 'SB', 'SC', 'SR', 'SS', 'ST', 'SW', 'SZ'],
      LOGISTICS : ['ZL']

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

      if (!(allowReportingGroupList && allowReportingGroupList.length))
      {
        throw new Error('allowReportingGroupList is empty')
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
      'teuInReport',
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

            new InExpression(new ColumnExpression('reportingGroup'), false, convertToTeuReportinGroupList),

            // warning now still show cbm
            new ColumnExpression('cbm'),

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
            { name: 'teuInReport', type: 'number' },
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
        new InExpression(new ColumnExpression('reportingGroupTable', 'reportingGroup'), false, convertToTeuReportinGroupList), new Value('(Conversion Unit: TEU)'), new Value('')
      ), 'conversionUnit'
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
] */
