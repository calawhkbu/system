import { JqlDefinition, JqlTask } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import _ = require('lodash')
import swig = require('swig-templates')
import { ERROR } from 'utils/error'


const entityTypes = [
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
]


const handleParams = (baseParams: IQueryParams): { entityParams: IQueryParams, alertParams: { entityType: string, alertType: string[], isImportant: boolean } } => {
  const { entityType = null, alertType = null, isImportant = null, ...entitySubqueries } = baseParams.subqueries || {}
  const selectedEntityType = entityType && entityType.value ? entityType.value : undefined
  if (!selectedEntityType) {
    throw ERROR.MISSING_ENTITY_TYPE()
  }
  if (!entityTypes.find(type => type.value === selectedEntityType)) {
    throw ERROR.UNSUPPORTED_ENTITY_TYPE()
  }
  return {
    entityParams: {
      ...baseParams,
      subqueries: entitySubqueries
    },
    alertParams: {
      entityType: selectedEntityType,
      alertType: alertType && alertType.value ? alertType.value : [],
      isImportant
    }
  }
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
        const { entityParams, alertParams } = handleParams(params)
        const entitySuqueries = entityParams.subqueries || {}
        const { alertConfigList = [] } = await this.getDataService().crudEntity(
          'alert',
          { type: 'getCompleteAlertConfig', options: [user.selectedPartyGroup.code] },
          user
        )

        return alertConfigList.reduce((finalTasks: Array<JqlTask | JqlTask[]>, { handleAlertSubComponentLayoutName, alertType, tableName, queryName, query, active, severity }) => {
          if (
            active && query && // if it is active watchdog
            tableName === alertParams.entityType && // entityType filter
            (!alertParams.alertType.length || alertParams.alertType.includes(alertType)) && // alert type filer
            (alertParams.isImportant === null || (alertParams.isImportant && severity === 'high') || (!alertParams.isImportant && severity !== 'high')) && // important filter
            Object.keys(entitySuqueries).reduce((add: boolean, key: string) => {
              const baseSubqueries = query.subqueries || {}
              if (add && baseSubqueries[key] && !_.isEqual(baseSubqueries[key], entitySuqueries[key])) {
                add = false
              }
              return add
            }, true)
          ) {
            finalTasks.push([
              {
                type: 'prepareParams',
                async prepareParams(
                  params: IQueryParams,
                  prevResult?: any,
                  user?: JwtPayload
                ): Promise<IQueryParams> {
                  return {
                    subqueries: {
                      ...(entitySuqueries),
                      ...(query.subqueries || {})
                    }
                  }
                }
              }, {
                type: 'callDataService',
                dataServiceType: 'count',
                dataServiceQuery: [tableName, queryName],
                onResult(res, params, prevResult: any): any {
                  prevResult[alertType] = {
                    handleAlertSubComponentLayoutName,
                    result: res
                  }
                  return prevResult
                }
              }
            ])
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
          const { handleAlertSubComponentLayoutName, result } = prevResult[key]
          if (result && result.length && result[0].count > 0) {
            const titleTranslation = _.get(i18n, `Alert.${key}Title`, null)
            const messageTranslation = _.get(i18n, `Alert.${key}Message`, null)
            results.push({
              alertTypeCode: key,
              alertType: titleTranslation ? swig.render(titleTranslation, { locals: {} }) : key,
              alertContent: messageTranslation ? swig.render(messageTranslation, { locals: {} }) : key,
              count: result[0].count,
              icon: 'notification_important',
              tableName: params.subqueries.entityType && params.subqueries.entityType.value||null,
              subqueries: prevResult.subqueries,
              handleAlertSubComponentLayoutName
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
        items: entityTypes,
        required: true,
      },
      type: 'list',
    },
    {
      display: 'isImportant',
      name: 'isImportant',
      type: 'boolean',
    },
  ]
} as JqlDefinition
