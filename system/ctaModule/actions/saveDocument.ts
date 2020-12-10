import { BadRequestException, InternalServerErrorException, NotImplementedException } from "@nestjs/common"
import { JwtMicroPayload } from "modules/auth/interfaces/jwt-payload"
import { CtaActionInt, IBody, Result } from "modules/cta/interface"
import axios from 'axios'

export interface IProps {
  entityType: string
  fileType: string
  fileName: string

  // get base64 file string from inputResult
  type: 'base64'
  key?: string
}

export default class SaveDocumentAction<Props extends IProps = IProps> extends CtaActionInt<Props> {
  needLocals = true

  async run(system: string, tableName: string, primaryKey: string, body: IBody, user: JwtMicroPayload): Promise<Result> {
    if (!this.props) throw new InternalServerErrorException('MISSING_PROPS')
    const { entityType, fileType, fileName, type, key } = this.props
    const { locals, inputResult } = body
    const { backendUrl, accessToken } = locals
    const entity = tableName === entityType ? body.entity : body.locals[entityType]
    
    let fileBase64: string
    switch (type) {
      case 'base64': {
        if (!inputResult) throw new BadRequestException('MISSING_INPUT_RESULT')
        fileBase64 = inputResult[key]
        break
      }
      default:
        throw new NotImplementedException()
    }

    if (!fileBase64) throw new BadRequestException('NO_FILE')
    if (!entity.id) throw new InternalServerErrorException('NO_ENTITY_ID')

    const response = await axios.request({
      method: 'POST',
      url: `${backendUrl}/document/external-upload`,
      data: {
        entityType,
        searchBy: { id: entity.id },
        fileType,
        fileName,
        fileBase64
      },
      headers: {
        Authorization: `Bearer ${user.fullAccessToken || accessToken}`
      }
    })
    return Result.SUCCESS
  }
}