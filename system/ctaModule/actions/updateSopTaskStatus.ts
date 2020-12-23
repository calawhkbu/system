import { JwtMicroPayload } from 'modules/auth/interfaces/jwt-payload'
import { CtaActionInt, IBody, Result } from 'modules/cta/interface'
import axios from 'axios'
import { NotImplementedException } from '@nestjs/common'
import { callAxios, getAccessToken } from 'modules/cta/utils'

export default class UpdateTaskStatusAction extends CtaActionInt {
  async run(system: string, tableName: string, primaryKey: string, body: IBody, user: JwtMicroPayload): Promise<Result> {
    switch (tableName) {
      case 'sop_template_task': {
        const task = body.entity
        const { accessToken } = body.locals

        if (task.status && task.status !== 'Not Ready' && task.status !== 'Closed') {
          const nextStatus = task.status !== 'Done' ? 'done' : 'open'
          await getAccessToken(user, this.logger)
          const response = await callAxios({
            method: 'POST',
            url: `${user.api['360']}/sopTask/mark/${nextStatus}/${task.id}`,
            data: task,
            headers: {
              Authorization: `Bearer ${accessToken || user.fullAccessToken}`
            }
          }, this.logger)
          if (response.data && response.data.id === task.id) {
            return Result.SUCCESS
          }
          throw new Error('ERROR_UPDATE_TASK_STATUS')
        }
        else {
          throw new Error('TASK_STATUS_NOT_AVAILABLE')
        }
      }
      default:
        throw new NotImplementedException()
    }
  }
}
