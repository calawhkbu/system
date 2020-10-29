import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import _ = require('lodash')


export default {
  jqls: [
    {
      type: 'prepareParams',
      prepareParams(params): IQueryParams {
        const subqueries = (params.subqueries = params.subqueries || {})
   //For alert
   let query=params.subqueries.query.value;
   for(let i=0;i<query.length;i++){
     query=query.replace('&quot;','"');
   }
   query=JSON.parse(query);

        // lastStatusList case
        if (subqueries.lastStatus) {
          if (!(subqueries.lastStatus !== true && 'value' in subqueries.lastStatus && Array.isArray(subqueries.lastStatus.value))) throw new Error('MISSING_lastStatus')
          subqueries.lastStatusJoin = true
        }
        
        //alertType case
        if (subqueries.selectedAlertType) {
          if (!(subqueries.alertType !== true && 'value' in subqueries.selectedAlertType && Array.isArray(subqueries.selectedAlertType.value))) throw new Error('MISSING_alertType')
          subqueries.alertJoin = true
          //merge subqueries of clicked row 
          let date=_.cloneDeep(params.subqueries.date)
          _.merge(params.subqueries,query)
         params.subqueries.date=date
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

/* import { Query, FromTable } from 'node-jql'
import { parseCode } from 'utils/function'

function prepareShipmentParams(): Function {
  const fn = async function(require, session, params) {
    // import
    const { BadRequestException } = require('@nestjs/common')

    // script
    const subqueries = (params.subqueries = params.subqueries || {})

    // lastStatusList case
    if (subqueries.lastStatus) {
      if (!(subqueries.lastStatus.value && subqueries.lastStatus.value.length) )
        throw new Error('MISSING_lastStatus')

      subqueries.lastStatusJoin = true
    }

    // lastStatusList case
    if (subqueries.alertType) {
      if (!(subqueries.alertType.value && subqueries.alertType.value.length) )
        throw new Error('MISSING_alertType')

        subqueries.alertJoin = true
    }

    return params
  }

  const code = fn.toString()
  return parseCode(code)
}

const query = new Query({
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/shipment/query/shipment/count',
      columns: [{ name: 'count', type: 'number' }],
    },
    'shipment'
  ),
})

export default [
  [
    prepareShipmentParams(), query
  ]
] */
