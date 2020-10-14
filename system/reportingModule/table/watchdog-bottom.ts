
import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { expandSummaryVariable, expandGroupEntity, extendDate, LastCurrentUnit, calculateLastCurrent, handleGroupByEntityValueDatePart, handleBottomSheetGroupByEntityValue } from 'utils/card'
import * as  rawMoment from 'moment'

export default {
  jqls: [
    {
      type: 'prepareParams',
      async prepareParams(params, prevResult, user): Promise<IQueryParams> {
        console.log({params});
        console.log('Parent pass to child watchdog bottom params..........')
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


     






         // console.debug(`finalParams`)
         // console.debug(params)
         // console.debug(subqueries)
        // throw new Error(JSON.stringify(params))

        handleBottomSheetGroupByEntityValue(subqueries)

        handleGroupByEntityValueDatePart(subqueries,moment)

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
    { key: 'bookingNo' },
    { key: 'masterNo' },
    { key: 'jobDate' },
 
  ]
} as JqlDefinition




