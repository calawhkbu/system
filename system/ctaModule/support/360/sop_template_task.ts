import { IBody, ICtaAction } from 'modules/cta/interface'
import { CtaService } from 'modules/cta/service'
import axios from 'axios'
import { JwtMicroPayload } from 'modules/auth/interfaces/jwt-payload'
import { NotFoundException } from '@nestjs/common'
import { Logger } from 'modules/cta/logger'

// extra local variables
export async function getLocals(this: CtaService, { entity, entityId, locals: { backendUrl, accessToken } }: IBody, logger: Logger, user: JwtMicroPayload) {
  // get sop_task
  let task = entity
  if (!task) {
    const response = await axios.request({
      method: 'GET',
      url: `${backendUrl}/sopTask/${entityId}`,
      headers: {
        Authorization: `Bearer ${accessToken || user.fullAccessToken}`
      }
    })
    if (!response.data || String(response.data.id) !== String(entityId)) {
      throw new NotFoundException('TASK_NOT_FOUND')
    }
    task = response.data
    await logger.log(`Get sop_task=${entityId}`)
  }
  let tableName = task.tableName
  const primaryKey = task.primaryKey

  // rename tableName
  if (tableName === 'purchase_order') tableName = 'purchaseOrder'

  // get entity
  const response = await axios.request({
    method: 'GET',
    url: `${backendUrl}/api/${tableName}/${primaryKey}`,
    headers: {
      Authorization: `Bearer ${accessToken || user.fullAccessToken}`
    }
  })
  if (!response.data || String(response.data.id) !== primaryKey) {
    throw new NotFoundException('TASK_ENTITY_NOT_FOUND')
  }
  await logger.log(`Get ${task.tableName}=${task.primaryKey}`)
  return { sop_template_task: task, [tableName]: response.data }
}

export const afterActions: ICtaAction[] = [{
  name: 'updateSopTaskStatus'
}]