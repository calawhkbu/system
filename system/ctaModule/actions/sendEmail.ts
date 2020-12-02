import { JwtMicroPayload } from 'modules/auth/interfaces/jwt-payload'
import { CtaActionInt, IBody, Result } from 'modules/cta/interface'
import axios from 'axios'

interface IProps {
  handler?: string
  options: any
  context?: any
}

export default class SendEmailAction extends CtaActionInt<IProps> {
  async run(tableName: string, primaryKey: string, body: IBody, user: JwtMicroPayload): Promise<Result> {
    const { messengerUrl } = await this.ctaService.getConfig()
    const { handler, ...data } = this.props

    const response = await axios.request({
      method: 'POST',
      url: handler ? `${messengerUrl}/send/email/${handler}` : `${messengerUrl}/send/email`,
      data,
      headers: {
        Authorization: `Bearer ${user.accessToken}`
      }
    })
    return Result.SUCCESS
  }
}