import { IBody, ICtaAction } from 'modules/cta/interface'
import { CtaService } from 'modules/cta/service'
import axios from 'axios'
import { JwtMicroPayload } from 'modules/auth/interfaces/jwt-payload'
import { NotFoundException } from '@nestjs/common'

// extra local variables
export async function getLocals(this: CtaService, { entity: { tableName, primaryKey }, locals: { backendUrl, accessToken } }: IBody, user: JwtMicroPayload) {
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
  if (!response || !response.data || String(response.data.id) !== primaryKey) {
    throw new NotFoundException('ENTITY_NOT_FOUND')
  }
  return { [tableName]: response.data }
}

// list of fields available for condition check
export async function keys(tableName: string, { entity, locals: { backendUrl, accessToken } }: IBody, entities: string, user: JwtMicroPayload) {
  const response = await axios.request({
    method: 'GET',
    url: `${backendUrl}/sopTask/cta-fields/${entity.tableName}`,
    headers: {
      Authorization: `Bearer ${accessToken || user.fullAccessToken}`
    }
  })
  return { [entity.tableName]: !response || !response.data ? [] : response.data }
}

export const afterActions: ICtaAction[] = [{
  name: 'updateSopTaskStatus'
}]