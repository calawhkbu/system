import { JwtMicroPayload } from 'modules/auth/interfaces/jwt-payload'
import { CtaActionInt, IBody, Result } from 'modules/cta/interface'
import axios from 'axios'
import { BadRequestException, InternalServerErrorException } from '@nestjs/common'
import _ = require('lodash')
import { Props } from './updateBooking'

export default class UpdateShipmentAction extends CtaActionInt<Props> {
  needLocals = true

  async run(system: string, tableName: string, primaryKey: string, body: IBody, user: JwtMicroPayload): Promise<Result> {
    if (!this.props) throw new InternalServerErrorException('MISSING_PROPS')
    let entity = body.entity
    const { accessToken, backendUrl } = body.locals

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

    // save shipment
    const response = await axios.request({
      method: 'POST',
      url: `${backendUrl}/api/shipment`,
      headers: {
        Authorization: `Bearer ${accessToken || user.fullAccessToken}`
      },
      data: entity
    })
    if (response.data && response.data.id === entity.id) {
      const result = response.data
      body.locals.shipment = result
      if (tableName === 'shipment') body.entity = result
      return Result.SUCCESS
    }
    throw new Error('ERROR_UPDATE_SHIPMENT')
  }
}
