import { JwtMicroPayload } from 'modules/auth/interfaces/jwt-payload'
import { CtaActionInt, IBody, Result } from 'modules/cta/interface'
import axios from 'axios'
import { InternalServerErrorException } from '@nestjs/common'

interface IProps {
  handler?: string
  options: any
  context?: any
}

export default class SendEmailAction extends CtaActionInt<IProps> {
  needLocals = true

  async run(system: string, tableName: string, primaryKey: string, body: IBody, user: JwtMicroPayload): Promise<Result> {
    if (!this.props) throw new InternalServerErrorException('MISSING_PROPS')
    const { messengerUrl } = await this.ctaService.getConfig()
    const { handler, ...data } = this.props
    const { entity, entityId } = body
    const { backendUrl, ...locals } = body.locals

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

    const response = await axios.request({
      method: 'POST',
      url: handler ? `${messengerUrl}/send/cta/email/${handler}` : `${messengerUrl}/send/cta/email`,
      data,
      headers: {
        Authorization: `Bearer ${user.accessToken}`
      }
    })
    return Result.SUCCESS
  }
}