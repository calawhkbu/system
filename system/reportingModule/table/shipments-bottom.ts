import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { handleGroupByEntityValueDatePart, handleBottomSheetGroupByEntityValue } from 'utils/card'
import { ERROR } from 'utils/error'

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
          if (!(subqueries.location !== true && 'value' in subqueries.location)) throw ERROR.MISSING_LOCATION_TYPE()
          if (!(subqueries.locationCode !== true && 'value' in subqueries.locationCode)) throw ERROR.MISSING_LOCATION_CODE()

          const location = subqueries.location.value
          const locationCode = `${location}Code`

          const locationCodeValue = subqueries.locationCode.value
          subqueries[locationCode] = { value: locationCodeValue }
        }

        // lastStatus case
        if (subqueries.lastStatus) {
          if (!(subqueries.lastStatus !== true && 'value' in subqueries.lastStatus && Array.isArray(subqueries.lastStatus.value))) throw ERROR.MISSING_LAST_STATUS()
          // subqueries.lastStatusJoin = true
        }

        // alertType case
        if (subqueries.selectedAlertType) {
          const { alertConfigList = [] } = await this.getDataService().crudEntity(
            'alert',
            { type: 'getCompleteAlertConfig', options: [user.selectedPartyGroup.code] },
            user
          )
          const alertType = alertConfigList.find(({ alertType }) => alertType === subqueries.selectedAlertType.value)
          if (!alertType) throw ERROR.UNSUPPORTED_ALERT_TYPE()
          params.subqueries = {
            ...(subqueries || {}),
            ...(alertType.query.subqueries || {})
          }
          delete params.subqueries.alertType
        }
        // if (subqueries.alertType) {
        //   if (!(subqueries.alertType !== true && 'value' in subqueries.alertType && Array.isArray(subqueries.alertType.value))) throw new Error('MISSING_alertType')
        //   subqueries.alertJoin = true
        //   let alertCreatedAtJson: { from: any, to: any}
        //   if (subqueries.withinHours) {
        //     const withinHours = subqueries.withinHours as { value: any }
        //     alertCreatedAtJson = {
        //       from: moment().subtract(withinHours.value, 'hours'),
        //       to: moment()
        //     }
        //   }
        //   else {
        //     // default use currentMonth
        //     const date = subqueries.date as { from: any, to: any }
        //     const selectedDate = date ? moment(date.from, 'YYYY-MM-DD') : moment()
        //     const currentMonth = selectedDate.month()
        //     alertCreatedAtJson = {
        //       from: selectedDate.month(currentMonth).startOf('month').format('YYYY-MM-DD'),
        //       to: selectedDate.month(currentMonth).endOf('month').format('YYYY-MM-DD'),
        //     }
        //   }
        //   delete subqueries.date
        //   subqueries.alertCreatedAt = alertCreatedAtJson
        // }

        // split primaryKeyListString and search by id
        if (subqueries.primaryKeyListString) {
          const countLimit = 10000
          const primaryKeyListString = subqueries.primaryKeyListString as { value: string, countString: string }
          const count = Number.parseInt(primaryKeyListString.countString, 10)

          // if too many, just query again
          if (count <= countLimit) {
            const idList = primaryKeyListString.value.split(',').map(n => Number(n))

            // reset params.subqueries, just id left
            params.subqueries = {
              ...params.subqueries,
              id: { value: idList }
            }
            if (params.subqueries.dateStatus) {
              delete params.subqueries.dateStatus
            }
          }
          delete params.subqueries.primaryKeyListString
        }

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
