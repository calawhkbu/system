
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
          'poNo',
          'moduleTypeCode',
          'incoTermsCode',
          'freightTermsCode',
          'portOfLoadingCode',
          'portOfDischargeCode',
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
        if (subqueries.groupByEntity) {
          subqueries[`${subqueries.groupByEntity.value}IsNotNull`]  = {
            value: true
          }
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
      dataServiceQuery: ['purchase_order', 'purchase_order']
    }
  ],

  // if want to show specific fields, please defined using FE_fields in bottom sheet filters
  columns: [
    { key: 'id' },
    { key: 'poNo' },
    { key: 'createdAt' },
    { key: 'updatedAt' },
    { key: 'incoTermsCode' },
    { key: 'FreightTermsCode' },
    { key: 'moduleTypeCode' },
    { key: 'portOfLoading' },
    { key: 'portOfDischarge' },
  ]
} as JqlDefinition




