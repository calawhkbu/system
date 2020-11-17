import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { ERROR } from 'utils/error'

const shipmentBottomSheetId = 'cb22011b-728d-489b-a64b-b881914be600'
const bookingBottomSheetId = 'bde2d806-d2bb-490c-b3e3-9e4792f353dd'

export default {
  jqls: [
    {
      type: 'prepareParams',
      async prepareParams(params, prevResult, user): Promise<IQueryParams> {
        const { moment } = await this.preparePackages(user)
        const subqueries = params.subqueries || {}

        if (!subqueries.entityType || !(subqueries.entityType !== true && 'value' in subqueries.entityType)) throw ERROR.MISSING_ENTITY_TYPE()
        if (['shipment', 'booking', 'purchase-order'].indexOf(subqueries.entityType.value) === -1) {
          throw ERROR.UNSUPPORTED_ENTITY_TYPE()
        }

        if (!subqueries.dateStatus || !(subqueries.dateStatus !== true && 'value' in subqueries.dateStatus)) throw ERROR.MISSING_DATE_STATUS()

        subqueries.dateStatus = {
          today : moment().format('YYYY-MM-DD'),
          currentTime : moment().format('YYYY-MM-DD HH:mm:ss'),
          ...subqueries.dateStatus
        } as any
        subqueries.dateStatusJoin = true

        params.groupBy = ['dateStatus']
        params.fields = ['primaryKeyListString', 'dateStatus', 'count']

        return params
      }
    },
    {
      type: 'callDataService',
      getDataServiceQuery(params): [string, string] {
        let entityType = 'shipment'
        const subqueries = (params.subqueries = params.subqueries || {})
        if (subqueries.entityType && subqueries.entityType !== true && 'value' in subqueries.entityType) {
          entityType = subqueries.entityType.value
        }
        return [entityType, entityType]
      },
      onResult(res, params): any[] {
        let bottomSheetId = shipmentBottomSheetId
        const subqueries = (params.subqueries = params.subqueries || {})
        if (subqueries.entityType && subqueries.entityType !== true && 'value' in subqueries.entityType) {
          if (subqueries.entityType.value === 'booking') bottomSheetId = bookingBottomSheetId
        }
        let dateStatus: string[] = []
        if (subqueries.dateStatus && subqueries.dateStatus !== true && 'value' in subqueries.dateStatus) {
          dateStatus = subqueries.dateStatus.value
        }
        return [dateStatus.reduce<any>((r, status) => {
          const found = res.find(row => row.dateStatus === status)
          if (found) r[`${status}_primaryKeyListString`] = found.primaryKeyListString
          r[`${status}_count`] = res.reduce((r, row) => r + (row.dateStatus === status ? row.count : 0), 0)
          return r
        }, { bottomSheetId })]
      }
    }
  ],
  filters: [
    {
      display: 'entityType',
      name: 'entityType',
      props: {
        items: [
          {
            label: 'booking',
            value: 'booking',
          },
          {
            label: 'shipment',
            value: 'shipment',
          }
        ],
        required: true,
      },
      type: 'list',
    }
  ]
} as JqlDefinition
