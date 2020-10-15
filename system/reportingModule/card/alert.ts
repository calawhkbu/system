import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { alertConfigList } from '../../alertModule/config'
import _ = require('lodash')
import { findSourceMap } from 'module'

const shipmentBottomSheetId = 'cb22011b-728d-489b-a64b-b881914be600'
const bookingBottomSheetId = 'bde2d806-d2bb-490c-b3e3-9e4792f353dd'
var Alert=alertConfigList;
var originParams={};


// var template = {};
// temaplte: [

//   {
//     type: 'prepareParams',
//     async prepareParams(params, prevResult, user): Promise<IQueryParams> {
//       const { moment } = await this.preparePackages(user)

//       var subqueries = params.subqueries || {}


//       if (!subqueries.entityType || !(subqueries.entityType !== true && 'value' in subqueries.entityType)) throw new Error('MISSING_ENTITY_TYPE')
//       if (['shipment', 'booking', 'purchase-order'].indexOf(subqueries.entityType.value) === -1) {
//         throw new Error(`INVALID_ENTITY_TYPE_${String(subqueries.entityType.value).toLocaleUpperCase()}`)
//       }

//       if (!subqueries.alertCreatedAt || !subqueries.alertCreatedAt.from) {
//         throw new Error(`MISSING_alertCreatedAt`)
//       }


//       var find = Alert.filter(o => o.tableName == subqueries.entityType.value);

//       subqueries.alertStatus = { value: ['open'] }

//       _.merge(params, find[0].query);
//       delete params.subqueries.alertCreatedAt;
//       subqueries.alertCategory = { value: find[0].alertCategory }
//       params.subqueries.alertTypeIsNotNull = {
//         value: true

//       }

//       params.fields = ['alertType', 'alertCategory', 'tableName', 'primaryKeyListString', 'count']
//       params.groupBy = ['alertType', 'alertCategory', 'tableName']
//       params.limit = 10;
//       console.log(find[0].alertType)
//       return params
//     },
//   },
//   {
//     type: 'callDataService',
//     getDataServiceQuery(params): [string, string] {
//       //   let entityType = 'shipment'
//       //   const subqueries = (params.subqueries = params.subqueries || {})
//       //   if (subqueries.entityType && subqueries.entityType !== true && 'value' in subqueries.entityType) {
//       //     entityType = subqueries.entityType.value
//       // }
//       //   return [entityType, entityType]
//       return [Alert[0].tableName, Alert[0].tableName]
//     },


//     onResult(res, params): any[] {

//       let bottomSheetId = shipmentBottomSheetId
//       const subqueries = (params.subqueries = params.subqueries || {})
//       if (subqueries.entityType && subqueries.entityType !== true && 'value' in subqueries.entityType) {
//         if (subqueries.entityType.value === 'booking') bottomSheetId = bookingBottomSheetId
//       }

//       let query = Alert[0].query;

//       return res.map(r => ({ ...r, bottomSheetId, query }))
//     },
//   },
// ]

export default {
  jqls: [
    {
      type: 'prepareParams', //save original Params for later concatenation use
      async prepareParams(params, prevResult, user): Promise<IQueryParams> {
        Object.assign(originParams,params);
       
        return params
      },
    },
    ...Alert.reduce((acc, template, index) => {

      acc = acc.concat(
        [
          {
            type: 'prepareParams',
            async prepareParams(params, prevResult, user): Promise<IQueryParams> {
              Object.assign(params,originParams);
              console.log(index);
              console.log('array index');
              console.log({params});
              console.log('params in jql array');
              const { moment } = await this.preparePackages(user)

              var subqueries = params.subqueries || {}


             // if (!subqueries.entityType || !(subqueries.entityType !== true && 'value' in subqueries.entityType)) throw new Error('MISSING_ENTITY_TYPE')
              // if (['shipment', 'booking', 'purchase-order'].indexOf(subqueries.entityType.value) === -1) {
              //   throw new Error(`INVALID_ENTITY_TYPE_${String(subqueries.entityType.value).toLocaleUpperCase()}`)
              // }

              // if (!subqueries.alertCreatedAt || !subqueries.alertCreatedAt.from) {
              //   throw new Error(`MISSING_alertCreatedAt`)
              // }



              subqueries.alertStatus = { value: ['open'] }
              if(index>0) delete params.subqueries;
           
              _.merge(params,Alert[index].query?{subqueries:Alert[index].query}:{subqueries:{}};
              console.log({params});
              console.log('after merge');
             
              // _.merge(params, Alert[index].query);
            //   console.log({originParams});
            //   console.log('after merge');
            //  Object.assign(params,originParams);
            //  console.log({params});
            //  console.log('after merge');

             // delete params.subqueries.alertCreatedAt;
              //params.subqueries.entityType={value:originParams['subqueries'].entityType.value};
             // subqueries.alertCategory = { value: Alert[index].alertCategory }
              params.subqueries['alertTypeIsNotNull'] = {value:true}
              
           


              params.fields = ['alertType', 'alertCategory', 'tableName', 'primaryKeyListString', 'count']
              params.groupBy = ['alertType', 'alertCategory', 'tableName']
              params.limit = 10;
              console.log(Alert[index].alertType)
              return params
            },
          },
          {
            type: 'callDataService',
            getDataServiceQuery(params): [string, string] {
              //   let entityType = 'shipment'
              //   const subqueries = (params.subqueries = params.subqueries || {})
              //   if (subqueries.entityType && subqueries.entityType !== true && 'value' in subqueries.entityType) {
              //     entityType = subqueries.entityType.value
              // }
              //   return [entityType, entityType]
              return [Alert[index].tableName, Alert[index].tableName]
            },


            onResult(res, params): any[] {

              let bottomSheetId = shipmentBottomSheetId
              const subqueries = (params.subqueries = params.subqueries || {})
              if (subqueries.entityType && subqueries.entityType !== true && 'value' in subqueries.entityType) {
                if (subqueries.entityType.value === 'booking') bottomSheetId = bookingBottomSheetId
              }

              let query = Alert[index].query;
              return res.map(r => ({ ...r, bottomSheetId, query }))
            },
          },
        ]
      )

      return acc

    }, [])



  ],
  filters: [
    {
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
          },
          {
            label: 'purchase-order',
            value: 'purchase-order',
          }
        ],
        required: true,
      },
      type: 'list',
    },
    {
      name: 'alertCreatedAt',
      type: 'date',
      props: {
        required: true
      }
    },
  ]
} as JqlDefinition

