import {
  FromTable,
  Query,
} from 'node-jql'
import { parseCode } from 'utils/function'
import moment = require('moment')

function prepareShipmentParams(): Function {
  return function(require, session, params) {
    // script
    const subqueries = (params.subqueries = params.subqueries || {})

    params.fields = [
      'id',
      'houseNo',
      'masterNo',
      'jobDate',
      'carrierCode',
      'shipperPartyName',
      'consigneePartyName',
      'portOfLoadingCode',
      'portOfDischargeCode',
      'departureDateEstimated',
      'arrivalDateEstimated',
      'haveCurrentTrackingNo'
    ]

    // used in mapCard to bottom sheet
    if (subqueries.location || subqueries.locationCode) {
      if (!(subqueries.location && subqueries.location.value))
        throw new Error('MISSING_location')

      if (!(subqueries.locationCode && subqueries.locationCode.value))
        throw new Error('MISSING_locationCode')

      const location = subqueries.location.value
      const locationCode = `${location}Code`

      const subqueriesName = `${location}Join`
      const locationCodeValue = subqueries.locationCode.value

      // portOfLoadingCode = 'ABC'
      subqueries[locationCode] = {
        value: locationCodeValue
      }

      subqueries[subqueriesName] = true

    }

    // lastStatus case
    if (subqueries.lastStatus) {
      if (!(subqueries.lastStatus.value && subqueries.lastStatus.value.length))
        throw new Error('MISSING_lastStatus')

      subqueries.lastStatusJoin = true
    }

    // alertType case
    if (subqueries.alertType) {

      if (!(subqueries.alertType.value && subqueries.alertType.value.length))
        throw new Error('MISSING_alertType')

      subqueries.alertJoin = true

      let alertCreatedAtJson: { from: any, to: any }

      if (!subqueries.withinHours) {
        const selectedDate = (subqueries.date ? moment(subqueries.date.from, 'YYYY-MM-DD') : moment())
        const currentMonth = selectedDate.month()
        alertCreatedAtJson = {
          from: selectedDate.month(currentMonth).startOf('month').format('YYYY-MM-DD'),
          to: selectedDate.month(currentMonth).endOf('month').format('YYYY-MM-DD'),
        }
      }

      else {

        const withinHours = params.subqueries.withinHours
        alertCreatedAtJson = {
          from: moment().subtract(withinHours.value, 'hours'),
          to: moment()
        }

      }

      subqueries.date = undefined
      subqueries.alertCreatedAt = alertCreatedAtJson

    }

    if (subqueries.primaryKeyListString) {

      const countLimit = 100000
      const count = Number.parseInt((subqueries.primaryKeyListString.countString as string), 10)

      // if too many, just query again
      if (count > countLimit)
      {
        subqueries.primaryKeyListString = undefined
      }

      else {
        const primaryKeyListString = subqueries.primaryKeyListString.value as string
        const idList = primaryKeyListString.split(',')

        // reset params.subqueries, just id left
        params.subqueries = {
          id : {
            value: idList
          }
        }

      }
    }

    return params
  }

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
        { name: 'carrierCode', type: 'string' },
        { name: 'shipperPartyName', type: 'string' },
        { name: 'consigneePartyName', type: 'string' },
        { name: 'portOfLoadingCode', type: 'string' },
        { name: 'portOfDischargeCode', type: 'string' },
        { name: 'departureDateEstimated', type: 'Date' },
        { name: 'arrivalDateEstimated', type: 'Date' },
        { name: 'haveCurrentTrackingNo', type: 'Date' },
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
