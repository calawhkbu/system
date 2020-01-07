import { Query, FromTable } from 'node-jql'
import { parseCode } from 'utils/function'

function prepareShipmentParams(): Function {
  const fn = async function(require, session, params) {

    // import
    const { BadRequestException } = require('@nestjs/common')

    // script
    const subqueries = (params.subqueries = params.subqueries || {})

    params.fields = [
      'primaryKey',
      'houseNo',
      'masterNo',
      'jobDate',
      'carrierName',
      'shipperPartyName',
      'consigneePartyName',
      'portOfLoadingCode',
      'portOfDischargeCode',
      'departureDateEstimated',
      'arrivalDateEstimated',
    ]

    // console.log(subqueries)

    if (!subqueries.primaryKeyListString && !subqueries.workflowStatusListString) {
      throw new BadRequestException('MISSING_primaryKeyListString/workflowStatus')
    }

    if (subqueries.primaryKeyListString) {
      // get the primaryKeyList
      if (!subqueries.primaryKeyListString && subqueries.primaryKeyListString !== '')
        throw new BadRequestException('MISSING_primaryKeyListString')

      const primaryKeyList = subqueries.primaryKeyListString.value.split(',')

      subqueries.primaryKeyList = {
        value: primaryKeyList,
      }
    }

    // workflowStatus case
    if (subqueries.workflowStatusListString) {
      if (!subqueries.workflowStatusListString && subqueries.workflowStatusListString !== '')
        throw new BadRequestException('MISSING_workflowStatusListString')

      const workflowStatusList = subqueries.workflowStatusListString.value.split(',')

      subqueries.workflowStatusList = {
        value: workflowStatusList,
      }
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
      url: 'api/shipment/query/old360-uber-count',
      columns: [{ name: 'count', type: 'number' }],
    },
    'shipment'
  ),
})

export default [
  [prepareShipmentParams(), query]
]
