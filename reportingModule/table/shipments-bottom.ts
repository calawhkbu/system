import {
  FromTable,
  Query,
} from 'node-jql'
import { parseCode } from 'utils/function'

function prepareShipmentParams(): Function {
  const fn = async function(require, session, params) {
    // import
    const { BadRequestException } = require('@nestjs/common')

    // script
    const subqueries = (params.subqueries = params.subqueries || {})

    params.fields = [
      'id',
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

    console.log(`aaa`)
    console.log(subqueries)

    // if (!subqueries.primaryKeyListString && !subqueries.lastStatus) {
    //   throw new Error('MISSING_primaryKeyListString/workflowStatus')
    // }

    if (subqueries.primaryKeyListString) {
      // get the primaryKeyList
      if (!subqueries.primaryKeyListString && subqueries.primaryKeyListString !== '')
        throw new Error('MISSING_primaryKeyListString')

      const primaryKeyList = subqueries.primaryKeyListString.value.split(',')

      subqueries.primaryKeyList = {
        value: primaryKeyList,
      }
    }

    // lastStatusList case
    if (subqueries.lastStatus) {
      if (!(subqueries.lastStatus.value && subqueries.lastStatus.value.length) )
        throw new Error('MISSING_lastStatus')
    }

    console.log(`bottomparams`)
    console.log(params)

    return params
  }

  const code = fn.toString()
  return parseCode(code)
}

const query = new Query({
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/shipment/query/shipment',
      columns: [
        { name: 'id', type: 'string' },
        { name: 'houseNo', type: 'string' },
        { name: 'masterNo', type: 'string' },
        { name: 'jobDate', type: 'Date' },
        { name: 'carrierName', type: 'string' },
        { name: 'shipperPartyName', type: 'string' },
        { name: 'consigneePartyName', type: 'string' },
        { name: 'portOfLoadingCode', type: 'string' },
        { name: 'portOfDischargeCode', type: 'string' },
        { name: 'departureDateEstimated', type: 'Date' },
        { name: 'arrivalDateEstimated', type: 'Date' },
      ],
    },
    'shipment'
  ),
})

export default [
  [
    prepareShipmentParams(), query
  ]
]
