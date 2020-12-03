import { JwtMicroPayload } from 'modules/auth/interfaces/jwt-payload'
import { CtaActionInt, IBody, Result } from 'modules/cta/interface'

export default class TestAction extends CtaActionInt {
  async run(system: string, tableName: string, primaryKey: string, body: IBody, user: JwtMicroPayload): Promise<Result> {
    console.debug(`system=${system}`, 'TestAction')
    console.debug(`tableName=${tableName}`, 'TestAction')
    console.debug(`primaryKey=${primaryKey}`, 'TestAction')
    console.debug(`entityId=${body.entityId}`, 'TestAction')
    if (body.uuid) console.debug(`uuid=${body.uuid}`, 'TestAction')
    if (body.locals) console.debug(`locals=${JSON.stringify(body.locals)}`, 'TestAction')
    if (body.inputResult) console.debug(`inputResult=${JSON.stringify(body.inputResult)}`, 'TestAction')
    return Result.SUCCESS
  }
}