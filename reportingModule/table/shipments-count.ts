import { Query, FromTable } from 'node-jql'
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
]
