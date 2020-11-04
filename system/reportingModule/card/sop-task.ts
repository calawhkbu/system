import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import moment = require('moment')
import { BadRequestException } from '@nestjs/common'
import { ColumnExpression, OrderBy } from 'node-jql'

export default {
  jqls: [
    {
      type: 'prepareParams',
      async prepareParams(params, result, user): Promise<IQueryParams> {
        // fields
        if (!params.fields) {
          params.fields = [
            'id',
            'taskId',
            'tableName',
            'primaryKey',
            'parentId',
            'hasSubTasks',
            'status',
            'taskStatus',
            'statusAt',
            'statusBy',
            'isDone',
            'noOfRemarks',
            'latestRemark',
            'latestRemarkAt',
            'latestRemarkBy',
            'seqNo',
            'system',
            'category',
            'group',
            'name',
            'startAt',
            'dueAt',
            'deadline',
            'isDue',
            'isDueToday',
            'isDead',
            'isClosed',
            'isDeleted',
            'uniqueId',
            'description',
            'remark',
            'primaryNo',
            'picEmail',
            'team'
          ]
        }

        // sorting
        if (!params.subqueries) params.subqueries = {}
        if (params.subqueries.sorting) {
          const sorting: { value: string } = params.subqueries.sorting
          params.sorting = sorting.value
          delete params.subqueries.sorting
        }
        if (!params.sorting) {
          params.sorting = new OrderBy(new ColumnExpression('sop_task', 'primaryKey'), 'ASC')
        }

        // subqueries
        if (params.subqueries.date ? rangeTooLarge(params.subqueries.date) : !params.subqueries.createdAtBetween) {
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