import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { ERROR } from 'utils/error'

interface Result {
  entityType: string
  location: string
}

export default {
  jqls: [
    {
      type: 'prepareParams',
      defaultResult: {},
      async prepareParams(params, prevResult: Result): Promise<IQueryParams> {
        const subqueries = params.subqueries || {}

        if (!subqueries.entityType || !(subqueries.entityType !== true && 'value' in subqueries.entityType)) throw ERROR.MISSING_ENTITY_TYPE()

        const dataService = this.getDataService()
        const entityType: string = prevResult.entityType = subqueries.entityType.value
        const service = await dataService.getTableService(entityType.toLowerCase())
        const { fixedLocationList = [] } = await service.loadCustomFile()

        if (!subqueries.location || !(subqueries.location !== true && 'value' in subqueries.location)) throw ERROR.MISSING_LOCATION_TYPE()
        const location = prevResult.location = subqueries.location.value
        if (!fixedLocationList.find(x => x === location)) throw ERROR.UNSUPPORTED_LOCATION_TYPE()

        const locationCode = `${location}CountryCode`
        const locationName = `${location}CountryName`

        params.fields = [
          locationCode,
          locationName,
          `total${entityType}`
        ]

        subqueries[`${locationCode}IsNotNull`] = true

        params.groupBy = [
          locationCode,
          locationName,
        ]

        return params
      }
    },
    {
      type: 'callDataService',
      getDataServiceQuery: (params, { entityType }: Result): [string, string] {
        return [entityType.toLowerCase(), entityType.toLowerCase()]
      },
      onResult(res, params, { entityType, location }: Result): any[] {
        return res.map((answer) => ({
          entityType,
          location,
          countryCode: answer[`${location}CountryCode`],
          countryName: answer[`${location}CountryName`],
          count: answer[`total${entityType}`],
        }))
      }
    }
  ],
  filters: [
    {
      display: 'entityType',
      name: 'entityType',
      props: {
        items: [{
          label: 'Booking',
          value: 'Booking',
        }, {
          label: 'Shipment',
          value: 'Shipment',
        }],
        multi: false,
        required: true,
      },
      type: 'list',
    },
    {
      display: 'location',
      name: 'location',
      props: {
        items: [
          {
            label: 'portOfLoading',
            value: 'portOfLoading',
          },
          {
            label: 'portOfDischarge',
            value: 'portOfDischarge',
          },
          {
            label: 'placeOfDelivery',
            value: 'placeOfDelivery',
          },
          {
            label: 'placeOfReceipt',
            value: 'placeOfReceipt',
          },
          {
            label: 'finalDestination',
            value: 'finalDestination',
          }
        ],
        multi: false,
        required: true,
      },
      type: 'list',
    }
  ]
} as JqlDefinition
