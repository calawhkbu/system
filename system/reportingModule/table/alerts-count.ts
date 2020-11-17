import { IQueryParams } from 'classes/query'
import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'prepareParams',
      prepareParams(params): IQueryParams {
        const subqueries = (params.subqueries = params.subqueries || {})
        subqueries.alertJoin = true
        params.fields = ['alertCount']
        return params
      
    },
    {
      type: 'callDataService',
      getDataServiceQuery(params): [string, string] {
        let entityType = 'shipment'
        const subqueries = (params.subqueries = params.subqueries || {})
        if (subqueries.entityType && subqueries.entityType !== true && 'value' in subqueries.entityType) {
          entityType = subqueries.entityType.value
        }
        return [entityType, entityType]
      },
      resultMapping: [
        { from: 'alertCount', to: 'count' },
      ]
    },
  ],
  columns: [
    { key: 'count' },
  ],
} as JqlDefinition
