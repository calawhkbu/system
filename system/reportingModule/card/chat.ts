import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { ColumnExpression, OrderBy } from 'node-jql'
import Moment = require('moment')
import _ =require('lodash')

import { expandBottomSheetGroupByEntity, expandSummaryVariable, extendDate, handleBottomSheetGroupByEntityValue, summaryVariableListBooking, groupByEntityListBooking } from 'utils/card'
import { group } from 'console'
const summaryVariableList = summaryVariableListBooking;
const groupByEntityList = groupByEntityListBooking;
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
        console.log('moment------------------')
        console.log(moment)
        const subqueries = (params.subqueries = params.subqueries || {})

        params.fields = [
      
          "id",
          "userName",
          "tableName",
          "roomKey",
          "chatroom",
          "readIndex",
          "lastMessageIndex",
          "createdAtLast",
          "createdByLast",
          "lastMessage",
          "houseNo",
          "bookingNo"
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
          params.sorting = new OrderBy(new ColumnExpression('chat','createdAt'), 'DESC')
        }

        //filter Logged In Users's message`
        let tableName=_.clone(params.subqueries.entityType&&params.subqueries.entityType.value)||undefined
          if(tableName){
            params.subqueries = {
              tableName: { value: tableName } ,
              userName:{value:user.username}
              
             }
          }else{
            params.subqueries = {
              userName: { value: user.username },
             }
          }


        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['chatroom', 'chatroom'],
      onResult(res, params, { moment, groupByEntity, codeColumnName, nameColumnName, summaryVariables }: Result): any[] {
        // EDIT HERE
        let results:any=[]
        //get unread Messages Only
     res.forEach(el => {
       if(el.readIndex!==el.lastMessageIndex && el.lastMessageIndex){
         el.createdAtLast=moment( el.createdAtLast).add(8,'h')
        results.push(el)
       }
     });
        return results && results.length>0?results :null

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

