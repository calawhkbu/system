import { Request } from 'classes/request'
import { Response } from 'classes/response'

const app = {
  run: (req: Request, res: Response, helper: { [key: string]: Function }) => {
    console.log('Inbound App Example')
  }
}

export default app
