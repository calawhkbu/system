import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import moment = require('moment')
import { BadRequestException } from '@nestjs/common'
import ShipmentsJQL from './shipments'

export default {
  jqls: [
    {
      type: 'prepareParams',
      async prepareParams(params, prevResult, user): Promise<IQueryParams> {
        if (params.subqueries && params.subqueries.myTasksOnly) {
          // user info
          params.subqueries.sop_user = { value: user.username }
          params.subqueries.sop_partyGroupCode = { value: user.selectedPartyGroup.code }

          // teams
          if (!user.selectedRoles.find(r => r.roleName === 'SWIVEL_ADMIN' || r.roleName === 'SOP_TASK_MANAGER')) {
            params.subqueries.sop_teams = { value: user.teams }
          }

          // user's today
          const { timezone } = user.configuration
          params.subqueries.sop_today = {
            from: moment.tz(timezone).startOf('d').utc().format('YYYY-MM-DD HH:mm:ss'),
            to: moment.tz(timezone).endOf('d').utc().format('YYYY-MM-DD HH:mm:ss')
          }
        }

        const { timezone } = user.configuration
        if (params.subqueries.date) {
          params.subqueries.sop_date = params.subqueries.date
          delete params.subqueries.date
        }

        if (!params.subqueries.sop_date || rangeTooLarge(params.subqueries.sop_date)) {
          throw new BadRequestException('SOP_DATE_RANGE_TOO_LARGE')
        }

        return params
      }
    },
    ...ShipmentsJQL.jqls
  ],
  columns: [
    ...ShipmentsJQL.columns,
    { key: 'noOfTasks' },
    { key: 'sopScore' },
    { key: 'team' },
    { key: 'picEmail' }
  ],
} as JqlDefinition

function rangeTooLarge(date: { from: string, to: string }): boolean {
  const datefr = moment.utc(date.from, 'YYYY-MM-DD')
  const dateto = moment.utc(date.to, 'YYYY-MM-DD')
  return dateto.diff(datefr, 'years', true) > 1
}
