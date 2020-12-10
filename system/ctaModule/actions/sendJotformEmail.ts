import { JwtMicroPayload } from 'modules/auth/interfaces/jwt-payload';
import { IBody, Result } from 'modules/cta/interface';
import SendEmailAction, { IProps as IEmailProps } from './sendEmail'

export interface IProps extends IEmailProps {
  jotformId: number
}

export default class SendJotformEmailAction extends SendEmailAction<IProps> {
  async run(system: string, tableName: string, primaryKey: string, body: IBody, user: JwtMicroPayload): Promise<Result> {
    body.locals = body.locals || {}
    body.locals.jotformId = this.props.jotformId
    body.locals.jotform = `https://form.jotform.com/${this.props.jotformId}`
    return super.run(system, tableName, primaryKey, body, user)
  }
}