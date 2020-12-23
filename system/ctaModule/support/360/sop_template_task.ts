import { IBody, ICtaAction } from 'modules/cta/interface'
import { CtaService } from 'modules/cta/service'
import { JwtMicroPayload } from 'modules/auth/interfaces/jwt-payload'
import { NotFoundException } from '@nestjs/common'
import { Logger } from 'modules/cta/logger'
import { callAxios, getAccessToken } from 'modules/cta/utils'

export async function getEntity(this: CtaService, body: IBody, logger: Logger, user: JwtMicroPayload) {
  const { entityId, locals: { accessToken } } = body
  await getAccessToken(user, logger)
  const response = await callAxios({
    method: 'GET',
    url: `${user.api['360']}/sopTask/${entityId}`,
    headers: {
      Authorization: `Bearer ${accessToken || user.fullAccessToken}`,
      'cache-control': 'no-cache'
    }
  }, logger)
  if (!response.data || String(response.data.id) !== String(entityId)) {
    throw new NotFoundException('TASK_NOT_FOUND')
  }
  return response.data
}

// extra local variables
export async function getLocals(this: CtaService, body: IBody, logger: Logger, user: JwtMicroPayload) {
  let { entity, locals: { accessToken } } = body
  let tableName = entity.tableName
  const primaryKey = entity.primaryKey

  // rename tableName
  if (tableName === 'purchase_order') tableName = 'purchaseOrder'

  await getAccessToken(user, logger)

  // get entity
  const response = await callAxios({
    method: 'GET',
    url: `${user.api['360']}/api/${tableName}/${primaryKey}`,
    headers: {
      Authorization: `Bearer ${accessToken || user.fullAccessToken}`,
      'cache-control': 'no-cache'
    }
  }, logger)
  if (!response.data || String(response.data.id) !== primaryKey) {
    throw new NotFoundException('TASK_ENTITY_NOT_FOUND')
  }
  return { [tableName]: response.data }
}

export const afterActions: ICtaAction[] = [{
  name: 'updateSopTaskStatus'
}]