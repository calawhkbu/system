import { JwtMicroPayload } from 'modules/auth/interfaces/jwt-payload'
import { CtaActionInt, IBody, Result } from 'modules/cta/interface'
import axios from 'axios'
import { BadRequestException, InternalServerErrorException } from '@nestjs/common'
import _ = require('lodash')

export interface IField {
  key: string
  path?: string|string[]
}

export interface Props {
  fields: IField[]
}

export default class UpdateBookingAction extends CtaActionInt<Props> {
  needLocals = true

  async run(system: string, tableName: string, primaryKey: string, body: IBody, user: JwtMicroPayload): Promise<Result> {
    if (!this.props) throw new InternalServerErrorException('MISSING_PROPS')
    let entity = body.entity
    const { accessToken, backendUrl } = body.locals

    // get booking
    if (tableName !== 'booking') {
      if (body.locals.booking) {
        entity = body.locals.booking
      }
      else {
        throw new InternalServerErrorException('UNSUPPORTED_ENTITY_TYPE')
      }
    }

    if (!body.inputResult) throw new BadRequestException('MISSING_INPUT_RESULT')
    for (const { key, path = key } of this.props.fields) {
      _.set(entity, path, body.inputResult[key])
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
      const result = response.data
      body.locals.booking = result
      if (tableName === 'booking') body.entity = result
      return Result.SUCCESS
    }
    throw new Error('ERROR_UPDATE_BOOKING')
  }
}
