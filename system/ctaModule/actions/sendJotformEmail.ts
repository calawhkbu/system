import { InternalServerErrorException } from '@nestjs/common'
import { JwtMicroPayload } from 'modules/auth/interfaces/jwt-payload'
import { IBody, Result } from 'modules/cta/interface'
import { callAxios } from 'modules/cta/utils'
import SendEmailAction, { IProps as IEmailProps } from './sendEmail'
import * as swig from 'swig-templates'

export interface IProps extends IEmailProps {
  jotformId: number

  // query parameters passed to the jotform
  queryParams?: [string, string?][]
}

// Send email with jotform link. Can specify whose access token to use
export default class SendJotformEmailAction extends SendEmailAction<IProps> {
  async run(system: string, tableName: string, primaryKey: string, body: IBody, user: JwtMicroPayload): Promise<Result> {
    if (!this.props) throw new InternalServerErrorException('MISSING_PROPS')
    let { entity, entityId } = body
    const locals = body.locals

    // get target access token
    let accessToken = user.accessToken
    if (this.props.toParty && this.props.toParty.length) {
      let [entityType, key] = this.props.toParty[0]
      if (entityType === 'purchase_order') entityType = 'purchaseOrder'
      const personId = this.getEmail(tableName, body, [entityType, `${entityType}Party.${key}PartyContactPersonId`])
      const email = this.getPartyEmail(tableName, body, this.props.toParty[0])

      // in case the cta user is not the same as the target user
      if (email !== user.user) {
        const response = await callAxios({
          method: 'POST',
          url: `${user.api['360']}/auth/api/micro/token/${personId || email}`,
        }, this.logger)

        accessToken = response.data.accessToken
      }
    }

    // email context for jotform link
    this.props.context = {
      ...(this.props.context || {}),
      ...locals,
      accessToken,
      system,
      tableName: entity.tableName && entity.primaryKey ? entity.tableName : tableName,
      primaryKey: entity.tableName && entity.primaryKey ? entity.primaryKey : primaryKey,
      entity: entity.tableName && entity.primaryKey ? locals[tableName] : entity,
      entityId: entity.tableName && entity.primaryKey ? entity.primaryKey : entityId,
    }

    // save jotform record
    const jotform = await this.ctaService.saveJotform({
      system,
      tableName: this.props.context.tableName,
      primaryKey: this.props.context.primaryKey,
      jotformId: this.props.jotformId,
      party: this.props.toParty && this.props.toParty.length ? this.props.toParty[0][1] : undefined,
      status: 'prepared'
    }, user)
    this.props.context.jotformId = jotform.id

    // get query params
    if (!this.props.queryParams) this.props.queryParams = []
    this.addIfNotExists(this.props.queryParams, 'jotformId')
    this.addIfNotExists(this.props.queryParams, 'accessToken')
    this.addIfNotExists(this.props.queryParams, 'system')
    this.addIfNotExists(this.props.queryParams, 'tableName')
    this.addIfNotExists(this.props.queryParams, 'entityId')
    const intermediate = this.props.queryParams.map(([key, path = key]) => `${key}={{${path}}}`)
    const queryParams = '?' + swig.render(intermediate.join('&'), { locals: this.props.context })
    this.props.context.jotformUrl = `https://form.jotform.com/${this.props.jotformId}${queryParams}`

    // send email
    const result = await super.run(system, tableName, primaryKey, body, user)
    jotform.queryParams = queryParams
    jotform.status = 'sent'
    this.ctaService.saveJotform(jotform, user)
    return result
  }

  private addIfNotExists(array: [string, string?][], value: string) {
    if (!array.find(([key]) => key === value)) {
      array.push([value])
    }
  }
}