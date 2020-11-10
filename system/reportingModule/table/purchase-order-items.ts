import { JqlDefinition, Field } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { stringify } from 'querystring'

const displayCols = [
  'id', 
  'poNo' ,
  'itemKey',
  'skuName',
  'skuCode',
  'definition',
  'quantity',
  'bookedQuantity',
  'quantityUnit',
  'updatedAt',
  'flexData'
]

// cols for getting data only but not for display
const tempCols = [
  'htsCode'
]

const fixedDefinitionField = [
  'htsCode'
]

const reportColDefinition = displayCols.map((item) => { 
  if (typeof item === 'object') {
    return item
  } 
  return { key: item }
})

export default {
  jqls: [
    {
      type: 'prepareParams',
      async prepareParams(params, prevResult, user): Promise<IQueryParams> {
        console.debug(params, 'poItems')
        params.tables = [
          'purchase_order',
          'product_category'
        ]

        params.fields = [
          ... displayCols,
          ... tempCols
        ]

        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['purchase_order_item', 'purchase_order_item'],
      onResult(result, params, prevResult: any): any[] {
        console.debug(result, 'poItems')
        console.debug(prevResult, 'poItems')
        return result.map((item) => {
          if(item.flexData && item.definition){
            const flexDefKeys = Object.keys(item.flexData)
            const fixedDefinition = fixedDefinitionField.reduce((returnItems, field) => {
              if(item.hasOwnProperty(field)) {
                returnItems.flexData[field] = item[field]
                returnItems.display += field + ': ' + item[field] + "\n"
              }
              return returnItems
            }, {
              display: '', 
              flexData: {}
            })

            const filteredDefinition = item.definition.reduce((returnItems, fieldDef) => {
              if(flexDefKeys.find((key) => fieldDef.fieldName === key && fieldDef.toBooking === true)){
                returnItems.flexData[fieldDef.fieldName] = item.flexData[fieldDef.fieldName]
                returnItems.display += fieldDef.fieldName + ': ' + item.flexData[fieldDef.fieldName] + "\n"
              }

              return returnItems
            }, fixedDefinition)
            
            item.flexData = filteredDefinition.flexData
            item.definition = filteredDefinition.display
          }

          return item
        })
      }
    }
  ],
  columns: [
    { 
      key: 'Pick',
      i18nContext: 'BookingPage',
      label: 'choosePoItems'
    },
    ...reportColDefinition,
  ]
} as JqlDefinition