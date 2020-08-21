import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { OrderBy } from 'node-jql'
import Moment = require('moment')

import { expandGroupEntity, expandSummaryVariable, extendDate, handleBottomSheetGroupByEntityValue, expandBottomSheetGroupByEntity, handleGroupByEntityValue } from 'utils/card'



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
        // console.log("THE SUBQURIES");
        // console.log(subqueries)
        params.fields = [
          'id',
          'masterNo',
          'houseNo',
          'jobNo'
        ],
          params.limit = 10;
        return params;

      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['shipment', 'shipment'],
      onResult(res, params, { moment, groupByEntity, codeColumnName, nameColumnName, summaryVariables }: Result): any[] {

        const codeValue = params.subqueries.code.value as string
        console.log("THE PARAMS callDATA");
        console.log(params);
        console.log(codeValue);
        const finalResult = res.map(row => {
          const newRow = { ...row, code: row[codeValue] }
          return newRow

        })

        return finalResult
      }
    },
    // {
    //   type: 'postProcess',
    //   async postProcess(params, prevResult: Result, user) {
    //     const subqueries = (params.subqueries = params.subqueries || {})
    //     var result: any = [];
    //     result = prevResult;
    //     console.log("THE RESULT IS");
    //     console.log(result);
    //     result = result.filter(o => o.carrierCode == "CX");
    //return result;
        

    //   }
    // }
   
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
  ],


} as JqlDefinition

