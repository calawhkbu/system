import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import _ = require('lodash')
import Moment = require('moment')
import { ERROR } from 'utils/error'

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
      return `${moduleTypeCode}withUnit`
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
            throw ERROR.NOT_ALLOWED()
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
