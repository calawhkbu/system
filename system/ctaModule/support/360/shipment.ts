import { IBody } from 'modules/cta/interface'
import { CtaService } from 'modules/cta/service'
import axios from 'axios'
import { JwtMicroPayload } from 'modules/auth/interfaces/jwt-payload'
import { NotFoundException } from '@nestjs/common'
import { Logger } from 'modules/cta/logger'

export async function getEntity(this: CtaService, body: IBody, logger: Logger, user: JwtMicroPayload) {
  const { entityId, locals: { backendUrl, accessToken } } = body
  const response = await axios.request({
    method: 'GET',
    url: `${backendUrl}/api/shipment/${entityId}`,
    headers: {
      Authorization: `Bearer ${accessToken || user.fullAccessToken}`
    }
  })
  if (!response.data || String(response.data.id) !== String(entityId)) {
    throw new NotFoundException('SHIPMENT_NOT_FOUND')
  }
  await logger.log(`Get shipment=${entityId}`)
  return response.data
}
