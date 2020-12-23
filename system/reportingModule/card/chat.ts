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
var results:any=[]



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
         "mentions",
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
          if(!tableName){
            delete params.subqueries.tableName
          }
          params.subqueries['userName']={value:user.username}
          return params
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['chatroom', 'chatroom'],
      onResult(res, params, { moment, groupByEntity, codeColumnName, nameColumnName, summaryVariables }: Result,user): any {
        const timezone=user.configuration.timezone
        const fullName=user.fullName
        results=[]

        //get unread Messages Only
     res.forEach(el => {
      let msg=[]
       if(el.readIndex!==el.lastMessageIndex && el.lastMessageIndex){
         el.createdAtLast=moment(el.createdAtLast).tz(timezone).format('YYYY-MM-DD HH:mm:ss')
     el.lastMessage=el.lastMessage || ''
        results.push(el)
       }
     });
       
          params.subqueries.search={value:[user.username]}
        //remove irrelevant
        delete params.sorting
        delete params.subqueries.userName
        return results
      }
    }, 
    // {
    //   type: 'callDataService',
    //   dataServiceQuery: ['person', 'person'],
    //   onResult(res, params, prevResult: Result,user): any {
    //     var finalResults=[]

    //     if(res&&res.length>0 && results&&results.length>0){
    //       results[0]['mentionsData']=res
    //       results.forEach(el => {
    //         let lenOfmentionsData=el.mentionsData&&el.mentionsData.length ||-1
    //             for(let i=0;i<lenOfmentionsData;i++){
    //               let name='';
    //               //remove @mention from lastMessage return clean message, no Tags no mentions
    //               if(el.mentionsData[i].displayName){
    //                 name=el.mentionsData[i].displayName
    //               }else{
    //                 name=el.mentionsData[i].firstName+" "+el.mentionsData[i].lastName
    //               }
  
    //              el.lastMessage= el.lastMessage.replace('@'+name,'')
    //              el.lastMessage=el.lastMessage.trim()

    //             } 
    //             finalResults.push(el)
    //           }
    //       )}
    //     return finalResults
    //         }
    // },
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
    },
    {
      display: "Ref #",
      name: "refNo",
      type: 'text'
    },
    {
      display: "chatroom",
      name: "chatroomSearch",
      type: 'text'
    },
    {
      display: "message",
      name: "messageSearch",
      type: 'text'
    }
  ]
} as JqlDefinition
