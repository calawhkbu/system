import { JwtMicroPayload } from 'modules/auth/interfaces/jwt-payload'
import { CtaActionInt, IBody, Result } from 'modules/cta/interface'
import axios from 'axios'
import { InternalServerErrorException, NotFoundException } from '@nestjs/common'
import _ = require('lodash')

export default class UpdateShipmentAction extends CtaActionInt {
  async run(tableName: string, primaryKey: string, body: IBody, user: JwtMicroPayload): Promise<Result> {
    let entity = body.entity
    const { accessToken, backendUrl } = body.locals

    // get shipment
    if (tableName !== 'shipment') {
      if (body.locals.shipment) {
        entity = body.locals.shipment
      }
      else if (entity.tableName === 'shipment' && entity.primaryKey) {
        const response = await axios.request({
          method: 'GET',
          url: `${backendUrl}/api/shipment/${entity.primaryKey}`,
          headers: {
            Authorization: `Bearer ${accessToken || user.fullAccessToken}`
          }
        })
        if (!response || !response.data || String(response.data.id) !== primaryKey) {
          throw new NotFoundException('SHIPMENT_NOT_FOUND')
        }
        body.locals.shipment = entity = response.data
      }
      else {
        throw new InternalServerErrorException('UNSUPPORTED_ENTITY_TYPE')
      }
    }

    for (const key of Object.keys(body.inputResult)) {
      _.set(entity, key, body.inputResult[key])
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
    if (response.data && String(response.data.id) === primaryKey) {
      body.locals.shipment = response.data
      return Result.SUCCESS
    }
    throw new Error('ERROR_UPDATE_SHIPMENT')
  }
}
