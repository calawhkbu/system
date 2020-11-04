import BaseEventHandler from 'modules/events/baseEventHandler'
import { EventService, EventConfig, EventData, EventHandlerConfig, EventAllService } from 'modules/events/service'
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

export default class CheckerEventHandler extends BaseEventHandler {
  constructor(
    protected  eventDataList: EventData<any>[],
    protected readonly eventHandlerConfig: EventHandlerConfig,
    protected readonly repo: string,
    protected readonly eventService: EventService,
    protected readonly allService: EventAllService,

    protected readonly user?: JwtPayload,
    protected readonly transaction?: Transaction
  ) {
    super(eventDataList, eventHandlerConfig, repo, eventService, allService, user, transaction)
  }

  runCheckerFunction(checkerObject: CheckerObject, eventData: EventData<any>) {
    const checkerFunction = checkerObject.checkerFunction as Function
    const resultName = checkerObject.resultName as string
    // if checkerFunction is not provided, use checkerFunctionName is find function from checkerFunctionMap
    let result: any

    if (!checkerFunction) {
      throw new Error('checkerFunction / checkerFunctionName  is not provided')
    }

    result = checkerFunction(eventData)

    return {
      resultName,
      result,
    } as CheckerObjectResult
  }

  public async mainFunction(eventDataList: EventData<any>[]) {
    const checkerResult = {}
    const finalEventDataList = eventDataList.map(eventData => {

      if (!eventData.checker) {
        throw new Error('checker param is not found in checker Event')
      }

      const checkerList = eventData.checker

      checkerList.forEach((checkerObject: CheckerObject) => {
        const { resultName, result } = this.runCheckerFunction(
          checkerObject,
          eventData
        )
        checkerResult[resultName] = result
      })

      // remove checker from parameters
      delete eventData['checker']

      // add checkerResult into the result
      return { ...eventData, ...{ checkerResult } }

    })

    return finalEventDataList

  }

}
