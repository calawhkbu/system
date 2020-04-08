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
]
