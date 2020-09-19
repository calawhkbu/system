import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { OrderBy } from 'node-jql'
import Moment = require('moment')

import { expandGroupEntity,expandSummaryVariable, extendDate, handleBottomSheetGroupByEntityValue, expandBottomSheetGroupByEntity, handleGroupByEntityValue } from 'utils/card'



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

        const finalParams = {
            fields: [
                'id',
                'masterNo',
                'houseNo'
            ],

            subqueries: {},
            limit: 10

        } as IQueryParams

        return finalParams

      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['shipment', 'shipmentInternal'],
      onResult(res, params, { moment, groupByEntity, codeColumnName, nameColumnName, summaryVariables }: Result): any[] {

        // console.log('res')
        // console.log(res)

        const finalResult = res.map(row => {
            const newRow = {...row}
            return newRow
        })

        return finalResult
      }
    }
  ],
  filters: [
  ]
} as JqlDefinition
