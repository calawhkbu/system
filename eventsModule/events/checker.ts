
import { BaseEvent } from 'modules/events/base-event'
import { EventService, EventConfig } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload';
import { Transaction } from 'sequelize';
import { stringify } from 'querystring';

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

  getVariable(parameters:any,key:string)
  {
    if (key.indexOf('.') >=0 )
    {
      const firstKey = key.substr(0,key.indexOf('.'))
      const subKey = key.substr(key.indexOf('.') +1 )
      
      // console.log(firstKey,'firstKey')
      // console.log(subKey,'subKey')

      return this.getVariable(parameters[firstKey],subKey)

    }

    const result = parameters[key]
    return result

  }


  isNull(variable:any,checkerParam:any) {

    return !(variable && variable != null)
  }

  isEmpty(variable:any,checkerParam:any) {

    return (!(variable && variable != null) && variable.length)
  }



  isMatch(variable:any,checkerParam:{operator:string,value?:any }){

    var operatorFunctionMap = {
      '=': function (x, y) { return x === y },
      '!=': function (x, y) { return x !== y },
      '>=': function (x, y) { return x >= y },
      '>': function (x, y) { return x >= y },
      '<=': function (x, y) { return x <= y },
      '<': function (x, y) { return x <= y },

   }​​​​​​​;

   // find the function correctly
   const operatorFunction = operatorFunctionMap[checkerParam.operator]

   if (!operatorFunction)
   {
     throw new Error('operatorFunction not found')
   }
   
   return operatorFunction(variable,checkerParam.value)

  }

  initCheckerFunctionMap()
  {

    const functionMap = new Map<string,Function>()

    functionMap.set('isMatch',this.isMatch)
    functionMap.set('isNull',this.isNull)
    functionMap.set('isEmpty',this.isEmpty)

    return functionMap

  }

  processCheckerFunction(key:string,parameters:any,checkerOption:any, checkerFunctionMap : Map<string,Function>)
  {
    let checkerFunction = checkerOption['checkerFunction'] as Function
    const checkerFunctionName = checkerOption['checkerFunctionName'] as string

    if (!checkerFunction)
    {
      checkerFunction = checkerFunctionMap.get(checkerFunctionName)
    }

    if (!checkerFunction)
    {
      throw new Error('checkerFunction is not found')
    }


    // console.log(key,'key')
    // console.log(parameters,'parameters')


    const variable = this.getVariable(parameters,key)

    // console.log(variable,'variable')

    let result:any = checkerFunction(variable,checkerOption.checkerParam)

    return {
      checkerFunctionName,
      variable : variable,
      result
    }

  }

  



  public async mainFunction(parameters: any) {

    const checkerResult = {}

    const checkerFunctionMap = this.initCheckerFunctionMap()

    if (!parameters.checker)
    {
      throw new Error('checker param is not found in checker Event')
    }


    for (var [key, checkerList] of Object.entries<any[]>(parameters['checker'])) {

      // clone variableResult from checkerList
      const variableResult = []

      for (let index = 0; index < checkerList.length; index++) {

        variableResult[index] = this.processCheckerFunction(key,parameters,checkerList[index],checkerFunctionMap)

      }
      
      checkerResult[key] = variableResult

    }

    // console.log(checkerResult,'checkerResult')

    delete parameters['checker']

    return {...parameters, ...{checkerResult}}

  }
}


export default {


  execute: async (parameters: any, eventConfig: EventConfig, repo: string, eventService: any, allService: any, user?: JwtPayload, transaction?: Transaction) => {

    const event = new CheckerEvent(parameters, eventConfig, repo, eventService, allService,user,transaction)
    return await event.execute()

  }



}
