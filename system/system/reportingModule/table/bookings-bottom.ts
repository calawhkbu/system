
import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { expandSummaryVariable, expandGroupEntity, extendDate, LastCurrentUnit, calculateLastCurrent, handleGroupByEntityValueDatePart, handleBottomSheetGroupByEntityValue } from 'utils/card'
import * as  rawMoment from 'moment'

export default {
  jqls: [
    {
      type: 'prepareParams',
      async prepareParams(params, prevResult, user): Promise<IQueryParams> {
        const { moment } = await this.preparePackages(user)


        const defaultFields = [
          'id',
          'bookingNo',
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


        //check Fields not NUll

          subqueries[`${subqueries.groupByEntity.value}IsNotNull`]  = {
            value: true
          }





         // console.log(`finalParams`)
         // console.log(params)
         // console.log(subqueries)
        // throw new Error(JSON.stringify(params))

        handleBottomSheetGroupByEntityValue(subqueries)

        handleGroupByEntityValueDatePart(subqueries,moment)

        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['booking', 'booking']
    }
  ],

  // if want to show specific fields, please defined using FE_fields in bottom sheet filters
  columns: [
    { key: 'id' },
    { key: 'bookingNo' },
    { key: 'masterNo' },
    { key: 'jobDate' },
    { key: 'carrierCode' },
    { key: 'shipperPartyName' },
    { key: 'consigneePartyName' },
    { key: 'portOfLoadingCode' },
    { key: 'portOfDischargeCode' },
    { key: 'departureDateEstimated' },
    { key: 'arrivalDateEstimated' },
  ]
} as JqlDefinition




// import { JqlDefinition } from 'modules/report/interface'
// import { IQueryParams } from 'classes/query'

// export default {
//   jqls: [
//     {
//       type: 'prepareParams',
//       async prepareParams(params, prevResult, user): Promise<IQueryParams> {
//         const { moment } = await this.preparePackages(user)
//         console.log("PREPARE-PARAMS")
//         console.log(params)

//         params.fields = [
//           'id',
//           'bookingNo',
//            'masterNo',
//            'jobDate',
//            'carrierCode',
//            'carrierName',
//           'shipperPartyName',
//           'consigneePartyName',
//           'portOfLoadingCode',
//           'portOfDischargeCode',
//           'departureDateEstimated',
//           'arrivalDateEstimated',
//         ]

//         const subqueries = (params.subqueries = params.subqueries || {})

//         // used in mapCard to bottom sheet
//         if (subqueries.location && subqueries.locationCode) {
//           if (!(subqueries.location !== true && 'value' in subqueries.location)) throw new Error('MISSING_location')
//           if (!(subqueries.locationCode !== true && 'value' in subqueries.locationCode)) throw new Error('MISSING_locationCode')
//           const location = subqueries.location.value
//           const locationCode = `${location}Code`
//           const subqueriesName = `${location}Join`
//           const locationCodeValue = subqueries.locationCode.value
//           subqueries[locationCode] = { value: locationCodeValue }
//           subqueries[subqueriesName] = true
//         }

//         // lastStatus case
//         if (subqueries.lastStatus) {
//           if (!(subqueries.lastStatus !== true && 'value' in subqueries.lastStatus && Array.isArray(subqueries.lastStatus.value))) throw new Error('MISSING_lastStatus')
//           subqueries.lastStatusJoin = true
//         }

//         // alertType case
//         if (subqueries.alertType) {
//           if (!(subqueries.alertType !== true && 'value' in subqueries.alertType && Array.isArray(subqueries.alertType.value))) throw new Error('MISSING_alertType')
//           subqueries.alertJoin = true
//           let alertCreatedAtJson: { from: any, to: any}
//           if (subqueries.withinHours) {
//             const withinHours = subqueries.withinHours as { value: any }
//             alertCreatedAtJson = {
//               from: moment().subtract(withinHours.value, 'hours'),
//               to: moment()
//             }
//           }
//           else {
//             const date = subqueries.date as { from: any, to: any }
//             const selectedDate = date ? moment(date.from, 'YYYY-MM-DD') : moment()
//             const currentMonth = selectedDate.month()
//             alertCreatedAtJson = {
//               from: selectedDate.month(currentMonth).startOf('month').format('YYYY-MM-DD'),
//               to: selectedDate.month(currentMonth).endOf('month').format('YYYY-MM-DD'),
//             }
//           }
//           delete subqueries.date
//           subqueries.alertCreatedAt = alertCreatedAtJson
//         }

//         if (subqueries.primaryKeyListString) {
//           const countLimit = 100
//           const primaryKeyListString = subqueries.primaryKeyListString as any
//           const count = Number.parseInt(primaryKeyListString.countString, 10)

//           // if too many, just query again
//           if (count > countLimit) {
//             subqueries.primaryKeyListString = undefined
//           }
//           else {
//             const idList = primaryKeyListString.value.split(',')

//             // reset params.subqueries, just id left
//             params.subqueries = {
//               id: { value: idList }
//             }
//           }
//         }
//         console.log("PARAMS")
//         console.log(params);
//         return params
//       }
//     },
//     {
//       type: 'callDataService',
//       dataServiceQuery: ['booking', 'booking']
//     }
//   ],
//   columns: [
//     { key: 'id' },
//     { key: 'masterNo' },
//     { key: 'jobDate' },
//     { key: 'carrierCode' },
//     { key: 'carrierName' },
//     { key: 'moduleTypeCode' },
//     { key: 'bookingNo' },
//     { key: 'shipperPartyName' },
//     { key: 'consigneePartyName' },
//     { key: 'portOfLoadingCode' },
//     { key: 'portOfDischargeCode' },
//     { key: 'departureDateEstimated' },
//     { key: 'arrivalDateEstimated' },

//   ],
//   filters: [
//     {
//       display: 'summaryVariables',
//       name: 'summaryVariables',
//       props: {
//         items: [
//           {
//               label: 'Total Booking',
//               value: 'totalBooking',
//             },
//           {
//             label: 'Chargeable Weight',
//             value: 'chargeableWeight',
//           },
//           {
//             label: 'Gross Weight',
//             value: 'grossWeight',
//           },
//           {
//             label: 'Volume Weight',
//             value: 'volumeWeight',
//           },


//           {
//             label: 'teu',
//             value: 'teu',
//           },
//           {
//             label: 'cbm',
//             value: 'cbm',
//           },

//           {
//             label: 'quantity',
//             value: 'quantity',
//           },

//         ],
//         multi: false,
//         required: true,
//       },
//       type: 'list',
//     },

//   ],

// } as JqlDefinition
