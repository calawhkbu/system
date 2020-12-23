import { JwtMicroPayload } from 'modules/auth/interfaces/jwt-payload'
import { CtaActionInt, IBody, Result } from 'modules/cta/interface'
import axios from 'axios'
import { BadRequestException, InternalServerErrorException } from '@nestjs/common'
import _ = require('lodash')
import { Props } from './updateBooking'
import { callAxios, getAccessToken } from 'modules/cta/utils'

export default class UpdateShipmentAction extends CtaActionInt<Props> {
  needLocals = true

  async run(system: string, tableName: string, primaryKey: string, body: IBody, user: JwtMicroPayload): Promise<Result> {
    if (!this.props) throw new InternalServerErrorException('MISSING_PROPS')
    let entity = body.entity
    const { accessToken } = body.locals

    // get shipment
    if (tableName !== 'shipment') {
      if (body.locals.shipment) {
        entity = body.locals.shipment
      }
      else {
        throw new InternalServerErrorException('UNSUPPORTED_ENTITY_TYPE')
      }
    }

    if (!body.inputResult) throw new BadRequestException('MISSING_INPUT_RESULT')
    for (const { key, path = key } of this.props.fields) {
      _.set(entity, path, body.inputResult[key])
    }

    await getAccessToken(user, this.logger)

    // save shipment
    const response = await callAxios({
      method: 'POST',
      url: `${user.api['360']}/api/shipment`,
      headers: {
        Authorization: `Bearer ${accessToken || user.fullAccessToken}`
      },
      data: entity
    }, this.logger)
    if (response.data && response.data.id === entity.id) {
      const result = response.data
      body.locals.shipment = result
      if (tableName === 'shipment') body.entity = result
      return Result.SUCCESS
    }
    throw new Error('ERROR_UPDATE_SHIPMENT')
  }
}
