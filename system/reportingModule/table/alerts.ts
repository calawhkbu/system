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
        
        // console.debug(`hellot`)
        // console.debug(params.fields)

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
        delete params.subqueries.date
        // params.fields = [
        //   ...getDynamicFieldList(),
        //   'checkbox',
        //   'alertId',
        //   'alertTableName',
        //   'alertPrimaryKey',
        //   'alertCategory',
        //   'alertType',
        //   'alertTitle',
        //   'alertMessage',
        //   'alertContent',
        //   'alertSeverity',
        //   'alertStatus',
        //   'alertCreatedAt',
        //   'alertUpdatedAt'

        // ];
        params.fields = ['alertType', 'alertCategory', 'tableName', 'primaryKeyListString', 'count']

        params.groupBy = ['alertType', 'alertCategory', 'tableName']


        params.subqueries.alertStatus = { value: ['open'] }
        params.subqueries.alertCategory = { value: ['Exception', 'Notification'] }

        //params.subqueries.alertIdIsNotNull = true
    
        console.debug({params})
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
    },
  ],
  columns: [
    { key: 'alertType' },
    { key: 'count'},

   
   // ...([ ...new Set([ ...shipmentField,...bookingField]) ]).map(x => ({ key : x }))

  ]
} as JqlDefinition

