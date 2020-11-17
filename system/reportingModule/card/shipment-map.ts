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

        const locationCode = `${location}Code`
        const locationLatitude = `${location}Latitude`
        const locationLongitude = `${location}Longitude`

        params.fields = [
          locationCode,
          locationLatitude,
          locationLongitude
        ]

        subqueries[`${locationLatitude}IsNotNull`] = true
        subqueries[`${locationLongitude}IsNotNull`] = true

        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['shipment', 'shipment'],
      onResult(res, params, { location }: Result): any[] {
        const locationCode = `${location}Code`
        const locationLatitude = `${location}Latitude`
        const locationLongitude = `${location}Longitude`

        return res.map(row => {
          return {
            location,
            locationCode: row[locationCode],
            latitude: row[locationLatitude],
            longitude: row[locationLongitude]
          }
        })
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
    }
  ]
} as JqlDefinition
