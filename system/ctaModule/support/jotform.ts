import { IBody } from 'modules/cta/interface'
import { CtaService } from 'modules/cta/service'

export async function getEntity(this: CtaService, body: IBody) {
  return body.inputResult
}