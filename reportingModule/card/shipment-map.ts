import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'

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
        if (!subqueries.location || !(subqueries.location !== true && 'value' in subqueries.location)) throw new Error('MISSING_location')
        const location = prevResult.location = subqueries.location.value
        if (!locationList.find(x => x === location)) throw new Error(`INVALID_location_${String(subqueries.location.value).toLocaleUpperCase()}`)

        const locationCode = `${location}Code`
        const locationLatitude = `${location}Latitude`
        const locationLongitude = `${location}Longitude`

        // portOfLoadingLocationJoin / portODischargeLocationJoin
        subqueries[`${location}Join`] = true

        params.fields = [
          locationCode,
          locationLatitude,
          locationLongitude
        ]

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

/* import {
  BinaryExpression,
  ColumnExpression,
  FromTable,
  IsNullExpression,
  JoinClause,
  Query,
  ResultColumn,
  Value,
} from 'node-jql'
import { Session } from 'node-jql-core'

function prepareParams() {

  return function(require, session, params) {
    // import
    const { BadRequestException } = require('@nestjs/common')

    const locationList = ['portOfLoading', 'portOfDischarge', 'placeOfDelivery', 'placeOfReceipt', 'finalDestination']
    // script
    const subqueries = params.subqueries || {}
    // show pol/pod
    if (!(subqueries.location && subqueries.location.value)) throw new Error('MISSING_location')

    if (!locationList.find(x => x === subqueries.location.value))
      throw new Error(
        `INVALID_location_${String(subqueries.location.value).toLocaleUpperCase()}`
      )

    const location = subqueries.location.value
    const locationCode = `${location}Code`
    const locationLatitude = `${location}Latitude`
    const locationLongitude = `${location}Longitude`

    // portOfLoadingLocationJoin / portODischargeLocationJoin
    subqueries[`${location}Join`] = true

    params.fields = [
      locationCode,
      locationLatitude,
      locationLongitude
    ]

    return params
  }

}

function finalQuery() {
  return function(require, session, params) {

    // script
    const subqueries = params.subqueries || {}
    const location = subqueries.location.value
    const locationCode = `${location}Code`
    const locationLatitude = `${location}Latitude`
    const locationLongitude = `${location}Longitude`

    const columns = [

      { name: locationCode, type: 'string'},
      { name: locationLatitude, type: 'number', $as : 'latitude' },
      { name: locationLongitude, type: 'number', $as : 'longitude' }
    ] as any

    return new Query({
      $select : [

        new ResultColumn(new ColumnExpression('location', 'latitude')),
        new ResultColumn(new ColumnExpression('location', 'longitude')),
        new ResultColumn(new ColumnExpression('location', locationCode), 'locationCode'),
        new ResultColumn(new Value(location), 'location')

      ],

      $from: new FromTable(
        {
          method: 'POST',
          url: 'api/shipment/query/shipment',
          columns
        }, 'location'
      )
    })
  }
}

export const filters = [
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

export default [

  [prepareParams(), finalQuery()]
]

// export default [
//   [prepareParams(),
//     function(require, session, params) {
//       // import
//       const {
//         ColumnExpression,
//         CreateTableJQL,
//         FromTable,
//         FunctionExpression,
//         Query,
//         ResultColumn,
//       } = require('node-jql')

//       // script
//       const subqueries = params.subqueries || {}
//       const portColumn = subqueries.type.value
//       return new CreateTableJQL({
//         $temporary: true,
//         name: 'shipment',
//         $as: new Query({
//           $select: [
//             new ResultColumn('port'),
//             new ResultColumn(new FunctionExpression('COUNT', new ColumnExpression('id')), 'count'),
//           ],
//           $from: new FromTable(
//             {
//               url: 'api/shipment/query/shipment',
//               columns: [
//                 { name: 'id', type: 'number' },
//                 { name: portColumn, type: 'string', $as: 'port' },
//               ],
//             },
//             'shipment'
//           ),
//           $group: 'port',
//         }),
//       })
//     },
//   ],
//   [
//     async function(require, session: Session, params) {
//       // import
//       const { Query } = require('node-jql')
//       const { Resultset } = require('node-jql-core')

//       // script
//       const result = await session.query(
//         new Query({ $distinct: true, $select: 'port', $from: 'shipment' })
//       )
//       const ports = new Resultset(result).toArray().map(({ port }) => port)
//       const subqueries = (params.subqueries = params.subqueries || {})
//       subqueries.ports = { value: ports }
//       return params
//     },
//     new Query({
//       $select: [
//         new ResultColumn(new ColumnExpression('shipment', 'count')),
//         new ResultColumn(new ColumnExpression('shipment', 'port')),
//         new ResultColumn(new ColumnExpression('location', 'latitude')),
//         new ResultColumn(new ColumnExpression('location', 'longitude')),
//       ],
//       $from: new FromTable(
//         {
//           method: 'POST',
//           url: 'api/location/query/location',
//           columns: [
//             { name: 'portCode', type: 'string' },
//             { name: 'latitude', type: 'number' },
//             { name: 'longitude', type: 'number' },
//           ],
//         },
//         'location',
//         new JoinClause(
//           'LEFT',
//           'shipment',
//           new BinaryExpression(
//             new ColumnExpression('location', 'portCode'),
//             '=',
//             new ColumnExpression('shipment', 'port')
//           )
//         )
//       ),
//       $where: [
//         new IsNullExpression(new ColumnExpression('location', 'latitude'), true),
//         new IsNullExpression(new ColumnExpression('location', 'longitude'), true),
//       ],
//     }),
//   ],
// ] */
