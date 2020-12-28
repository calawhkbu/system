import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import Moment = require('moment')
import { OrderBy } from 'node-jql'
import { expandGroupEntity, expandSummaryVariable, extendDate } from 'utils/card'
import { dateSourceList } from './booking-month'
import { ERROR } from 'utils/error'

interface Result {
  moment: typeof Moment
  groupByEntity: string
  codeColumnName: string
  nameColumnName: string
  summaryVariables: string[]
}

export default {
  constants: {
    name : 'frc',
    typeCodeList : ['F', 'R', 'C', 'T']
  },
  jqls: [
    {
      type: 'prepareParams',
      defaultResult: {},
      async prepareParams(params, prevResult: Result, user): Promise<IQueryParams> {
        const moment = prevResult.moment = (await this.preparePackages(user)).moment
        const subqueries = params.subqueries = params.subqueries || {}

        // idea : userGroupByVariable and userSummaryVariable is selected within filter by user
        if (!subqueries.groupByEntity || !(subqueries.groupByEntity !== true && 'value' in subqueries.groupByEntity)) throw ERROR.MISSING_GROUP_BY()
        if (!subqueries.topX || !(subqueries.topX !== true && 'value' in subqueries.topX)) throw ERROR.MISSING_TOP_X()

        // -----------------------------groupBy variable
        // const groupByEntity = prevResult.groupByEntity = subqueries.groupByEntity.value // should be shipper/consignee/agent/controllingCustomer/carrier
        // const codeColumnName = prevResult.codeColumnName = groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierCode` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyCode`
        // const nameColumnName = prevResult.nameColumnName = (groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierName` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyShortNameInReport`) + 'Any'
        
        const { groupByEntity, codeColumnName,nameColumnName } = expandGroupEntity(subqueries,'groupByEntity',true)

        prevResult.groupByEntity = groupByEntity
        prevResult.codeColumnName = codeColumnName
        prevResult.nameColumnName = nameColumnName

        const topX = subqueries.topX.value

        // ---------------------summaryVariables
        // let summaryVariables: string[] = []
        // if (subqueries.summaryVariables && subqueries.summaryVariables !== true && 'value' in subqueries.summaryVariables) {
        //   // sumamary variable
        //   summaryVariables = Array.isArray(subqueries.summaryVariables.value ) ? subqueries.summaryVariables.value  : [subqueries.summaryVariables.value ]
        // }
        // if (subqueries.summaryVariable && subqueries.summaryVariable !== true && 'value' in subqueries.summaryVariable) {
        //   summaryVariables = [...new Set([...summaryVariables, subqueries.summaryVariable.value] as string[])]
        // }
        // if (!(summaryVariables && summaryVariables.length)){
        //   throw new Error('MISSING_summaryVariables')
        // }
        // prevResult.summaryVariables = summaryVariables

        const summaryVariables = expandSummaryVariable(subqueries)
        prevResult.summaryVariables = summaryVariables


        // // limit/extend to 1 year
        // const year = (subqueries.date && subqueries.date !== true && 'from' in subqueries.date ? moment(subqueries.date.from, 'YYYY-MM-DD') : moment()).year()
        // subqueries.date = {
        //   from: moment()
        //     .year(year)
        //     .startOf('year')
        //     .format('YYYY-MM-DD'),
        //   to: moment()
        //     .year(year)
        //     .endOf('year')
        //     .format('YYYY-MM-DD')
        // }

        // extend date into whole year
        extendDate(subqueries,moment,'year')



        subqueries[`${codeColumnName}IsNotNull`] = {
          value: true
        }

        // select
        params.fields = [
          // select Month statistics
           ...summaryVariables.map(variable => `${params.constants.name}_${variable}Month`),
          codeColumnName,
          nameColumnName,
        ]

        // group by
        params.groupBy = [codeColumnName]
        // warning, will orderBy cbmMonth, if choose cbm as summaryVariables
        params.sorting = new OrderBy(`total_T_${summaryVariables[0]}`, 'DESC')
        params.limit = topX
        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['booking', 'booking'],
      onResult(res, params, { moment, groupByEntity, codeColumnName, nameColumnName, summaryVariables }: Result): any[] {
        return res.map(row => {
          const row_: any = { groupByEntity, code: row[codeColumnName], name: row[nameColumnName] }
          for (const variable of summaryVariables) {
            for (const typeCode of params.constants.typeCodeList) {
              for (const m of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
                const month = m === 12 ? 'total' : moment().month(m).format('MMMM')
                const key = `${month}_${typeCode}_${variable}`
                const value = +row[key]
                row_[key] = isNaN(value) ? 0 : value
              }
            }
          }
          console.log('row_')
          console.log(row_)
          return row_
        })
      }
    }
  ],
  filters: [
    // for this filter, user can only select single,
  // but when config in card definition, use summaryVariables. Then we can set as multi
{...dateSourceList},
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
      display: 'summaryVariable',
      name: 'summaryVariable',
      props: {
        items: [
          {
            label: 'chargeableWeight',
            value: 'chargeableWeight',
          },
          {
            label: 'grossWeight',
            value: 'grossWeight',
          },
          {
            label: 'cbm',
            value: 'cbm',
          },
          {
            label: 'totalBooking',
            value: 'totalBooking',
          },
          {
            label: 'teu',
            value: 'teu',
          },
          {
            label: 'quantity',
            value: 'quantity',
          }
      
        ],
        multi: false,
        required: true,
      },
      type: 'list',
    },
    {
      display: 'groupByEntity',
      name: 'groupByEntity',
      props: {
        items: [
          {
            label: 'carrier',
            value: 'carrier',
          },
          {
            label: 'shipper',
            value: 'shipper',
          },
          {
            label: 'consignee',
            value: 'consignee',
          },
          {
            label: 'agent',
            value: 'agent',
          },
          {
            label: 'agentGroup',
            value: 'agentGroup',
          },
          {
            label: 'controllingCustomer',
            value: 'controllingCustomer',
          },
          {
            label: 'linerAgent',
            value: 'linerAgent',
          },
          {
            label: 'roAgent',
            value: 'roAgent',
          },
          {
            label: 'office',
            value: 'fowarder',
          },
          {
            label : 'moduleType',
            value : 'moduleType'
          },
          {
            label : 'houseNo',
            value : 'houseNo'
          }
        ],
        required: true,
      },
      type: 'list',
    },
  ]
} as JqlDefinition

