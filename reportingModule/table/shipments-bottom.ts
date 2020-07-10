import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { expandSummaryVariable, expandGroupEntity, extendDate, LastCurrentUnit, calculateLastCurrent } from 'utils/card'
import * as  rawMoment from 'moment'

export default {
  jqls: [
    {
      type: 'prepareParams',
      async prepareParams(params, prevResult, user): Promise<IQueryParams> {
        const { moment } = await this.preparePackages(user)


        const defaultFields = [
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
          'haveCurrentTrackingNo',
        ]

        params.fields = defaultFields
        
        const subqueries = (params.subqueries = params.subqueries || {})

        // used in mapCard to bottom sheet
        if (subqueries.location && subqueries.locationCode) {
          if (!(subqueries.location !== true && 'value' in subqueries.location)) throw new Error('MISSING_location')
          if (!(subqueries.locationCode !== true && 'value' in subqueries.locationCode)) throw new Error('MISSING_locationCode')

          const location = subqueries.location.value
          const locationCode = `${location}Code`

          const locationCodeValue = subqueries.locationCode.value
          subqueries[locationCode] = { value: locationCodeValue }
        }

        // lastStatus case
        if (subqueries.lastStatus) {
          if (!(subqueries.lastStatus !== true && 'value' in subqueries.lastStatus && Array.isArray(subqueries.lastStatus.value))) throw new Error('MISSING_lastStatus')
          // subqueries.lastStatusJoin = true
        }

        // alertType case
        if (subqueries.alertType) {
          if (!(subqueries.alertType !== true && 'value' in subqueries.alertType && Array.isArray(subqueries.alertType.value))) throw new Error('MISSING_alertType')
          subqueries.alertJoin = true
          let alertCreatedAtJson: { from: any, to: any}
          if (subqueries.withinHours) {
            const withinHours = subqueries.withinHours as { value: any }
            alertCreatedAtJson = {
              from: moment().subtract(withinHours.value, 'hours'),
              to: moment()
            }
          }
          else {
            // default use currentMonth
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


        if (subqueries.groupByEntityValue) {

          const { value: groupByEntityValue  } = subqueries.groupByEntityValue as { value: string }
          const { codeColumnName } = expandGroupEntity(subqueries)

          subqueries[codeColumnName] = {
            value : groupByEntityValue
          }
        }

        // case when clicked from an intermediate bottom sheet
        if (subqueries.bottomSheetGroupByEntityValue)
        {

          const { value: bottomSheetGroupByEntityValue  } = subqueries.bottomSheetGroupByEntityValue as { value: string }
          const { codeColumnName: bottomSheetCodeColumnName } = expandGroupEntity(subqueries,'bottomSheetGroupByEntity')

          subqueries[bottomSheetCodeColumnName] = {
            value : bottomSheetGroupByEntityValue
          }

        }

        // guess time range base of month, lastCurrentUnit, lastOrCurrent

        // need to use these 3 value to re-calculate the date
        const month = (subqueries.month || {} as any).value // warning this could be total

        const lastCurrentUnit = (subqueries.lastCurrentUnit || {} as any).value  as LastCurrentUnit
        const lastOrCurrent = (subqueries.lastOrCurrent || {} as any).value as 'last' | 'current'


        // used for showing last Or Current
        if (lastCurrentUnit || lastOrCurrent)
        {

          let finalFrom: string, finalTo: string

          if (!lastCurrentUnit)
          {
            throw new Error(`missing lastCurrentUnit`)
          }

          if (!lastOrCurrent)
          {
            throw new Error(`missing lastOrCurrent`)
          }

          const { lastFrom, lastTo, currentFrom, currentTo } = calculateLastCurrent(subqueries,moment)

          if (lastOrCurrent === 'last')
          {
            finalFrom = lastFrom
            finalTo = lastTo
          }
          else 
          {
            finalFrom = currentFrom
            finalTo = currentTo

          }

          subqueries.date = {
            from : finalFrom,
            to: finalTo
          }


                  // used for showing specific month
          if (month) {

            const { from, to } = subqueries.date as { from, to }

            // only handle single month case, cases like "total" will not handle
            if (rawMoment.months().includes(month)){

              const newFrom = moment(from).month(month).startOf('month').format('YYYY-MM-DD')
              const newTo = moment(from).month(month).endOf('month').format('YYYY-MM-DD')

              subqueries.date = {
                from : newFrom,
                to: newTo
              }

            }

          }

        }

        // used for showing specific month
        else if (month) {

          extendDate(subqueries,moment,'year')

          const { from, to } = subqueries.date as { from, to }

          // only handle single month case, cases like "total" will not handle
          if (rawMoment.months().includes(month)){

            const newFrom = moment(from).month(month).startOf('month').format('YYYY-MM-DD')
            const newTo = moment(from).month(month).endOf('month').format('YYYY-MM-DD')

            subqueries.date = {
              from : newFrom,
              to: newTo
            }

          }

        }


        // console.log(`finalParams`)
        // console.log(params)
        // throw new Error(JSON.stringify(params))

        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['shipment', 'shipment']
    }
  ],

  // if want to show specific fields, please defined using FE_fields in bottom sheet filters
  columns: [
    { key: 'id' },
    { key: 'houseNo' },
    { key: 'masterNo' },
    { key: 'jobDate' },
    { key: 'carrierCode' },
    { key: 'shipperPartyName' },
    { key: 'consigneePartyName' },
    { key: 'portOfLoadingCode' },
    { key: 'portOfDischargeCode' },
    { key: 'departureDateEstimated' },
    { key: 'arrivalDateEstimated' },
    { key: 'haveCurrentTrackingNo' },
  ]
} as JqlDefinition

/* import {
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

      const locationCodeValue = subqueries.locationCode.value

      // portOfLoadingCode = 'ABC'
      subqueries[locationCode] = {
        value: locationCodeValue
      }
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
] */
