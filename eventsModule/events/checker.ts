import { BaseEvent } from 'modules/events/base-event'
import { EventService, EventConfig } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import { stringify } from 'querystring'

interface CheckerObject {

  resultName: string
  checkerFunction: Function
}

interface CheckerObjectResult {

  resultName: string
  result: any
}

class CheckerEvent extends BaseEvent {
  constructor(
    protected readonly parameters: any,
    protected readonly eventConfig: EventConfig,
    protected readonly repo: string,
    protected readonly eventService: EventService,
    protected readonly allService: any,

    protected readonly user?: JwtPayload,
    protected readonly transaction?: Transaction
  ) {
    super(parameters, eventConfig, repo, eventService, allService, user, transaction)
  }

  runCheckerFunction(
    checkerObject: CheckerObject,
    parameters: any
  ) {
    const checkerFunction = checkerObject.checkerFunction as Function
    const resultName = checkerObject.resultName as string
    // if checkerFunction is not provided, use checkerFunctionName is find function from checkerFunctionMap
    let result: any

    if (!checkerFunction) {
      throw new Error('checkerFunction / checkerFunctionName  is not provided')
    }

    result = checkerFunction(parameters)

    return {
      resultName,
      result,
    }
  }

  public async mainFunction(parameters: any) {

    const checkerResult = {}
    if (!parameters.checker) {
      throw new Error('checker param is not found in checker Event')
    }

    const checkerList = parameters['checker']

    checkerList.forEach((checkerObject: CheckerObject) => {

      const checkerObjectResult = this.runCheckerFunction(checkerObject, parameters) as CheckerObjectResult
      checkerResult[checkerObjectResult.resultName] = checkerObjectResult.result

    })

    // remove checker from parameters
    delete parameters['checker']

    // add checkerResult into the result
    return { ...parameters, ...{ checkerResult } }
  }
}

export default {
  execute: async(
    parameters: any,
    eventConfig: EventConfig,
    repo: string,
    eventService: any,
    allService: any,
    user?: JwtPayload,
    transaction?: Transaction
  ) => {
    const event = new CheckerEvent(
      parameters,
      eventConfig,
      repo,
      eventService,
      allService,
      user,
      transaction
    )
    return await event.execute()
  },
}
