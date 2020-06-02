import { IQueryParams } from 'classes/query'
import { Request } from 'classes/request'
import { AxiosRequestConfig } from 'axios'
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
      }
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

/* import { Query, FromTable } from 'node-jql'
import { parseCode } from 'utils/function'

function prepareParams(): Function {
  const fn = async function(require, session, params) {
    // import
    const { BadRequestException } = require('@nestjs/common')

    // script
    const subqueries = (params.subqueries = params.subqueries || {})

    subqueries.alertJoin = true

    params.fields = [
      'alertCount',
    ]

    return params
  }

  const code = fn.toString()
  return parseCode(code)
}

function finalQuery(){

  return function(require, session, params)
  {

    let url = `api/shipment/query/shipment`

    if (params)
    {
      const subqueries = (params.subqueries = params.subqueries || {})
      const entityType = subqueries.entityType.value

      switch (entityType) {
        case 'shipment':
          url = `api/shipment/query/shipment`
          break

        case 'booking':
          url = `api/booking/query/booking`
          break

        default:
          break
      }
    }

    return new Query({
      $from: new FromTable(
        {
          method: 'POST',
          url,
          columns: [
            { name: 'alertCount', type: 'number', $as : 'count' },
          ],
        },
        'alert'
      ),
    })

  }

}

export default [

  [prepareParams(), finalQuery()]
] */
