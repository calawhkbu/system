import { IBody } from 'modules/cta/interface'
import { CtaService } from 'modules/cta/service'
import { AxiosRequestConfig } from 'axios'
import { JwtMicroPayload } from 'modules/auth/interfaces/jwt-payload'
import { NotFoundException } from '@nestjs/common'
import { Logger } from 'modules/cta/logger'
import { callAxios, getAccessToken } from 'modules/cta/utils'

export async function getEntity(this: CtaService, body: IBody, logger: Logger, user: JwtMicroPayload) {
  const { entityId, locals: { accessToken } } = body
  await getAccessToken(user, logger)
  let config: AxiosRequestConfig
  if (typeof entityId === 'number') {
    config = {
      method: 'GET',
      url: `${user.api['360']}/api/shipment/${entityId}`,
      headers: {
        Authorization: `Bearer ${accessToken || user.fullAccessToken}`,
        'cache-control': 'no-cache'
      }
    }
  }
  else {
    config = {
      method: 'POST',
      url: `${user.api['360']}/api/shipment/findOne`,
      headers: {
        Authorization: `Bearer ${accessToken || user.fullAccessToken}`,
        'cache-control': 'no-cache'
      },
      data: entityId.split('|')
    }
  }
  const response = await callAxios(config, logger)
  if (!response.data || String(response.data.id) !== String(entityId)) {
    throw new NotFoundException('SHIPMENT_NOT_FOUND')
  }
  return response.data
}
