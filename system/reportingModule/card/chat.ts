import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { OrderBy } from 'node-jql'
import Moment = require('moment')

import { expandBottomSheetGroupByEntity,expandSummaryVariable, extendDate, handleBottomSheetGroupByEntityValue,summaryVariableListBooking,groupByEntityListBooking  } from 'utils/card'
import { group } from 'console'
const summaryVariableList=summaryVariableListBooking;
const groupByEntityList=groupByEntityListBooking;
interface Result {
  moment: typeof Moment
  groupByEntity: string
  codeColumnName: string
  nameColumnName: string
  summaryVariables: string[]
}



export default {
  jqls: [
    
    {
      type: 'prepareParams',
      defaultResult: {},
      async prepareParams(params, prevResult: Result, user): Promise<IQueryParams> {
        
        const moment = prevResult.moment = (await this.preparePackages(user)).moment as typeof Moment
        const subqueries = (params.subqueries = params.subqueries || {})
      
        params.fields = [
          // "id",
          // "chatroomId",
          // "messageWithoutTag",
          // "status",
          // "nameList",
          // "createdAt",
          // "updatedAt"
          "id",
          "userName",
          "tableName",
          "roomKey",
          "chatroom",
          "readIndex",
          "createdAt"
       
        ]
     

     // new way of handling sorting
     const sorting = params.sorting = []
     if (subqueries.sorting && subqueries.sorting !== true && 'value' in subqueries.sorting) {
       const sortingValueList = subqueries.sorting.value as { value: string; ascOrDesc: 'ASC' | 'DESC' }[]
       sortingValueList.forEach(({ value, ascOrDesc }) => {
         const orderByExpression = new OrderBy(value, ascOrDesc)
         sorting.push(orderByExpression)
       })
     }
     else {
       params.sorting = new OrderBy(`createdAt`, 'DESC')
     }

     //filter Logged In Users's message
     //params.subqueries={userNameIsEq:{value:user.username}}
     params.subqueries.userName={value:user.username}
  console.log(user.username)
  console.log('params..')
  console.log(params)
 
        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['chatroom', 'chatroom'],
      onResult(res, params, { moment, groupByEntity, codeColumnName, nameColumnName, summaryVariables }: Result): any[] {
        
      

        // EDIT HERE
      return res
    
      }
    }
  ],
  filters: [
    // for this filter, user can only select single,
    // but when config in card definition, use summaryVariables. Then we can set as multi
    {
      display: "entityType",
      name: "entityType",
      props: {
        items: [
          {
            label: "shipment",
            value: "shipment"
          },
          {
            label: "booking",
            value: "booking"
          }
    
        ],
        multi: false,
        required: true,
      },
      type: 'list'
    }
  ]
} as JqlDefinition

