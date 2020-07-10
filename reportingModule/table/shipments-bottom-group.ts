import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { expandGroupEntity, extendDate, LastCurrentUnit, calculateLastCurrent } from 'utils/card'
import Moment = require('moment')

import * as  rawMoment from 'moment'
import { OrderBy } from 'node-jql'

interface Result {
  moment: typeof Moment
  groupByEntity: string
  codeColumnName: string
  nameColumnName: string

  bottomSheetGroupByEntity: string
  bottomSheetCodeColumnName: string
  bottomSheetNameColumnName: string

  bottomSheetDynamicHeaderKey: string

  bottomSheetMetric1: string
  bottomSheetMetric2: string
}



export default {
  jqls: [
    {
      type: 'prepareParams',
      defaultResult: {},
      async prepareParams(params, prevResult, user): Promise<IQueryParams> {
        const { moment } = await this.preparePackages(user)

        prevResult.moment = moment

        const subqueries = (params.subqueries = params.subqueries || {})

        const groupByEntityValue = (subqueries.groupByEntityValue as { value: any }).value

        const { 
          groupByEntity: bottomSheetGroupByEntity,
          codeColumnName: bottomSheetCodeColumnName,
          nameColumnName: bottomSheetNameColumnName
        } = expandGroupEntity(subqueries,'bottomSheetGroupByEntity')


        let bottomSheetMetric1: string,bottomSheetMetric2 : string

        if (subqueries.bottomSheetMetric1) {
          bottomSheetMetric1 = (subqueries.bottomSheetMetric1 as any).value
          prevResult.bottomSheetMetric1 = bottomSheetMetric1
        }

        if (subqueries.bottomSheetMetric2)
        {
          bottomSheetMetric2 = (subqueries.bottomSheetMetric2 as any).value
          prevResult.bottomSheetMetric2 = bottomSheetMetric2
        }


        const bottomSheetMetricList = [bottomSheetMetric1,bottomSheetMetric2].filter(x => !!x)

        if (!bottomSheetMetricList.length)
        {
          throw new Error('bottomSheetMetricList empty')
        }


        const {
          groupByEntity,
          codeColumnName,
          nameColumnName
        } = expandGroupEntity(subqueries,'groupByEntity')

        prevResult.bottomSheetGroupByEntity = bottomSheetGroupByEntity
        prevResult.bottomSheetCodeColumnName = bottomSheetCodeColumnName
        prevResult.bottomSheetNameColumnName = bottomSheetNameColumnName

        prevResult.bottomSheetMetricList = bottomSheetMetricList

        // filter by the selected value
        subqueries[codeColumnName] = {
          value: groupByEntityValue
        }

        params.fields = [
          ...bottomSheetMetricList,
          bottomSheetNameColumnName,
          bottomSheetCodeColumnName,
        ]

        params.groupBy = [
          bottomSheetCodeColumnName
        ]


        // guess time range base of month, lastCurrentUnit, lastOrCurrent

        // need to use these 3 value to re-calculate the date
        const month = (subqueries.month || {} as any).value // warning this could be total

        const lastCurrentUnit = (subqueries.lastCurrentUnit || {} as any).value  as LastCurrentUnit
        const lastOrCurrent = (subqueries.lastOrCurrent || {} as any).value as 'last' | 'current'


        // used for showing last Or Current
        if (lastCurrentUnit || lastOrCurrent)
        {

          let finalFrom: string, finalTo: string

          if (!lastCurrentUnit)
          {
            throw new Error(`missing lastCurrentUnit`)
          }

          if (!lastOrCurrent)
          {
            throw new Error(`missing lastOrCurrent`)
          }

          const { lastFrom, lastTo, currentFrom, currentTo } = calculateLastCurrent(subqueries,moment)

          if (lastOrCurrent === 'last')
          {
            finalFrom = lastFrom
            finalTo = lastTo
          }
          else 
          {
            finalFrom = currentFrom
            finalTo = currentTo

          }

          subqueries.date = {
            from : finalFrom,
            to: finalTo
          }

        }

        // used for showing specific month
        if (month) {

          const { from, to } = subqueries.date as { from, to }

          // only handle single month case, cases like "total" will not handle
          if (rawMoment.months().includes(month)){

            const newFrom = moment(from).month(month).startOf('month').format('YYYY-MM-DD')
            const newTo = moment(from).month(month).endOf('month').format('YYYY-MM-DD')

            subqueries.date = {
              from : newFrom,
              to: newTo
            }

          }

        }

        // if (subqueries)
        // {
        //   const bottomSheetDynamicHeaderKey = (subqueries.bottomSheetDynamicHeaderKey as any).value
        //   prevResult.bottomSheetDynamicHeaderKey = bottomSheetDynamicHeaderKey


        //   if (['last','metric1_last'].includes(bottomSheetDynamicHeaderKey))

        //   extendDate(subqueries,moment,'year')
        //   const { from,to } = subqueries.date as any

        //   console.log(`bottomSheetDynamicHeaderKey`)
        //   console.log(bottomSheetDynamicHeaderKey)



        //   if (rawMoment.months().includes(bottomSheetDynamicHeaderKey)){
        //     const newFrom = moment(from).month(bottomSheetDynamicHeaderKey).startOf('month').format('YYYY-MM-DD')
        //     const newTo = moment(from).month(bottomSheetDynamicHeaderKey).endOf('month').format('YYYY-MM-DD')

        //     subqueries.date = {
        //       from : newFrom,
        //       to: newTo
        //     } 

        //   }

        //   console.log(`subqueries.date`)
        //   console.log(subqueries.date)
        // }

        




        params.sorting = new OrderBy(`${bottomSheetMetricList[0]}`, 'DESC')
      
        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['shipment', 'shipment'],
      onResult(
          res,
          params, 
          { 
            moment,
            groupByEntity,
            codeColumnName,
            nameColumnName,
            bottomSheetMetric1,
            bottomSheetMetric2,
            bottomSheetCodeColumnName,
            bottomSheetGroupByEntity,
            bottomSheetNameColumnName,
            bottomSheetDynamicHeaderKey
          }: Result
        ): any[] {

        return res.map(row => {

          // rename code and name
          const row_: any = { 

            code: row[bottomSheetCodeColumnName],
            name: row[bottomSheetNameColumnName],
            groupByEntity: bottomSheetGroupByEntity

          }

          if (bottomSheetMetric1)
          {
            row_[`bottomSheetMetric1`] = bottomSheetMetric1
            row_[`bottomSheetMetric1Value`] = row[bottomSheetMetric1]
          }

          if (bottomSheetMetric2)
          {
            row_[`bottomSheetMetric2`] = bottomSheetMetric2
            row_[`bottomSheetMetric2Value`] = row[bottomSheetMetric2]

          }




          return row_
        })
      }
    }
  ],

  // if want to show specific fields, please defined using FE_fields in bottom sheet filters
  columns: [
    { key: 'code' },
    { key: 'name' },
    { key: 'bottomSheetMetric1' },
    { key: 'bottomSheetMetric2' },
    { key: 'bottomSheetMetric1Value' },
    { key: 'bottomSheetMetric2Value' }

  ]
} as JqlDefinition
