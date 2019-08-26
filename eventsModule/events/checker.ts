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

  extractObject(inputObject: any, includeKeyList?: string[], excludeKeyList?: string[])
  {

    const cloned = JSON.parse(JSON.stringify(inputObject))

    for (const [key, value] of Object.entries(cloned)) {

      console.log(`${key}: ${value}`)

      if ((includeKeyList && includeKeyList.length && !includeKeyList.includes(key)) || (excludeKeyList && excludeKeyList.length && excludeKeyList.includes(key)))
      {
        delete cloned[key]
      }
    }

    return cloned

  }

  // get variable based on key
  getVariable(parameters: any, key: string) {
    if (key.indexOf('.') >= 0) {
      const firstKey = key.substr(0, key.indexOf('.'))
      const subKey = key.substr(key.indexOf('.') + 1)

      return this.getVariable(parameters[firstKey], subKey)
    }

    const result = parameters[key]
    return result
  }

  isNull(variable: any) {
    return !(variable && variable != null)
  }

  isEmpty(variable: any) {
    console.log('in is Empty')
    return !(variable && variable != null) && variable.length
  }

  isMatch(variable: any, checkerParam: { operator: string; value?: any }) {
    const operatorFunctionMap = {
      '='(x, y) {
        return x === y
      },
      '!='(x, y) {
        return x !== y
      },
      '>='(x, y) {
        return x >= y
      },
      '>'(x, y) {
        return x >= y
      },
      '<='(x, y) {
        return x <= y
      },
      '<'(x, y) {
        return x <= y
      },
    }
    // find the function correctly
    const operatorFunction = operatorFunctionMap[checkerParam.operator]

    if (!operatorFunction) {
      throw new Error('operatorFunction not found')
    }

    return operatorFunction(variable, checkerParam.value)
  }

  diff(left: any, right: any, includeKeyList?: string[], excludeKeyList?: string[]) {

    const jsondiffpatch = require('jsondiffpatch').create()

    let clonedLeft = JSON.parse(JSON.stringify(left))
    let clonedRight = JSON.parse(JSON.stringify(right))

    clonedLeft = this.extractObject(clonedLeft, includeKeyList, excludeKeyList)
    clonedRight = this.extractObject(clonedRight, includeKeyList, excludeKeyList)

    const diff =  jsondiffpatch.diff(clonedLeft, clonedRight)
    return diff

  }

  initCheckerFunctionMap() {
    const functionMap = new Map<string, Function>()

    functionMap.set('isMatch', this.isMatch)
    functionMap.set('isNull', this.isNull)
    functionMap.set('isEmpty', this.isEmpty)
    functionMap.set('extractObject', this.extractObject)
    functionMap.set('diff', this.diff)

    return functionMap
  }

  runCheckerFunction(
    checkerObject: CheckerObject,
    parameters: any,
    checkerFunctionMap: Map<string, Function>
  ) {
    const checkerFunction = checkerObject.checkerFunction as Function
    const resultName = checkerObject.resultName as string
    // if checkerFunction is not provided, use checkerFunctionName is find function from checkerFunctionMap
    let result: any

    if (!checkerFunction) {
      throw new Error('checkerFunction / checkerFunctionName  is not provided')
    }

    result = checkerFunction(parameters, checkerFunctionMap)

    return {
      resultName,
      result,
    }
  }

  public async mainFunction(parameters: any) {

    const checkerResult = {}

    const checkerFunctionMap = this.initCheckerFunctionMap()

    if (!parameters.checker) {
      throw new Error('checker param is not found in checker Event')
    }

    const checkerList = parameters['checker']

    checkerList.forEach((checkerObject: CheckerObject) => {

      const checkerObjectResult = this.runCheckerFunction(checkerObject, parameters, checkerFunctionMap) as CheckerObjectResult
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
