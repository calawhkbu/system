import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { expandGroupEntity, LastCurrentUnit, calculateLastCurrent, extendDate, handleGroupByEntityValueDatePart, handleBottomSheetGroupByEntityValue } from 'utils/card'
import * as  rawMoment from 'moment'

export default {
  jqls: [
    {
      type: 'prepareParams',
      async prepareParams(params, prevResult, user): Promise<IQueryParams> {
        const { moment } = await this.preparePackages(user)

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
        ]

        const subqueries = (params.subqueries = params.subqueries || {})

        // used in mapCard to bottom sheet
        if (subqueries.location && subqueries.locationCode) {
          if (!(subqueries.location !== true && 'value' in subqueries.location)) throw new Error('MISSING_location')
          if (!(subqueries.locationCode !== true && 'value' in subqueries.locationCode)) throw new Error('MISSING_locationCode')
          const location = subqueries.location.value
          const locationCode = `${location}Code`
          const subqueriesName = `${location}Join`
          const locationCodeValue = subqueries.locationCode.value
          subqueries[locationCode] = { value: locationCodeValue }
          subqueries[subqueriesName] = true
        }

        // lastStatus case
        if (subqueries.lastStatus) {
          if (!(subqueries.lastStatus !== true && 'value' in subqueries.lastStatus && Array.isArray(subqueries.lastStatus.value))) throw new Error('MISSING_lastStatus')
          subqueries.lastStatusJoin = true
        }

        // alertType case
        if (subqueries.selectedAlertType) {
          if (!(subqueries.selectedAlertType !== true && 'value' in subqueries.selectedAlertType && Array.isArray(subqueries.selectedAlertType.value))) throw new Error('MISSING_alertType')
          //subqueries.alertJoin = true
          let alertCreatedAtJson: { from: any, to: any}
          if (subqueries.withinHours) {
            const withinHours = subqueries.withinHours as { value: any }
            alertCreatedAtJson = {
              from: moment().subtract(withinHours.value, 'hours'),
              to: moment()
            }
          }
          else {
            const date = subqueries.date as { from: any, to: any }
            const selectedDate = date ? moment(date.from, 'YYYY-MM-DD') : moment()
            const currentMonth = selectedDate.month()
            alertCreatedAtJson = {
              from: selectedDate.month(currentMonth).startOf('month').format('YYYY-MM-DD'),
              to: selectedDate.month(currentMonth).endOf('month').format('YYYY-MM-DD'),
            }
          }
          delete subqueries.date
          subqueries.alertCreatedAt = alertCreatedAtJson
        }

        // split primaryKeyListString and search by id
        if (subqueries.primaryKeyListString) {
          const countLimit = 10000
          const primaryKeyListString = subqueries.primaryKeyListString as { value: string, countString: string }
          const count = Number.parseInt(primaryKeyListString.countString, 10)

          // if too many, just query again
          if (count > countLimit) {
            delete subqueries.primaryKeyListString
          }
          else {
            const idList = primaryKeyListString.value.split(',')

            // reset params.subqueries, just id left
            params.subqueries = {
              id: { value: idList }
            }
          }
        }

        handleBottomSheetGroupByEntityValue(subqueries)
        handleGroupByEntityValueDatePart(subqueries,moment)

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

      let alertCreatedAtJson: { from: any, to: any}

      if (!subqueries.withinHours)
      {

        const selectedDate = (subqueries.date ? moment(subqueries.date.from, 'YYYY-MM-DD') : moment())
        const currentMonth = selectedDate.month()
        alertCreatedAtJson = {
          from: selectedDate.month(currentMonth).startOf('month').format('YYYY-MM-DD'),
          to: selectedDate.month(currentMonth).endOf('month').format('YYYY-MM-DD'),
        }
      }

      else
      {

        const withinHours = params.subqueries.withinHours
        alertCreatedAtJson = {
          from : moment().subtract(withinHours.value, 'hours'),
          to : moment()
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
