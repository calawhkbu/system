import { JwtMicroPayload } from 'modules/auth/interfaces/jwt-payload'
import { CtaActionInt, IBody, Result } from 'modules/cta/interface'
import { BadRequestException, InternalServerErrorException } from '@nestjs/common'
import _ = require('lodash')
import { callAxios } from 'modules/cta/utils'

export interface IProps {
  handler?: string
  options?: any
  context?: any

  // recipients, in case party not available (i.e. booking, shipment, purchase_order not available)
  to?: [string, string][]
  cc?: [string, string][]
  bcc?: [string, string][]

  // parties
  toParty?: [string, string][]  // [['booking', 'shipper']]
  ccParty?: [string, string][]
  bccParty?: [string, string][]

  // TODO attachment -> options.attachments
}

export default class SendEmailAction<Props extends IProps = IProps> extends CtaActionInt<Props> {
  needLocals = true

  getEmail(tableName: string, body: IBody, [entityType, path]: [string, string]) {
    const entity = entityType === tableName ? body.entity : body.locals[entityType]
    if (entityType === 'purchase_order') entityType = 'purchaseOrder'
    return _.get(entity, path)
  }

  getPartyEmail(tableName: string, body: IBody, [entityType, key]: [string, string]) {
    return (
      this.getEmail(tableName, body, [entityType, `${entityType}Party.${key}PartyContactEmail`]) ||
      this.getEmail(tableName, body, [entityType, `${entityType}Party.${key}Party.email`])
    )
  }

  getRecipient(tableName: string, body: IBody, options: any, recipient: 'to'|'cc'|'bcc') {
    let recipients: any[] = options[recipient] || []
    if (!Array.isArray(recipients)) recipients = [recipients]
    if (this.props[recipient]) {
      recipients.push(...this.props[recipient].map(p => this.getEmail(tableName, body, p)).filter(s => !!s))
    }
    if (this.props[`${recipient}Party`]) {
      recipients.push(...this.props[`${recipient}Party`].map(p => this.getPartyEmail(tableName, body, p)).filter(s => !!s))
    }
    if (recipients.length) options[recipient] = _.uniq(recipients)
  }

  async run(system: string, tableName: string, primaryKey: string, body: IBody, user: JwtMicroPayload): Promise<Result> {
    if (!this.props) throw new InternalServerErrorException('MISSING_PROPS')
    const { messengerUrl } = await this.ctaService.getConfig()
    const { handler, toParty, ccParty, bccParty, ...data } = this.props
    let { entity, entityId } = body
    const locals = body.locals

    const options = data.options = _.cloneDeep(data.options || {} as any)
    this.getRecipient(tableName, body, options, 'to')
    this.getRecipient(tableName, body, options, 'cc')
    this.getRecipient(tableName, body, options, 'bcc')

    if (typeof options.subject === 'object') {
      this.props.options.subject.partyGroupCode = user.customer
    }
    if (typeof options.text === 'object') {
      this.props.options.text.partyGroupCode = user.customer
    }
    if (typeof options.html === 'object') {
      this.props.options.html.partyGroupCode = user.customer
    }

    if (entity.tableName && entity.primaryKey) {
      tableName = entity.tableName
      entityId = primaryKey = entity.primaryKey
      entity = locals[tableName]
    }

    if (options.to && (!Array.isArray(options.to) || options.to.length)) {
      if (!data.context) data.context = {}

      if (!data.context.accessToken) data.context.accessToken = user.accessToken

      data.context = {
        ...data.context,
        ...locals,
        system,
        tableName,
        primaryKey,
        entity,
        entityId
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
    else {
      throw new BadRequestException('MISSING_RECIPIENT')
    }

    return Result.SUCCESS
  }
}