import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import moment = require('moment')
import { BadRequestException } from '@nestjs/common'

export default {
  jqls: [
    {
      type: 'prepareParams',
      async prepareParams(params, result, user): Promise<IQueryParams> {
        // fields
        if (!params.fields) {
          params.fields = ['id','tableName','primaryKey','parentId','hasSubTasks','status','statusAt','statusBy','isDone','noOfRemarks','latestRemark','latestRemarkAt','latestRemarkBy','system','category','group','name','startAt','dueAt','deadline','isDue','isDueToday','isDead','isClosed','isDeleted','uniqueId','description','statusList','remark','primaryNo']
        }

        // sorting
        if (!params.subqueries) params.subqueries = {}
        if (params.subqueries.sorting) {
          const sorting: { value: string } = params.subqueries.sorting
          params.sorting = sorting.value
          delete params.subqueries.sorting
        }

        // subqueries
        const { timezone } = user.configuration
        if (params.subqueries.day) {
          switch (params.subqueries.day.value) {
            case 'day before yesterday':
              params.subqueries.date = {
                from: moment.tz(timezone).subtract(2, 'd').startOf('d').utc().format('YYYY-MM-DD HH:mm:ss'),
                to: moment.tz(timezone).subtract(2, 'd').endOf('d').utc().format('YYYY-MM-DD HH:mm:ss')
              }
              break
            case 'yesterday':
              params.subqueries.date = {
                from: moment.tz(timezone).subtract(1, 'd').startOf('d').utc().format('YYYY-MM-DD HH:mm:ss'),
                to: moment.tz(timezone).subtract(1, 'd').endOf('d').utc().format('YYYY-MM-DD HH:mm:ss')
              }
              break
            case 'day after tomorrow':
              params.subqueries.date = {
                from: moment.tz(timezone).add(2, 'd').startOf('d').utc().format('YYYY-MM-DD HH:mm:ss'),
                to: moment.tz(timezone).add(2, 'd').endOf('d').utc().format('YYYY-MM-DD HH:mm:ss')
              }
              break
            case 'tomorrow':
              params.subqueries.date = {
                from: moment.tz(timezone).add(1, 'd').startOf('d').utc().format('YYYY-MM-DD HH:mm:ss'),
                to: moment.tz(timezone).add(1, 'd').endOf('d').utc().format('YYYY-MM-DD HH:mm:ss')
              }
              break
            case 'today':
            default:
              params.subqueries.date = {
                from: moment.tz(timezone).startOf('d').utc().format('YYYY-MM-DD HH:mm:ss'),
                to: moment.tz(timezone).endOf('d').utc().format('YYYY-MM-DD HH:mm:ss')
              }
              break
          }
          delete params.subqueries.day
        }

        if (!params.subqueries.date || rangeTooLarge(params.subqueries.date)) {
          throw new BadRequestException('DATE_RANGE_TOO_LARGE')
        }

        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['sop_task', 'sop_task']
    }
  ]
} as JqlDefinition

function rangeTooLarge(date: { from: string, to: string }): boolean {
  const datefr = moment.utc(date.from, 'YYYY-MM-DD')
  const dateto = moment.utc(date.to, 'YYYY-MM-DD')
  return dateto.diff(datefr, 'years', true) > 1
}