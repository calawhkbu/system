import { BadRequestException, InternalServerErrorException, NotImplementedException } from "@nestjs/common"
import { JwtMicroPayload } from "modules/auth/interfaces/jwt-payload"
import { CtaActionInt, IBody, Result } from "modules/cta/interface"
import { call360Axios } from "modules/cta/utils"

export interface IProps {
  entityType?: string
  fileName: string

  // get base64 file string from inputResult
  type: 'base64'
  key?: string
}

// Save document in 360
export default class SaveDocumentAction<Props extends IProps = IProps> extends CtaActionInt<Props> {
  needLocals = true

  async run(system: string, tableName: string, primaryKey: string, body: IBody, user: JwtMicroPayload): Promise<Result> {
    if (!this.props) throw new InternalServerErrorException('MISSING_PROPS')
    const { entityType = tableName, fileName, type, key } = this.props
    const { locals, inputResult } = body
    const { accessToken } = locals
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

    await call360Axios({
      method: 'POST',
      url: `${user.api['360']}/api/document/document/upload`,
      data: {
        tableName: entityType,
        primaryKey: entity.id,
        fileName,
        fileData: {
          base64String: fileBase64,
        }
      }
    }, user, this.logger, accessToken)
    return Result.SUCCESS
  }
}