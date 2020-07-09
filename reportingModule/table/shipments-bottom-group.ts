import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { expandGroupEntity, expandSummaryVariable } from 'utils/card'
import Moment = require('moment')

interface Result {
  moment: typeof Moment
  groupByEntity: string
  codeColumnName: string
  nameColumnName: string

  bottomSheetGroupByEntity: string
  bottomSheetCodeColumnName: string
  bottomSheetNameColumnName: string

  summaryVariables: string[]
}



export default {
  jqls: [
    {
      type: 'prepareParams',
      async prepareParams(params, prevResult, user): Promise<IQueryParams> {

        const { moment } = await this.preparePackages(user)

        prevResult.moment = moment

        const subqueries = (params.subqueries = params.subqueries || {})

        const { groupByEntityValue } = subqueries

        const { 
          groupByEntity: bottomSheetGroupByEntity,
          codeColumnName: bottomSheetCodeColumnName,
          nameColumnName: bottomSheetNameColumnName
        } = expandGroupEntity(subqueries,'bottomSheetGroupByEntity')

        const bottomSheetSummaryVariables = expandSummaryVariable(subqueries,'bottomSheetSummaryVariables','bottomSheetSummaryVariable')

        const { 
          groupByEntity,
          codeColumnName,
          nameColumnName
        } = expandGroupEntity(subqueries,'groupByEntity')

        prevResult.bottomSheetGroupByEntity = bottomSheetGroupByEntity
        prevResult.bottomSheetCodeColumnName = bottomSheetCodeColumnName
        prevResult.bottomSheetNameColumnName = bottomSheetNameColumnName

        // filter by the selected value
        subqueries[codeColumnName] = {
          value: groupByEntityValue
        }

        params.fields = [
          ...bottomSheetSummaryVariables,
          bottomSheetNameColumnName,
          bottomSheetCodeColumnName,
        ]

        params.groupBy = [
          bottomSheetCodeColumnName
        ]
      
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
            summaryVariables,
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

          for (const variable of summaryVariables) {
            row_[`${variable}`] = row[variable]
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
    { key: 'metric1' },
    { key: 'metric2' },
    { key: 'metric3' }
  ]
} as JqlDefinition
