import { JqlDefinition, JqlTask } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import _ = require('lodash')
import swig = require('swig-templates')
import { convertToStartOfDate } from 'utils/jql-subqueries'


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
                  console.log('before return')
                  console.log(mainCard_subq)

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
                  prevResult['subqueries'] = subqueries
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
        let hideAll_default = Object.keys(prevResult)
        hideAll_default = hideAll_default.filter(o => o != 'tableName' && o != 'subqueries' && o != 'alertType')
        //add tableName as prefix e.g. shipment-sayHello
        var temp = [];
        for (let i = 0; i < hideAll_default.length; i++) {
          temp.push(`${prevResult.tableName}-${hideAll_default[i]}`);

        }

        let i = 0;
        for (const key of Object.keys(prevResult)) {
          const result = prevResult[key]
          if (result && result.length && result[0].count > 0) {
            const translation = _.get(i18n, `Alert.${key}Title`, null)
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
        //demo
        results.push({
          id: i++,
          category: 'Booking',
          group: 'detentionAlert(SEA)',
          alertTypeCode: 'detentionAlert(SEA)',
          alertType: 'ABC',
          count: 10,
          tableName: prevResult.tableName,
          subqueries: prevResult.subqueries,
          collapsed: `${prevResult.tableName}-detentionAlert(SEA)'`,
          isEntityRow: false,
          primaryId: 1234,

        })
        results.push({
          group: 'detentionAlert(SEA)',
          alertTypeCode: 'detentionAlert(SEA)',
          alertType: 'BBC',
          count: 10,
          tableName: prevResult.tableName,
          subqueries: prevResult.subqueries,
          collapsed: `${prevResult.tableName}-detentionAlert(SEA)'`,
          isEntityRow: false,
          primaryId: 2234,
          masterNo: 'ABCD-2234',
          category: "Booking",
          deadline: null,
          description: null,
          dueAt: null,
          hasSubTasks: 0,
          id: i++,
          isClosed: 0,
          isDead: null,
          isDeleted: 0,
          isDone: 0,
          isDue: null,
          isDueToday: null,
          latestRemark: null,
          latestRemarkAt: null,
          latestRemarkBy: null,
          name: "Contact Shipper for CRD, pick up date, ETD, ETA and collect booking note",
          noOfRemarks: null,
          picEmail: null,
          primaryKey: "4738",
          primaryNo: "01-2010125411",
          remark: null,
          seqNo: 110,
          startAt: "2020-10-11T08:33:20.000Z",
          status: "Open",
          statusAt: "2020-11-10T01:37:17.000Z",
          statusBy: "me",
          system: "Email/ Phone",
          taskId: 111,
          taskStatus: "Open",
          team: null,
          uniqueId: "DEV-111"

        })



        results.sort((a, b) => {
          if (a.alertType && a.id > b.alertType && b.id) {
            return 1
          } else if (a.alertType && a.id< b.alertType && b.id ) {
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
    }
  ]
} as JqlDefinition