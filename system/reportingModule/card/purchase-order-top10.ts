import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { OrderBy } from 'node-jql'
import { expandGroupEntity, summaryVariableList } from 'utils/card'

interface Result {
  result: any[]
  xAxis: string
  summaryColumnName: string
  codeColumnName: string
  nameColumnName: string
}

export default {
  jqls: [
    {
      type: 'prepareParams',
      defaultResult: {},
      prepareParams(params, prevResult: Result): IQueryParams {
        const subqueries = (params.subqueries = params.subqueries || {})

        // warning cannot display from frontend
        if (!subqueries.xAxis) throw new Error('MISSING_xAxis')
        if (!subqueries.yAxis) throw new Error('MISSING_yAxis')
        if (!subqueries.topX) throw new Error('MISSING_topX')

        // most important part of this card
        // dynamically choose the fields and summary value
        const xAxis = (subqueries.xAxis as any).value // should be shipper/consignee/agent/controllingCustomer/carrier
        const summaryColumnName = (subqueries.yAxis as any).value // should be chargeableWeight/cbm/grossWeight/totalShipment

        
        var summaryVariableList { codeColumnName, nameColumnName } = expandGroupEntity(subqueries,'xAxis',true)


         codeColumnName =
          xAxis === 'incoTerms'
            ? `${xAxis}Code`
            : xAxis === 'portOfLoading'
            ? `portOfLoadingCode`
            : xAxis === 'portOfDischarge'
            ? `portOfDischargeCode`
            : xAxis === 'agentGroup'
            ? `freightTerms`
            : `${xAxis}Code`
         nameColumnName =
          (xAxis === 'incoTerms'
            ? `${xAxis}Code`
            : xAxis === 'portOfLoading'
            ? `portOfLoadingCode`
            : xAxis === 'portOfDischarge'
            ? `portOfDischargeCode`
            : xAxis === 'moduleType'
            ? `${xAxis}Code`
            : xAxis === 'freightTerms'
            ? `${xAxis}Code`
            : `${xAxis}PartyShortNameInReport`) + 'Any'
     
        prevResult.xAxis = xAxis
        prevResult.summaryColumnName = summaryColumnName
        prevResult.codeColumnName = codeColumnName
        prevResult.nameColumnName = nameColumnName



        params.sorting = new OrderBy(summaryColumnName, 'DESC')
        params.fields = [...new Set([codeColumnName, summaryColumnName, nameColumnName])]
        params.groupBy = [codeColumnName]

        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['purchase_order', 'purchase_order'],
      onResult(res, params, prevResult: Result): Result {
        const { summaryColumnName, codeColumnName, nameColumnName } = prevResult
        prevResult.result = res.map(row => {
          const result = {
            [codeColumnName]: row[codeColumnName],
            [nameColumnName]: row[nameColumnName],
          }
          let value = +row[summaryColumnName]
          if (isNaN(value)) value = 0
          result[summaryColumnName] = value
          return result
        })
        return prevResult
      }
    },
    {
      type: 'postProcess',
      postProcess(params, { xAxis, summaryColumnName, codeColumnName, nameColumnName, result }: Result): any[] {
        const subqueries = (params.subqueries = params.subqueries || {})
        const showOther = subqueries.showOther || false
        const topX = (subqueries.topX as any).value
        console.debug("POSTPROCESS-PARAMS")
        console.debug(params)

        const topXShipmentList: any[] = (result as any[]).filter(x => x[codeColumnName]).slice(0, topX)
        if (showOther) {
          // use the code of the top10 to find the rest
          const topXShipmentCodeList = topXShipmentList.map(x => x[codeColumnName])
          const otherShipmentList = result.filter(x => !topXShipmentCodeList.includes(x[codeColumnName]))

          // sum up all the other
          const otherSum = otherShipmentList.reduce((c, row) => c + row[summaryColumnName], 0)

          // compose the record for other
          const otherResult = {}
          otherResult[codeColumnName] = 'other'
          otherResult[nameColumnName] = 'other'
          otherResult[summaryColumnName] = otherSum

          topXShipmentList.push(otherResult)
        }

        return topXShipmentList.map(row => {
          const row_: any = {}
          row_.xAxis = xAxis
          row_.yAxis = summaryColumnName
          row_.code = row[codeColumnName]
          row_.name = row[nameColumnName]
          row_.summary = row[summaryColumnName]
          return row_
        })
      }
    }
  ],
  filters: [
    {
      display: 'yAxis',
      name: 'yAxis',
      props: {
        items: [
         
          {
            label: 'totalpo',
            value: 'totalpo',
          },
         
       
        
        
        ],
        required: true,
      },
      type: 'list',
    },
    {
      display: 'xAxis',
      name: 'xAxis',
      props: {
        items: [
       
          {
            label: 'incoTerms',
            value: 'incoTerms',
          },
          {
            label: 'freightTerms',
            value: 'freightTerms',
          },
          {
            label: 'moduleType',
            value: 'moduleType',
          },
          {
            label: 'portOfLoading',
            value: 'portOfLoading',
          },
          {
            label: 'portOfDischarge',
            value: 'portOfDischarge',
          }
        ],
        required: true,
      },
      type: 'list',
    },
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
      display: 'showOther',
      name: 'showOther',
      type: 'boolean',
    },
  ]
} as JqlDefinition
