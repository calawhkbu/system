import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { ERROR } from 'utils/error'

interface Result {
  location: string
}

export default {
  jqls: [
    {
      type: 'prepareParams',
      defaultResult: {},
      prepareParams(params, prevResult: Result): IQueryParams {
        const locationList = ['portOfLoading', 'portOfDischarge', 'placeOfDelivery', 'placeOfReceipt', 'finalDestination']
        const subqueries = params.subqueries || {}

        // show pol/pod
        if (!subqueries.location || !(subqueries.location !== true && 'value' in subqueries.location)) throw ERROR.MISSING_LOCATION_TYPE()
        const location = prevResult.location = subqueries.location.value
        if (!locationList.find(x => x === location)) throw ERROR.UNSUPPORTED_LOCATION_TYPE()

        const locationCode = `${location}CountryCode`
        const locationName = `${location}CountryName`

        params.fields = [
          locationCode,
          locationName,
          'totalShipment'
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
      dataServiceQuery: ['shipment', 'shipment'],
      onResult(res, params, { location }: Result): any[] {
        return res.map((answer) => ({
          location,
          countryCode: answer[`${location}CountryCode`],
          countryName: answer[`${location}CountryName`],
          count: answer[`totalShipment`],
        }))
      }
    }
  ],
  filters: [
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
    },
  ]
} as JqlDefinition
