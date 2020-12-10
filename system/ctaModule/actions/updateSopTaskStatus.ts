import { JwtMicroPayload } from 'modules/auth/interfaces/jwt-payload'
import { CtaActionInt, IBody, Result } from 'modules/cta/interface'
import axios from 'axios'
import { NotImplementedException } from '@nestjs/common'

export default class UpdateTaskStatusAction extends CtaActionInt {
  async run(system: string, tableName: string, primaryKey: string, body: IBody, user: JwtMicroPayload): Promise<Result> {
    switch (tableName) {
      case 'sop_template_task': {
        const task = body.entity
        const { backendUrl, accessToken } = body.locals

        if (task.status && task.status !== 'Not Ready' && task.status !== 'Closed') {
          const nextStatus = task.status !== 'Done' ? 'done' : 'open'
          const response = await axios.request({
            method: 'POST',
            url: `${backendUrl}/sopTask/mark/${nextStatus}/${task.id}`,
            data: task,
            headers: {
              Authorization: `Bearer ${accessToken || user.fullAccessToken}`
            }
          })
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
