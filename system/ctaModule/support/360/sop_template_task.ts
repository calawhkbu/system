import { IBody, ICtaAction } from 'modules/cta/interface'
import { CtaService } from 'modules/cta/service'
import axios from 'axios'
import { JwtMicroPayload } from 'modules/auth/interfaces/jwt-payload'
import { NotFoundException } from '@nestjs/common'
import { Logger } from 'modules/cta/logger'


export async function getEntity(this: CtaService, body: IBody, logger: Logger, user: JwtMicroPayload) {
  const { entityId, locals: { backendUrl, accessToken } } = body
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
  await logger.log(`Get sop_task=${entityId}`)
  return response.data
}

// extra local variables
export async function getLocals(this: CtaService, body: IBody, logger: Logger, user: JwtMicroPayload) {
  let { entity, locals: { backendUrl, accessToken } } = body
  let tableName = entity.tableName
  const primaryKey = entity.primaryKey

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
  await logger.log(`Get ${tableName}=${primaryKey}`)
  return { [tableName]: response.data }
}

export const afterActions: ICtaAction[] = [{
  name: 'updateSopTaskStatus'
}]