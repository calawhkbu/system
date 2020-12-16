import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { ERROR } from 'utils/error'

export default {
  jqls: [
    {
      type: 'prepareParams',
      async prepareParams(params, prevResult, user): Promise<IQueryParams> {
        const { moment } = await this.preparePackages(user)

        params.fields = [
          'id',
          'bookingNo',
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
          if (!(subqueries.location !== true && 'value' in subqueries.location)) throw ERROR.MISSING_LOCATION_TYPE()
          if (!(subqueries.locationCode !== true && 'value' in subqueries.locationCode)) throw ERROR.MISSING_LOCATION_CODE()
          const location = subqueries.location.value
          const locationCode = `${location}Code`
          const subqueriesName = `${location}Join`
          const locationCodeValue = subqueries.locationCode.value
          subqueries[locationCode] = { value: locationCodeValue }
          subqueries[subqueriesName] = true
        }
        if (subqueries.location && subqueries.countryCode) {
          if (!(subqueries.location !== true && 'value' in subqueries.location)) throw ERROR.MISSING_LOCATION_TYPE()
          if (!(subqueries.countryCode !== true && 'value' in subqueries.countryCode)) throw ERROR.MISSING_LOCATION_CODE()
          const location = subqueries.location.value
          const locationCode = `${location}CountryCode`
          const countryCodeValue = subqueries.countryCode.value
          subqueries[locationCode] = { value: countryCodeValue }
        }

        // lastStatus case
        if (subqueries.lastStatus) {
          if (!(subqueries.lastStatus !== true && 'value' in subqueries.lastStatus && Array.isArray(subqueries.lastStatus.value))) throw ERROR.MISSING_LAST_STATUS()
          subqueries.lastStatusJoin = true
        }

        // alertType case
        if (subqueries.alertType) {
          if (!(subqueries.alertType !== true && 'value' in subqueries.alertType && Array.isArray(subqueries.alertType.value))) throw ERROR.MISSING_ALERT_TYPE()
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

        if (subqueries.primaryKeyListString) {
          const countLimit = 10000
          const primaryKeyListString = subqueries.primaryKeyListString as any
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

        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceType: 'count',
      dataServiceQuery: ['booking', 'booking']
    },
  ],
  columns: [
    { key: 'count' },
  ],
} as JqlDefinition
