import { Injectable } from '@nestjs/common'

@Injectable()
class IntegradationHub {
  execute (parameters: any) {
    console.log(JSON.stringify(parameters))
  }
}

const handler = new IntegradationHub()

export default handler
