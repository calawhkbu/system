import { Query, FromTable } from 'node-jql'
import { parseCode } from 'utils/function'

function prepareParams(): Function {
  const fn = async function(require, session, params) {
    // import
    const { BadRequestException } = require('@nestjs/common')

    // script
    const subqueries = (params.subqueries = params.subqueries || {})

    subqueries.alertJoin = true

    params.fields = [
      'alertTableName',
      'alertPrimaryKey',
      'alertCategory',
      'alertType',
      'alertTitle',
      'alertMessage',
      'alertContent',
      'alertSeverity',
      'alertStatus',
      'alertCreatedAt',
      'alertUpdatedAt'
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
            { name: 'alertTableName', type: 'string', $as : 'tableName' },
            { name: 'alertPrimaryKey', type: 'string', $as : 'primaryKey' },
            { name: 'alertCategory', type: 'string' },
            { name: 'alertType', type: 'string' },
            { name: 'alertTitle', type: 'string' },
            { name: 'alertMessage', type: 'string' },
            { name: 'alertContent', type: 'object' },
            { name: 'alertSeverity', type: 'string' , $as: 'severity'},
            { name: 'alertStatus', type: 'string', $as: 'status'},
            { name : 'alertUpdatedAt' , type : 'string' },
            { name : 'alertCreatedAt' , type : 'string' }
          ],
        },
        'alert'
      ),
    })

  }

}

export default [

  [prepareParams(), finalQuery()]
]
