import { JwtMicroPayload } from 'modules/auth/interfaces/jwt-payload'
import { CtaActionInt, IBody, Result } from 'modules/cta/interface'
import axios from 'axios'
import { InternalServerErrorException, NotFoundException } from '@nestjs/common'
import _ = require('lodash')

export default class UpdateBookingAction extends CtaActionInt {
  async run(tableName: string, primaryKey: string, body: IBody, user: JwtMicroPayload): Promise<Result> {
    let entity = body.entity
    const { accessToken, backendUrl } = body.locals

    // get booking
    if (tableName !== 'booking') {
      if (body.locals.booking) {
        entity = body.locals.booking
      }
      else if (entity.tableName === 'booking' && entity.primaryKey) {
        const response = await axios.request({
          method: 'GET',
          url: `${backendUrl}/api/booking/${entity.primaryKey}`,
          headers: {
            Authorization: `Bearer ${accessToken || user.fullAccessToken}`
          }
        })
        if (!response || !response.data || String(response.data.id) !== primaryKey) {
          throw new NotFoundException('BOOKING_NOT_FOUND')
        }
        body.locals.booking = entity = response.data
      }
      else {
        throw new InternalServerErrorException('UNSUPPORTED_ENTITY_TYPE')
      }
    }

    for (const key of Object.keys(body.inputResult)) {
      _.set(entity, key, body.inputResult[key])
    }

    // save booking
    const response = await axios.request({
      method: 'POST',
      url: `${backendUrl}/api/booking`,
      headers: {
        Authorization: `Bearer ${accessToken || user.fullAccessToken}`
      },
      data: entity
    })
    if (response.data && String(response.data.id) === primaryKey) {
      body.locals.booking = response.data
      return Result.SUCCESS
    }
    throw new Error('ERROR_UPDATE_BOOKING')
  }
}
