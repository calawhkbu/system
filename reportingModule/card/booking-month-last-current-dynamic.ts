import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { BadRequestException } from '@nestjs/common'
import Moment = require('moment')
import { OrderBy } from 'node-jql'
import { expandBottomSheetGroupByEntity, expandSummaryVariable, calculateLastCurrent, handleBottomSheetGroupByEntityValue,summaryVariableListBooking,groupByEntityListBooking } from 'utils/card'
import { convertToStartOfDate } from 'utils/jql-subqueries'

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
        const moment = prevResult.moment = (await this.preparePackages(user)).moment
        const subqueries = (params.subqueries = params.subqueries || {})

        // idea : userGroupByVariable and userSummaryVariable is selected within filter by user
        if (!subqueries.groupByEntity || !(subqueries.groupByEntity !== true && 'value' in subqueries.groupByEntity)) throw new Error('MISSING_groupByVariable')
        if (!subqueries.topX || !(subqueries.topX !== true && 'value' in subqueries.topX)) throw new Error('MISSING_topX')


        
        handleBottomSheetGroupByEntityValue(subqueries)
        var { groupByEntity, codeColumnName,nameColumnName } = expandBottomSheetGroupByEntity(subqueries)
            // -----------------------------groupBy variable
            groupByEntity = prevResult.groupByEntity = subqueries.groupByEntity.value // should be shipper/consignee/agent/controllingCustomer/carrier
            // -----------------------------groupBy variable
            groupByEntity = prevResult.groupByEntity = subqueries.groupByEntity.value // should be shipper/consignee/agent/controllingCustomer/carrier
            codeColumnName = prevResult.codeColumnName;
            nameColumnName = prevResult.nameColumnName;
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
            }else{
              codeColumnName=`${groupByEntity}PartyCode`;
              nameColumnName=`${groupByEntity}PartyShortNameInReport` + 'Any';
            }
          

        const topX = subqueries.topX.value

        const summaryVariables = expandSummaryVariable(subqueries)
        prevResult.summaryVariables = summaryVariables

        // ------------------------------
        const { lastFrom, lastTo, currentFrom, currentTo } = calculateLastCurrent(subqueries,moment)

        subqueries.date = {
          lastFrom,
          lastTo,
          currentFrom,
          currentTo
        } as any

        // ----------------------- filter
        subqueries[`${codeColumnName}IsNotNull`]  = { // shoulebe carrierIsNotNull/shipperIsNotNull/controllingCustomerIsNotNull
          value : true
        }

        params.fields = [
          // select Month statistics
          ...summaryVariables.map(variable => `${variable}MonthLastCurrent`),
          codeColumnName,
          nameColumnName,
        ]

        // group by
        params.groupBy = [codeColumnName]

        params.limit = topX



        // new way of handling sorting
        const sorting = params.sorting = []
        if (subqueries.sorting && subqueries.sorting !== true && 'value' in subqueries.sorting) {
        const sortingValueList = subqueries.sorting.value as { value: string; ascOrDesc: 'ASC' | 'DESC' }[]
        sortingValueList.forEach(({ value, ascOrDesc }) => {
            const orderByExpression = new OrderBy(value,ascOrDesc)
            sorting.push(orderByExpression)
        })
        }
        else {
        params.sorting = new OrderBy(`total_${summaryVariables[0]}Current`, 'DESC')
        }
        console.log("PREPARE PARAMS")
        console.log(params)
        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['booking', 'booking'],
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
        }else{
          codeColumnName=`${groupByEntity}PartyCode`;
          nameColumnName=`${groupByEntity}PartyShortNameInReport` + 'Any';
        }
      
        return res.map(row => {
          const row_: any = { code: row[codeColumnName], name: row[nameColumnName], groupByEntity }
          console.log("DATA SVC")
          console.log(params);
          const code=params.subqueries.groupByEntity.value;
          console.log("DATA SVC code")
          console.log(code);
          for (const variable of summaryVariables) {
            for (const type of ['Last', 'Current']) {
              let total = 0
              for (const m of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) {
                const month = moment().month(m).format('MMMM')
                const key = `${month}_${variable}${type}`
                let value = +row[key]
                if (isNaN(value)) value = 0
                row_[key] = value
                total += value
              }
              row_[`total_${variable}${type}`] = total
              console.log("DATA SVC CURRENT ROW =")
              console.log(row);
              row_['code']=row[codeColumnName];
           
            }

            for (const m of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) {
              const month = moment().month(m).format('MMMM')
              const key = `${month}_${variable}LastCurrentPercentageChange`
              const value = +row[key]
              row_[key] = isNaN(value) ? 0 : value
            }

            const key = `total_${variable}LastCurrentPercentageChange`
            const value = +row[key]
            row_[key] = isNaN(value) ? 0 : value
          }
          console.log("DATA SVC")
          console.log(row_)
          

          return row_
        })
      }
    }
  ],
  filters: [
    // for this filter, user can only select single,
    // but when config in card definition, use summaryVariables. Then we can set as multi
    {
      display: 'topX',
      name: 'topX',
      props: {
        items: [
          {
            label: '10',
            value: 10,
          },
          {
            label: '20',
            value: 20,
          },
          {
            label: '50',
            value: 50,
          },
          {
            label: '100',
            value: 100,
          },
          {
            label: '1000',
            value: 1000,
          }
        ],
        multi : false,
        required: true,
      },
      type: 'list',
    },
    {
      display: 'summaryVariables',
      name: 'summaryVariables',
      props: {
        items: [
            ...summaryVariableList.reduce((acc,summaryVariable) => {

                acc = acc.concat(
                    [
                        {
                            label: `${summaryVariable}`,
                            value: `${summaryVariable}`,
                        }
                    ]
                )

                return acc

            },[])
        ],
        multi : true,
        required: true,
      },
      type: 'list',
    },
    {
      display: 'groupByEntity',
      name: 'groupByEntity',
      props: {
        items: [
            ...groupByEntityList.reduce((acc,groupByEntity) => {

                acc = acc.concat(
                    [
                        {
                            label: `${groupByEntity}`,
                            value: `${groupByEntity}`,
                        }
                    ]
                )

                return acc

            },[])
        ],
        required: true,
      },
      type: 'list',
    },

    {
      display: 'bottomSheetGroupByEntity',
      name: 'bottomSheetGroupByEntity',
      props: {
        items: [
            ...groupByEntityList.reduce((acc,groupByEntity) => {

                acc = acc.concat(
                    [
                        {
                            label: `${groupByEntity}`,
                            value: `${groupByEntity}`,
                        }
                    ]
                )

                return acc

            },[])
        ],
        required: true,
      },
      type: 'list',
    },
    
    {
      display: 'sorting',
      name: 'sorting',
      type: 'list',
      props: {
        multi: true,
        items: [
            ...summaryVariableList.reduce((acc,summaryVariable) => {

                acc = acc.concat(
                    [
                        {
                            label: `${summaryVariable} current`,
                            value: `total_${summaryVariable}Current`,
                        },
                        {
                            label: `${summaryVariable} last`,
                            value: `total_${summaryVariable}Last`,
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
