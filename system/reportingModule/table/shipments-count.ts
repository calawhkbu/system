import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { ERROR } from 'utils/error'

export default {
  jqls: [
    {
      type: 'prepareParams',
      prepareParams(params): IQueryParams {
        const subqueries = (params.subqueries = params.subqueries || {})
  

        // lastStatusList case
        if (subqueries.lastStatus) {
          if (!(subqueries.lastStatus !== true && 'value' in subqueries.lastStatus && Array.isArray(subqueries.lastStatus.value))) throw ERROR.MISSING_LAST_STATUS()
          subqueries.lastStatusJoin = true
        }
        
        //alertType case
        if (subqueries.selectedAlertType) {
          if (!(subqueries.alertType !== true && 'value' in subqueries.selectedAlertType && Array.isArray(subqueries.selectedAlertType.value))) throw ERROR.MISSING_ALERT_TYPE()
          subqueries.alertJoin = true
        }
  
        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceType: 'count',
      dataServiceQuery: ['shipment', 'shipment']
    }
  ],
  columns: [
    { key: 'count' }
  ]
} as JqlDefinition
