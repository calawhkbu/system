import { IBody } from 'modules/cta/interface'
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
    url: typeof entityId === 'number' ? `${user.api['360']}/api/booking/${entityId}` : `${user.api['360']}/api/booking/bookingNo/${entityId}`,
    headers: {
      Authorization: `Bearer ${accessToken || user.fullAccessToken}`,
      'cache-control': 'no-cache'
    }
  }, logger)
  if (!response.data || String(response.data.id) !== String(entityId)) {
    throw new NotFoundException('BOOKING_NOT_FOUND')
  }
  return response.data
}
