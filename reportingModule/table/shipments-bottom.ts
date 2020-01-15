import {
  FromTable,
  Query,
} from 'node-jql'
import { parseCode } from 'utils/function'

const lastStatusCodeMapString = JSON.stringify({

  // left side is called laststatus
  // right side is called lastStatusCode

  notInTrack: [null, 'NEW', 'CANF', 'ERR'],
  processing: ['BKCF', 'EPRL', 'STSP', 'BKD'],
  cargoReady: ['GITM', 'LOBD', 'RCS', 'MNF', 'MAN'],
  departure: ['DLPT', 'DEP'],
  inTransit: ['TSLB', 'TSDC', 'TAP', 'TDE'],
  arrival: ['BDAR', 'DSCH', 'DECL', 'PASS', 'TMPS', 'ARR', 'RWB', 'RCF', 'CUS', 'NFD'],
  delivered: ['STCS', 'RCVE', 'END', 'DLV']

})

function prepareShipmentParams(lastStatusCodeMapString_: string): Function {
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

    // console.log(subqueries)

    // if (!subqueries.primaryKeyListString && !subqueries.lastStatusListString) {
    //   throw new BadRequestException('MISSING_primaryKeyListString/workflowStatus')
    // }

    // if (subqueries.primaryKeyListString) {
    //   // get the primaryKeyList
    //   if (!subqueries.primaryKeyListString && subqueries.primaryKeyListString !== '')
    //     throw new BadRequestException('MISSING_primaryKeyListString')

    //   const primaryKeyList = subqueries.primaryKeyListString.value.split(',')

    //   subqueries.primaryKeyList = {
    //     value: primaryKeyList,
    //   }
    // }

    // lastStatusList case
    if (subqueries.lastStatusList) {
      if (!(subqueries.lastStatusList.value && subqueries.lastStatusList.value.length) )
        throw new BadRequestException('MISSING_lastStatusList')

      const lastStatusList = subqueries.lastStatusList.value
      const lastStatusCodeMap = JSON.parse(lastStatusCodeMapString_)

      // compose the subqueries of lastStatusCode
      let lastStatusCodeList = []

      subqueries['lastStatusCodeJoin'] = true

      lastStatusList.forEach(status => {
        lastStatusCodeList = lastStatusCodeList.concat(lastStatusCodeMap[status] || [])
      })

      if (lastStatusList.includes('notInTrack')) {
        subqueries.lastStatusCodeIncludeNull = { value: lastStatusCodeList }
      }

      else {
        subqueries.lastStatusCode = { value: lastStatusCodeList }
      }

    }

    console.log(`bottomparams`)
    console.log(params)

    return params
  }

  let code = fn.toString()
  code = code.replace(new RegExp('lastStatusCodeMapString_', 'g'), `'${lastStatusCodeMapString_}'`)
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
    prepareShipmentParams(lastStatusCodeMapString), query
  ]
]
