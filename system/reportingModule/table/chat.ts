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
          // select Month statistics
          "id",
          "chatroomId",
          "messageWithoutTag",
          "status",
          "nameList",
          "createdAt",
          "updatedAt"
       
        ]
     

        // new way of handling sorting
        const sorting = params.sorting = []
        if (subqueries.sorting && subqueries.sorting !== true && 'value' in subqueries.sorting) {
          const sortingValueList = subqueries.sorting.value as { value: string; ascOrDesc: 'ASC' | 'DESC' }[]
          sortingValueList.forEach(({ value, ascOrDesc }) => {
            const orderByExpression = new OrderBy(value,ascOrDesc)
            sorting.push(orderByExpression)
          })
        }

    
        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['chat', 'chat'],
      onResult(res, params, { moment, groupByEntity, codeColumnName, nameColumnName, summaryVariables }: Result): any[] {
        
        if(groupByEntity=='bookingNo'){
          codeColumnName=groupByEntity;
          nameColumnName=groupByEntity;
        }else if(groupByEntity=='carrier'){
          codeColumnName='carrierCode';
          nameColumnName='carrierName';
        }else if(groupByEntity=='moduleType'){
          codeColumnName='moduleTypeCode';
          nameColumnName='moduleTypeCode';
        }else if(groupByEntity=='portOfLoading'){
          codeColumnName=groupByEntity+"Code";
          nameColumnName=groupByEntity+"Name";
        }else if(groupByEntity=='portOfDischarge'){
          codeColumnName=groupByEntity+"Code";
          nameColumnName=groupByEntity+"Name";
        }else if(groupByEntity=='agent'){
          codeColumnName=groupByEntity+"PartyCode";
          nameColumnName=groupByEntity+"PartyName";
        }else if(groupByEntity=='forwarder'){
          codeColumnName=groupByEntity+"PartyCode";
          nameColumnName=groupByEntity+"PartyName";
        }else{
          codeColumnName=`${groupByEntity}PartyCode`;
          nameColumnName=`${groupByEntity}PartyShortNameInReport` + 'Any';
          
        }

        // EDIT HERE
      return res
    
      }
    }
  ],
  filters: [
    // for this filter, user can only select single,
    // but when config in card definition, use summaryVariables. Then we can set as multi
   
    

    
    {
      display: 'sorting',
      name: 'sorting',
      type: 'sorting',
      props: {
        multi: true,
        items: [
              ...summaryVariableList.reduce((acc,summaryVariable) => {

                acc = acc.concat(
                    [
                        {
                            label: `total_${summaryVariable}`,
                            value: `total_${summaryVariable}`,
                        }
                    ]
                )

                return acc

            },[])
          ],
      }
    }
  ]
} as JqlDefinition

