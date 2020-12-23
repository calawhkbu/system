import { JwtMicroPayload } from 'modules/auth/interfaces/jwt-payload'
import { CtaActionInt, IBody, Result } from 'modules/cta/interface'
import axios from 'axios'
import { InternalServerErrorException } from '@nestjs/common'
import _ = require('lodash')
import { callAxios } from 'modules/cta/utils'

export interface IProps {
  handler?: string
  options?: any
  context?: any

  // the entity has [tableName, primaryKey]
  ownEntity?: boolean

  // parties
  toParty?: [string, string][]  // [['booking', 'shipper']]
  ccParty?: [string, string][]
  bccParty?: [string, string][]

  // TODO attachment
}

export default class SendEmailAction<Props extends IProps = IProps> extends CtaActionInt<Props> {
  needLocals = true

  getEmail(tableName: string, body: IBody, [entityType, key]: [string, string]) {
    const entity = entityType === tableName ? body.entity : body.locals[entityType]
    if (entityType === 'purchase_order') entityType = 'purchaseOrder'
    if (entity[`${entityType}Party`] && entity[`${entityType}Party`][`${key}Party`]) return entity[`${entityType}Party`][`${key}PartyContactEmail`] || entity[`${entityType}Party`][`${key}Party`].email
  }

  async run(system: string, tableName: string, primaryKey: string, body: IBody, user: JwtMicroPayload): Promise<Result> {
    if (!this.props) throw new InternalServerErrorException('MISSING_PROPS')
    const { messengerUrl } = await this.ctaService.getConfig()
    const { handler, ownEntity, toParty, ccParty, bccParty, ...data } = this.props
    let { entity, entityId } = body
    const locals = body.locals

    const options = data.options = _.cloneDeep(data.options || {} as any)
    if (this.props.toParty) {
      options.to = options.to || []
      if (!Array.isArray(options.to)) options.to = [options.to]
      const emails = this.props.toParty.map(p => this.getEmail(tableName, body, p)).filter(s => !!s)
      options.to.push(...emails)
    }
    if (this.props.ccParty) {
      options.cc = options.cc || []
      if (!Array.isArray(options.cc)) options.cc = [options.cc]
      const emails = this.props.ccParty.map(p => this.getEmail(tableName, body, p)).filter(s => !!s)
      options.cc.push(...emails)
    }
    if (this.props.bccParty) {
      options.bcc = options.bcc || []
      if (!Array.isArray(options.bcc)) options.bcc = [options.bcc]
      const emails = this.props.bccParty.map(p => this.getEmail(tableName, body, p)).filter(s => !!s)
      options.bcc.push(...emails)
    }

    if (typeof options.subject === 'object') {
      this.props.options.subject.partyGroupCode = user.customer
    }
    if (typeof options.text === 'object') {
      this.props.options.text.partyGroupCode = user.customer
    }
    if (typeof options.html === 'object') {
      this.props.options.html.partyGroupCode = user.customer
    }

    if (ownEntity) {
      tableName = entity.tableName
      entityId = primaryKey = entity.primaryKey
      entity = locals[tableName]
    }

    if (options.to && (!Array.isArray(options.to) || options.to.length)) {
      if (!data.context) data.context = {}
      data.context = {
        ...data.context,
        ...locals,
        system,
        tableName,
        primaryKey,
        entity,
        entityId,
        accessToken: user.accessToken
      }

      await callAxios({
        method: 'POST',
        url: handler ? `${messengerUrl}/send/cta/email/${handler}` : `${messengerUrl}/send/cta/email`,
        data,
        headers: {
          Authorization: `Bearer ${user.accessToken}`
        }
      }, this.logger)
    }
    return Result.SUCCESS
  }
}