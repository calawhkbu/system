import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import _ = require('lodash')
import Moment = require('moment')
import { extendDate, expandSummaryVariable } from 'utils/card'
import { ERROR } from 'utils/error'

interface Result {
  moment: typeof Moment
  allowed: string[]
  summaryVariables: string[]
  result: any[]
}

export default {
  constants: {
    moduleTypeCodeList: {
      AIR: ['AC', 'AD', 'AM', 'AN', 'AZ'],
      SEA: ['SA', 'SB', 'SC', 'SR', 'SS', 'ST', 'SZ']
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
      SZ: ['SEA', 'MISCELLANEOUS']
    },
    searchUserRoleList: [
      'AIR',
      'SEA',
      'EXPORT',
      'IMPORT',
      'MISCELLANEOUS'
    ]
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
      async prepareParams(params, prevResult: Result, user): Promise<IQueryParams> {
        const { moment } = await this.preparePackages(user)
        const subqueries = (params.subqueries = params.subqueries || {})

        // let summaryVariables: string[] = []
        // if (subqueries.summaryVariables && subqueries.summaryVariables !== true && 'value' in subqueries.summaryVariables) {
        //   // sumamary variable
        //   summaryVariables = Array.isArray(subqueries.summaryVariables.value) ? subqueries.summaryVariables.value  : [subqueries.summaryVariables.value]
        // }
        // if (subqueries.summaryVariable && subqueries.summaryVariable !== true && 'value' in subqueries.summaryVariable) {
        //   summaryVariables = [...new Set([...summaryVariables, subqueries.summaryVariable.value])]
        // }
        // if (!(summaryVariables && summaryVariables.length)) throw new Error('MISSING_summaryVariables')

        const summaryVariables = expandSummaryVariable(subqueries)
        prevResult.summaryVariables = summaryVariables

        prevResult.moment = moment
        // prevResult.summaryVariables = summaryVariables

        // // limit/extend to 1 year
        // const year = (subqueries.date && subqueries.date !== true && 'from' in subqueries.date ? moment(subqueries.date.from, 'YYYY-MM-DD') : moment()).year()
        // subqueries.date = {
        //   from: moment()
        //     .year(year)
        //     .startOf('year')
        //     .format('YYYY-MM-DD'),
        //   to: moment()
        //     .year(year)
        //     .endOf('year')
        //     .format('YYYY-MM-DD')
        // }

                // extend date into whole year
        extendDate(subqueries,moment,'year')

        // select
        params.fields = ['moduleTypeCode', 'reportingGroup', 'jobMonth', ...summaryVariables]

        // group by
        params.groupBy = ['moduleTypeCode', 'reportingGroup', 'jobMonth']

        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['shipment', 'shipment'],
      onResult(res, params, prevResult: Result): Result {
        const { moment, summaryVariables } = prevResult
        prevResult.result = res.map(row => {
          const row_: any = {}
          row_.month = moment(row.jobMonth, 'YYYY-MM').format('MMMM')
          row_.moduleTypeCode = row.moduleTypeCode
          row_.reportingGroup = row.reportingGroup
          for (const variable of summaryVariables) {
            row_[variable] = row[variable]
          }
          return row_
        })
        return prevResult
      }
    },
    {
      type: 'postProcess',
      postProcess(params, { allowed, result, moment, summaryVariables }: Result): any[] {
        const moduleTypeCodeList: { [key: string]: string[] } = params.constants.moduleTypeCodeList
        const summaryVariable = summaryVariables[0]

        // filter by allowed reporting groups
        let rows = (result as any[]).filter(r => (allowed as any[]).indexOf(r.reportingGroup) > -1)

        // group by reporting groups
        const intermediate = _.groupBy(rows, r => r.reportingGroup)
        rows = Object.keys(intermediate).map(reportingGroup => {
          const row_: any = { reportingGroup }
          for (const m of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) {
            const month = moment().month(m).format('MMMM')
            const row = intermediate[reportingGroup].find(r => r.month === month)
            let value = row_[`${month}_value`] = (row && +row[summaryVariable]) || 0
            if (isNaN(value)) value = 0
            row_.total_value = (row_.total_value || 0) + value
          }
          return row_
        })

        const final: any[] = []

        for (const __id of Object.keys(moduleTypeCodeList)) {
          const __rows: any[] = []
          for (const reportingGroup of moduleTypeCodeList[__id]) {
            let row = rows.find(r => r.reportingGroup === reportingGroup)
            if (!row) {
              row = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].reduce((r, m) => {
                const month = moment().month(m).format('MMMM')
                r[`${month}_value`] = 0
                return r
              }, { reportingGroup, total_value: 0 })
            }
            __rows.push({ ...row, moduleTypeCode: __id })
          }
          final.push({ __id, __rows, __value: __id })
        }

        return final.filter(row => row.__rows.length)
      }
    }
  ],
  // for this filter, user can only select single,
  // but when config in card definition, use summaryVariables. Then we can set as multi
  filters: [{
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
        {
          label: 'teuInReport',
          value: 'teuInReport',
        },
        {
          label: 'quantity',
          value: 'quantity',
        },
      ],
      multi : false,
      required: true,
    },
    type: 'list',
  }]
} as JqlDefinition
