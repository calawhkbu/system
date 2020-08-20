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


        const subqueries = params.subqueries || {}

        params.fields = [
            'id',
            'masterNo',
            'houseNo',
            'jobNo'
        ],

        params.limit = 10

        return params
        
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['shipment', 'shipment'],
      onResult(res, params, { moment, groupByEntity, codeColumnName, nameColumnName, summaryVariables }: Result): any[] {

        const codeValue = params.subqueries.code.value as string
        const finalResult = res.map(row => {

            const newRow = { ...row, code : row[codeValue] }

            return newRow

        })

        return finalResult
      }
    }
  ],
  filters: [
    {
        display: 'code',
        name: 'code',
        props: {
          items: [
            {
              label: 'houseNo',
              value: 'houseNo',
            },
            {
              label: 'masterNo',
              value: 'masterNo',
            },
            {
              label: 'jobNo',
              value: 'jobNo',
            },
          ],
          required: true,
        },
        type: 'list',
      },
  ]
} as JqlDefinition

