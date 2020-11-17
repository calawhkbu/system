import { JqlDefinition, JqlTask } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import _ = require('lodash')
import swig = require('swig-templates')
import { ERROR } from 'utils/error'


const bottomSheetId = {
  shipment: 'cb22011b-728d-489b-a64b-b881914be600',
  booking: 'bde2d806-d2bb-490c-b3e3-9e4792f353dd'
}
var result // for obtain Category, isEntityRow
var alertCategory:any[]=[]//use the subqueries of this to get records and show as subRows
var counter=0

export default {
  jqls: [
    {
      type: 'runParallel',
      defaultResult: {},
      async createJqls(
        params: IQueryParams,
        prevResult?: any,
        user?: JwtPayload
      ): Promise<Array<JqlTask | JqlTask[]>> {
        var subqueries = params.subqueries || {}
        if (!subqueries.entityType || !(subqueries.entityType !== true && 'value' in subqueries.entityType)) {
          throw ERROR.MISSING_ENTITY_TYPE()
        }
        if (Object.keys(bottomSheetId).indexOf(subqueries.entityType.value) === -1) {
          throw ERROR.UNSUPPORTED_ENTITY_TYPE()
        }
        const { alertConfigList } = await this.getDataService().crudEntity(
          'alert',
          { type: 'getCompleteAlertConfig', options: [user.selectedPartyGroup.code] },
          user
        )
          
        return alertConfigList.reduce((finalTasks: Array<JqlTask | JqlTask[]>, { alertType, tableName, queryName, query, active }) => {

          if (query && active && tableName === subqueries.entityType.value) {
            let mainCard_subq = _.cloneDeep(params.subqueries || {})
            let keys = Object.keys(mainCard_subq);
            finalTasks.push([
              {
                type: 'prepareParams',
                async prepareParams(
                  params: IQueryParams,
                  prevResult?: any,
                  user?: JwtPayload
                ): Promise<IQueryParams> {
                  ;

                  delete mainCard_subq.alertType


                  return {
                    subqueries: {
                      ...mainCard_subq,
                      //...(subqueries || {}),
                      ...(query.subqueries || {})
                    }
                  }
                }

              }, 
              {
                type: 'callDataService',
                dataServiceType: 'count',
                dataServiceQuery: [tableName, queryName],
                onResult(res, params, prevResult: any): any {
                  prevResult[alertType] = res
                  prevResult['tableName'] = tableName
                  prevResult['subqueries'] = query.subqueries||{}
                  prevResult['alertType'] = alertType
                  alertCategory.push(prevResult)
                  return prevResult
                },
                {
                  type: 'prepareParams',
                  async prepareParams(
                    params: IQueryParams,
                    prevResult?: any,
                    user?: JwtPayload
                  ) {
                    console.log('prepareParams after callDataService inside finalTasks')
             
                  
                    return {subqueries:params.subqueries}
                  }
                  
              }
            ])
            if (subqueries.alertType && subqueries.alertType.value.filter(o => o == alertType).length == 0) {
              //if not selected from the UI, filtered out, not show
              finalTasks.pop()
            }
          }
          
          console.log('running series ')
          console.log(counter++)
         
          return finalTasks
        }, [])
      }
    },
    
    {
      type: 'prepareParams',
      async prepareParams(
        params: IQueryParams,
        prevResult?: any,
        user?: JwtPayload
      ) {
        let original=_.cloneDeep(params);
        _.merge(params,prevResult)
        console.log('alertCategory')
        console.log(alertCategory)
        return {subqueries:params.subqueries}
      }
    },
    {
      type: 'callDataService',
      dataServiceType: 'query',
      dataServiceQuery: ['shipment', 'shipment'],
      async onResult(res, params, prevResult: any,user): any {
        //get subqueries and get primaryId
  console.log('res----')
  console.log({res})
  console.log('params......')
  console.log(params)
  console.log('params-subqueries.entityType')
  console.log(params.subqueries.entityType.value||{})
  const i18n = await this.getI18nService().find({
    locale: 'en',
    version: undefined,
    user: user
  })
  const results = []
  let hideAll_default = Object.keys(prevResult)
  hideAll_default = hideAll_default.filter(o => o != 'tableName' && o != 'subqueries' && o != 'alertType')
  //add tableName as prefix e.g. shipment-sayHello
  var temp = [];
  for (let i = 0; i < hideAll_default.length; i++) {
    temp.push(`${prevResult.tableName}-${hideAll_default[i]}`);

  }

  let i = 0;
  for (const key of Object.keys(prevResult)) {
     result = prevResult[key]
    if (result && result.length && result[0].count > 0) {
      const translation = _.get(i18n, `Alert.${key}Title`, null)
      if (prevResult.tableName == params.subqueries.entityType.value) {
        //show record based on selected entityType


        results.push({
          id: i++,
          alertTypeCode: key,
          alertType: translation ? swig.render(translation, { locals: {} }) : translation,
          count: result[0].count,
          tableName: prevResult.tableName,
          subqueries: prevResult.subqueries,
          hideAll: [...temp, `${prevResult.tableName}-${key}`],
          expanded: false,
          collapsed: `${prevResult.tableName}-${key}`,
          isEntityRow: true,

        })
      }

    }
  }
  console.log('length of res')
  console.log(res.length||0)
  //get specific records under the alertType
  for(let j of res){
    results.push({
      id: i++,
      alertTypeCode: 'detentionAlert(SEA)',
      alertType: 'ABC',
      tableName: params.subqueries.entityType.value||'shipment',
      collapsed: `${params.subqueries.entityType.value}-detentionAlert(SEA)'`,
      primaryId: j.shipmentId,
      houseNo:j.houseNo||{},
      masterNo:j.masterNo||{},
      bookingNo:j.bookingNo||{},
      jobDate:j.jobDate||{}
     })



  }
     
  //   })
  //    //demo
  //    let tempTableName='shipment'
  //    if(tempTableName==params.subqueries.entityType.value){
  //    results.push({
  //     id: i++,
  //     alertTypeCode: 'detentionAlert(SEA)',
  //     alertType: 'ABC',
  //     tableName: tempTableName,
  //     collapsed: `${tempTableName}-detentionAlert(SEA)'`,
  //     primaryId: 364962,


  //   })
  //   results.push({
  //     id: i++,
  //     alertTypeCode: 'detentionAlert(SEA)',
  //     alertType: 'This is a test',
  //     tableName: tempTableName,
  //     collapsed: `${tempTableName}-detentionAlert(SEA)'`,
  //     primaryId: 364962,


  //   })
  // }
   let tempTableName='booking'
  if (tempTableName == params.subqueries.entityType.value ) {
 
    results.push({
      id: i++,
      alertTypeCode: 'detentionAlert(SEA)',
      alertType: 'booking-test',
      tableName: tempTableName,
      collapsed: `booking-detentionAlert(SEA)'`,
      primaryId: 8758,
      bookingNo:'Test2020111116'

    })
  }





  results.sort((a, b) => {
    if (a.alertType && a.id > b.alertType && b.id) {
      return 1
    } else if (a.alertType && a.id < b.alertType && b.id) {
      return -1
    }
    return 0
  })
        return results
      }
    }
  ],
  filters: [
    {
      name: 'alertType',
      type: 'autocomplete',
      props: {
        api: {
          query: {
            url: 'api/alert/alertType/get',
            data: {
              subqueries: {
                q: {
                  value: '{{ q }}'
                },
                "fields": [
                  "alertType"

                ]
              },

              limit: 5
            },
            method: 'POST',
            labelKey: 'alertTitle',
            valueKey: 'alertType',
            subLabelKey: 'alertType'
          },
          resolve: {
            url: 'api/alert/alertType/get',
            data: {
              subqueries: {
                alertType: {
                  value: '{{ value }}'
                }
              }
            },
            method: 'POST',
            labelKey: 'alertTitle',
            valueKey: 'alertType',
            subLabelKey: 'alertType'
          }
        },
        multi: true,
        threshold: 0,
        showAllIfEmpty: true
      },
      display: 'alertType'
    },

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
          // {
          //   label: 'purchase-order',
          //   value: 'purchase-order',
          // }
        ],
        required: true,
      },
      type: 'list',
    }
  ]
} as JqlDefinition