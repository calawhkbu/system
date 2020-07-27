import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import moment = require('moment')

export default {
  jqls: [
    {
      type: 'prepareParams',
      async prepareParams(params, result, user): Promise<IQueryParams> {
        // fields
        if (!params.fields) {
          params.fields = ['id','tableName','primaryKey','parentId','hasSubTasks','status','statusAt','statusBy','isDone','noOfRemarks','latestRemark','latestRemarkAt','latestRemarkBy','system','category','group','name','startAt','dueAt','deadline','isDue','isDueToday','isDead','isClosed','isDeleted','uniqueId','description','statusList','remark']
        }

        // sorting
        if (!params.subqueries) params.subqueries = {}
        if (params.subqueries.sorting) {
          const sorting: { value: string } = params.subqueries.sorting
          params.sorting = sorting.value
          delete params.subqueries.sorting
        }

        // subqueries
        if (!params.subqueries.day) params.subqueries.day = { value: 'today' }
        const { timezone } = user.configuration
        const myMoment = moment().tz(timezone)
        params.subqueries.today = {
          from: moment().tz(timezone).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
          to: moment().tz(timezone).endOf('day').format('YYYY-MM-DD HH:mm:ss')
        }
        switch (params.subqueries.day.value) {
          case 'day before yesterday':
            params.subqueries.date = {
              from: myMoment.subtract(2, 'd').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
              to: myMoment.subtract(2, 'd').endOf('day').format('YYYY-MM-DD HH:mm:ss')
            }
            break
          case 'yesterday':
            params.subqueries.date = {
              from: myMoment.subtract(1, 'd').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
              to: myMoment.subtract(1, 'd').endOf('day').format('YYYY-MM-DD HH:mm:ss')
            }
            break
          case 'day after tomorrow':
            params.subqueries.date = {
              from: myMoment.add(2, 'd').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
              to: myMoment.add(2, 'd').endOf('day').format('YYYY-MM-DD HH:mm:ss')
            }
            break
          case 'tomorrow':
            params.subqueries.date = {
              from: myMoment.add(1, 'd').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
              to: myMoment.add(1, 'd').endOf('day').format('YYYY-MM-DD HH:mm:ss')
            }
            break
          case 'today':
          default:
            params.subqueries.date = {
              from: myMoment.startOf('day').format('YYYY-MM-DD HH:mm:ss'),
              to: myMoment.endOf('day').format('YYYY-MM-DD HH:mm:ss')
            }
            break
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