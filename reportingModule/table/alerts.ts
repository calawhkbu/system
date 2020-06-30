import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'


export const shipmentField = [
  'houseNo',
  'jobNo',
  'masterNo'
]

export const bookingField = [
  'bookingNo'
]

export default {
  jqls: [
    {
      type: 'prepareParams',
      prepareParams(params: IQueryParams) {
        
        // console.log(`hellot`)
        // console.log(params.fields)

        function getDynamicFieldList() {
          const entityType = ( params.subqueries.entityType as any).value
          switch (entityType) {
            case 'shipment':
              return shipmentField
  
            case 'booking':
              return bookingField
          
            default:
              return []

          }

        }

        params.fields = [
          ...getDynamicFieldList(),
          'alertTableName',
          'alertPrimaryKey',
          'alertCategory',
          'alertType',
          'alertTitle',
          'alertMessage',
          'alertContent',
          'alertSeverity',
          'alertStatus',
          'alertCreatedAt',
          'alertUpdatedAt'
        ]

        params.subqueries.alertIdIsNotNull = true
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
      resultMapping: [
        { from: 'alertTableName', to: 'tableName' },
        { from: 'alertPrimaryKey', to: 'primaryKey' },
        { from: 'alertSeverity', to: 'severity'},
        { from: 'alertStatus', to: 'status'},
      ]
    },
  ],
  columns: [
    { key: 'tableName' },
    { key: 'primaryKey' },
    { key: 'alertCategory' },
    { key: 'alertType' },
    { key: 'alertTitle' },
    { key: 'alertMessage' },
    { key: 'alertContent' },
    { key: 'severity'},
    { key: 'status'},
    { key: 'alertUpdatedAt' },
    { key: 'alertCreatedAt' },
    ...([ ...new Set([ ...shipmentField,...bookingField]) ]).map(x => ({ key : x }))

  ]
} as JqlDefinition

/* import { Query, FromTable } from 'node-jql'
import { parseCode } from 'utils/function'

function prepareParams(): Function {
  const fn = async function(require, session, params) {
    // import
    const { BadRequestException } = require('@nestjs/common')

    // script
    const subqueries = (params.subqueries = params.subqueries || {})

    subqueries.alertJoin = true

    params.fields = [
      'alertTableName',
      'alertPrimaryKey',
      'alertCategory',
      'alertType',
      'alertTitle',
      'alertMessage',
      'alertContent',
      'alertSeverity',
      'alertStatus',
      'alertCreatedAt',
      'alertUpdatedAt'
    ]

    return params
  }

  const code = fn.toString()
  return parseCode(code)
}

function finalQuery(){

  return function(require, session, params)
  {

    let url = `api/shipment/query/shipment`

    if (params)
    {
      const subqueries = (params.subqueries = params.subqueries || {})
      const entityType = subqueries.entityType.value

      switch (entityType) {
        case 'shipment':
          url = `api/shipment/query/shipment`
          break

        case 'booking':
          url = `api/booking/query/booking`
          break

        default:
          break
      }
    }

    return new Query({
      $from: new FromTable(
        {
          method: 'POST',
          url,
          columns: [
            { name: 'alertTableName', type: 'string', $as : 'tableName' },
            { name: 'alertPrimaryKey', type: 'string', $as : 'primaryKey' },
            { name: 'alertCategory', type: 'string' },
            { name: 'alertType', type: 'string' },
            { name: 'alertTitle', type: 'string' },
            { name: 'alertMessage', type: 'string' },
            { name: 'alertContent', type: 'object' },
            { name: 'alertSeverity', type: 'string' , $as: 'severity'},
            { name: 'alertStatus', type: 'string', $as: 'status'},
            { name : 'alertUpdatedAt' , type : 'string' },
            { name : 'alertCreatedAt' , type : 'string' }
          ],
        },
        'alert'
      ),
    })

  }

}

export default [

  [prepareParams(), finalQuery()]
] */
