import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { expandGroupEntity } from 'utils/card'
import Moment = require('moment')
import { OrderBy } from 'node-jql'

interface Result {
  moment: typeof Moment
  groupByEntity: string
  codeColumnName: string
  nameColumnName: string

  bottomSheetGroupByEntity: string
  bottomSheetCodeColumnName: string
  bottomSheetNameColumnName: string

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

        console.log(`bottomSheetMetricList`)
        console.log(bottomSheetMetricList)

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
            bottomSheetNameColumnName
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
