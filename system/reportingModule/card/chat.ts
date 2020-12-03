import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { ColumnExpression, OrderBy } from 'node-jql'
import Moment = require('moment-timezone')

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
          "message",
          "lastMessage",
          "houseNo",
          "bookingNo",
         //"photoURL",
         "mentions"
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
              person:{value:'marco.lou@swivelsoftware.com'}
             }
          }


        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['chatroom', 'chatroom'],
      onResult(res, params, { moment, groupByEntity, codeColumnName, nameColumnName, summaryVariables }: Result,user): any[] {
        const timezone=user.configuration.timezone
        const fullName=user.fullName
        let results:any=[]
        //get unread Messages Only
     res.forEach(el => {
      let msg=[]   
       if(el.readIndex!==el.lastMessageIndex && el.lastMessageIndex){
         el.createdAtLast=moment(el.createdAtLast).tz(timezone).format('YYYY-MM-DD HH:mm:ss')
          //remove @ mentions and return clean messagesWithout Tag
    //   let cleanText = el.messageWithoutTag.replace(/<\/?[^>]+(>|$)/g, "")// remove mentions @ 
    //   cleanText
    //   cleanText = cleanText&&cleanText.replace('<p>','')
    //   cleanText = cleanText&&cleanText.replace('</p>','')
    //  console.log('cleanText')
    //  console.log(cleanText)
    //  el.lastMessage=cleanText
    //  console.log('-----lastMessage')
    //  console.log(el.lastMessage)
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

