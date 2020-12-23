import { JwtMicroPayload } from 'modules/auth/interfaces/jwt-payload';
import { IBody, Result } from 'modules/cta/interface';
import { callAxios } from 'modules/cta/utils';
import SendEmailAction, { IProps as IEmailProps } from './sendEmail'

export interface IProps extends IEmailProps {
  jotformId: number

  // if not specified, will use caller's access token (for receiving jotform response)
  accessTokenParty?: [string, string]
}

export default class SendJotformEmailAction extends SendEmailAction<IProps> {
  async run(system: string, tableName: string, primaryKey: string, body: IBody, user: JwtMicroPayload): Promise<Result> {
    body.locals = body.locals || {}
    body.locals.jotformId = this.props.jotformId
    body.locals.jotform = `https://form.jotform.com/${this.props.jotformId}`

    if (this.props.accessTokenParty) {
      let [entityType, key] = this.props.accessTokenParty
      if (entityType === 'purchase_order') entityType = 'purchaseOrder'
      const id = (
        this.getEmail(tableName, body, [entityType, `${entityType}Party.${key}PartyContactPersonId`]) ||
        this.getPartyEmail(tableName, body, this.props.accessTokenParty)
      )

      const response = await callAxios({
        method: 'POST',
        url: `${user.api['360']}/auth/api/micro/token/${id}`,
      }, this.logger)

      if (!this.props.context) this.props.context = {}
      this.props.context.accessToken = response.data.accessToken
    }

    return super.run(system, tableName, primaryKey, body, user)
  }
}