import { JqlDefinition, JqlTask } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import _ = require('lodash')
import swig = require('swig-templates')
import { PurchaseOrderItemTableService } from 'modules/sequelize/services/table/purchaseOrderItem'


const bottomSheetId = {
  shipment: 'cb22011b-728d-489b-a64b-b881914be600',
  booking: 'bde2d806-d2bb-490c-b3e3-9e4792f353dd'
}

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
          throw new Error('MISSING_ENTITY_TYPE')
        }
        if (Object.keys(bottomSheetId).indexOf(subqueries.entityType.value) === -1) {
          throw new Error(`INVALID_ENTITY_TYPE_${String(subqueries.entityType.value).toLocaleUpperCase()}`)
        }
        const { alertConfigList } = await this.getDataService().crudEntity(
          'alert',
          { type: 'getCompleteAlertConfig', options: [user.selectedPartyGroup.code] },
          user
        )
        


        return alertConfigList.reduce((finalTasks: Array<JqlTask | JqlTask[]>, { alertType, tableName, queryName, query, active }) => {

          let addRow = true;
          if (query && active && tableName === subqueries.entityType.value) {
            let mainCard_subq = _.cloneDeep(params.subqueries || {})
            let keys = Object.keys(mainCard_subq);
            let alertQ=_.cloneDeep(query.subqueries)
            keys = keys.filter(o => o != 'date')
            keys = keys.filter(o => o != 'active')
            keys = keys.filter(o => o != 'entityType')
            keys = keys.filter(o => o != 'activeStatus')
            keys = keys.filter(o => o != 'alertType')


            var alertConfigKeys = Object.keys(query.subqueries);

            if (keys && keys.length > 0) {
              for (let i = 0; i < keys.length; i++) {
                let exist = alertConfigKeys.find(o => o == keys[i]);
                if (exist) {
                  let alertVal = Array.isArray(query.subqueries[exist].value) ? query.subqueries[exist].value[0] : query.subqueries[exist].value
                  let mainCard = mainCard_subq[exist].value[0] || undefined

                  if (alertVal != mainCard) {
                    addRow = false;
                  } else {
                    addRow = true;
                  }
                } else {
                  addRow = false;
                }
              }
            }


            if (addRow) {
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
                }, {
                  type: 'callDataService',
                  dataServiceType: 'count',
                  dataServiceQuery: [tableName, queryName],
                  onResult(res, params, prevResult: any): any {
                    prevResult[alertType] = res
                    prevResult['tableName'] = tableName
                    prevResult['alertType'] = alertType
                    return prevResult
                  }
                }
              ])
              if (subqueries.alertType && subqueries.alertType.value.filter(o => o == alertType).length == 0) {
                //if not selected from the UI, filtered out, not show
                finalTasks.pop()
              }
            }
          }
          return finalTasks
        }, [])
      }
    },
    {
      type: 'postProcess',
      async postProcess(
        params: IQueryParams,
        prevResult?: any,
        user?: JwtPayload
      ) {

        const i18n = await this.getI18nService().find({
          locale: 'en',
          version: undefined,
          user: user
        })
        const results = []
      
      


        for (const key of Object.keys(prevResult)) {
          const result = prevResult[key]
         
          if (result && result.length && result[0].count > 0) {
            const translation = _.get(i18n, `Alert.${key}Title`, null)
            const { alertConfigList } = await this.getDataService().crudEntity(
              'alert',
              { type: 'getCompleteAlertConfig', options: [user.selectedPartyGroup.code] },
              user
            )
             let query=alertConfigList.find(o=>o.alertType==key);
             query=query.query.subqueries||{}
      
    
            results.push({
              alertTypeCode: key,
              alertType: translation ? swig.render(translation, { locals: {} }) : translation,
              count: result[0].count,
              tableName: prevResult.tableName,
              query: query,
              collapsed: `${prevResult.tableName}-${key}`,
              expanded: 0,
              indicator: '-',
              isEntityRow: true
            })
          }
        }
        results.sort((a, b) => {
          if (a.alertType > b.alertType) {
            return 1
          } else if (a.alertType < b.alertType) {
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
                }
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
                  value: '{{value}}'
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
          // {
          //   label: 'booking',
          //   value: 'booking',
          // },
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
    },
  ]
} as JqlDefinition