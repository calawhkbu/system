import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { OrderBy } from 'node-jql'
import Moment = require('moment')

import {
  expandBottomSheetGroupByEntity,
  expandSummaryVariable,
  handleBottomSheetGroupByEntityValue,
  summaryVariableList,
  groupByEntityList
} from 'utils/card'
import { convertToStartOfDate } from 'utils/jql-subqueries'


interface Result {
  moment: typeof Moment
  groupByEntity: string
  codeColumnName: string
  nameColumnName: string

  dynamicColumnCodeColumnName: string,
  dynamicColumnGroupByEntity: string,
  dynamicColumnNameColumnName: string,

  summaryVariables: string[]


  // the result for the first groupBy
  groupByResult: any[]
}



export default {
  jqls: [

  
    {
      type: 'prepareParams',
      defaultResult: {},
      async prepareParams(params, prevResult: Result, user): Promise<IQueryParams> {
       

        const moment = prevResult.moment = (await this.preparePackages(user)).moment as typeof Moment
        const subqueries = (params.subqueries = params.subqueries || {})

        // idea: userGroupByVariable and userSummaryVariable is selected within filter by user
        if (!subqueries.groupByEntity || !(subqueries.groupByEntity !== true && 'value' in subqueries.groupByEntity)) throw new Error('MISSING_groupByEntity')
        if (!subqueries.dynamicColumnGroupByEntity || !(subqueries.dynamicColumnGroupByEntity !== true && 'value' in subqueries.dynamicColumnGroupByEntity)) throw new Error('MISSING_dynamicColumnGroupByEntity')

        if (!subqueries.topX || !(subqueries.topX !== true && 'value' in subqueries.topX)) throw new Error('MISSING_topX')
        if (!subqueries.topY || !(subqueries.topY !== true && 'value' in subqueries.topY)) throw new Error('MISSING_topY')

        handleBottomSheetGroupByEntityValue(subqueries)

        const {
          groupByEntity,
          codeColumnName,
          nameColumnName,
          dynamicColumnCodeColumnName,
          dynamicColumnGroupByEntity,
          dynamicColumnNameColumnName

        } = expandBottomSheetGroupByEntity(subqueries)

        prevResult.groupByEntity = groupByEntity
        prevResult.codeColumnName = codeColumnName
        prevResult.nameColumnName = nameColumnName

        prevResult.dynamicColumnGroupByEntity = dynamicColumnGroupByEntity
        prevResult.dynamicColumnCodeColumnName = dynamicColumnCodeColumnName
        prevResult.dynamicColumnNameColumnName = dynamicColumnNameColumnName


        const topX = subqueries.topX.value
        const topY = subqueries.topY.value


        const summaryVariables = expandSummaryVariable(subqueries)
        prevResult.summaryVariables = summaryVariables

        subqueries[`${codeColumnName}IsNotNull`] = { // shoulebe carrierIsNotNull/shipperIsNotNull/controllingCustomerIsNotNull
          value: true
        }

        subqueries[`${dynamicColumnCodeColumnName}IsNotNull`] = {
          value: true
        }

        params.fields = [
          // select Month statistics
          ...summaryVariables,
          codeColumnName,
          nameColumnName,
          'ErpSite'
        ]

        // group by
        params.groupBy = [codeColumnName]

        // new way of handling sorting
        const sorting = params.sorting = []
        if (subqueries.sorting && subqueries.sorting !== true && 'value' in subqueries.sorting) {
          const sortingValueList = subqueries.sorting.value as { value: string; ascOrDesc: 'ASC' | 'DESC' }[]
          sortingValueList.forEach(({ value, ascOrDesc }) => {
            const orderByExpression = new OrderBy(value, ascOrDesc)
            sorting.push(orderByExpression)
          })
        }
        else {
          params.sorting = new OrderBy(`${summaryVariables[0]}`, 'DESC')
        }

        params.limit = topY

        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['shipment', 'shipment'],
      onResult(res, params, prevResult: Result): Result {

        const { moment, groupByEntity, codeColumnName, nameColumnName, summaryVariables } = prevResult





        prevResult.groupByResult = res.map(row => {

          const row_: any = { code: row[codeColumnName], name: row[nameColumnName], groupByEntity }
          for (const variable of summaryVariables) {
            // change into number
            row_[`${variable}`] = +row[variable]
          }
          row_['erpCode']=row['ErpSite']

          return row_
        })
        return prevResult
      }
    },

    {
      type: 'prepareParams',
      defaultResult: {},
      async prepareParams(params, prevResult: Result, user): Promise<IQueryParams> {


        const subqueries = (params.subqueries = params.subqueries || {})

        const { moment, groupByResult, codeColumnName, dynamicColumnCodeColumnName, dynamicColumnNameColumnName, summaryVariables } = prevResult

        const codeList = groupByResult.map(row => row.code)

        params.fields = [
          codeColumnName,
          dynamicColumnCodeColumnName,
          dynamicColumnNameColumnName,
          ...summaryVariables
        ]

        // filter groupBy
        subqueries[codeColumnName] = { // shoulebe carrierIsNotNull/shipperIsNotNull/controllingCustomerIsNotNull
          value: codeList
        }

        params.groupBy = [codeColumnName, dynamicColumnCodeColumnName]

        const sorting = params.sorting = []
        if (subqueries.sorting && subqueries.sorting !== true && 'value' in subqueries.sorting) {
          const sortingValueList = subqueries.sorting.value as { value: string; ascOrDesc: 'ASC' | 'DESC' }[]
          sortingValueList.forEach(({ value, ascOrDesc }) => {
            const orderByExpression = new OrderBy(value, ascOrDesc)
            sorting.push(orderByExpression)
          })
        }
        else {
          params.sorting = new OrderBy(`${summaryVariables[0]}`, 'DESC')
        }

        return params
      }
    },

    {
      type: 'callDataService',
      dataServiceQuery: ['shipment', 'shipment'],
      onResult(res, originalParams, prevResult: Result): any[] {
        var params = Object.assign({}, originalParams);

        var {
          moment,
          groupByEntity,
          codeColumnName,
          nameColumnName,
          dynamicColumnCodeColumnName,
          dynamicColumnNameColumnName,
          summaryVariables,
          groupByResult
        } = prevResult

        const subqueries = (params.subqueries = params.subqueries || {})

        const topX = subqueries.topX.value
        const topY = subqueries.topY.value

        res.map(dynamicRow => {

          const { dynamicCode } = { dynamicCode: dynamicRow[dynamicColumnCodeColumnName] }

        })

        const finalResult = groupByResult.map(row => {

          var { code } = row

          // calculate topX dynamicCodeList
          
          const dynamicCodeList= [...new Set(res.map(dynamicRow => dynamicRow[dynamicColumnCodeColumnName]))].splice(0, topX)
          const dynamicNameList = [...new Set(res.map(dynamicRow => dynamicRow[dynamicColumnNameColumnName]))].splice(0, topX)
          const row_ = {
            ...row,
            dynamicCodeList,
            dynamicNameList,
          }


         

          res.map(dynamicRow => {
            const { dynamicCode } = { dynamicCode: dynamicRow[dynamicColumnCodeColumnName] }
            if (row_["code"] === dynamicRow[codeColumnName]){
              summaryVariables.map(summaryVariable => {
                var fieldName;
                fieldName = `${dynamicCode}_${summaryVariable}`;

                // forcefully make it into number
                const dynamicValue = +dynamicRow[summaryVariable]
                // add G0001_cbm into the row
                row_[fieldName] = dynamicValue
              })
            }
          })


          return row_

        })
        return finalResult
      }
    },


  ],
  filters: [
    // for this filter, user can only select single,
    // but when config in card definition, use summaryVariables. Then we can set as multi
    {
      display: 'topY',
      name: 'topY',
      props: {
        items: [
          {
            label: '10',
            value: 10,
          },
          {
            label: '20',
            value: 20,
          },
          {
            label: '50',
            value: 50,
          },
          {
            label: '100',
            value: 100,
          },
          {
            label: '1000',
            value: 1000,
          }
        ],
        multi: false,
        required: true,
      },
      type: 'list',
    },

    {
      display: 'summaryVariables',
      name: 'summaryVariables',
      props: {
        items: [
          ...summaryVariableList.reduce((acc, summaryVariable) => {

            acc = acc.concat(
              [
                {
                  label: `${summaryVariable}`,
                  value: `${summaryVariable}`,
                }
              ]
            )

            return acc

          }, [])
        ],
        multi: true,
        required: true,
      },
      type: 'list',
    },
    {
      display: 'groupByEntity',
      name: 'groupByEntity',
      props: {
        items: [
          ...groupByEntityList.reduce((acc, groupByEntity) => {

            acc = acc.concat(
              [
                {
                  label: `${groupByEntity}`,
                  value: `${groupByEntity}`,
                }
              ]
            )

            return acc

          }, [])
        ],
        required: true,
      },
      type: 'list',
    },

    {
      display: 'bottomSheetGroupByEntity',
      name: 'bottomSheetGroupByEntity',
      props: {
        items: [
          ...groupByEntityList.reduce((acc, groupByEntity) => {

            acc = acc.concat(
              [
                {
                  label: `${groupByEntity}`,
                  value: `${groupByEntity}`,
                }
              ]
            )

            return acc

          }, [])
        ],
        required: true,
      },
      type: 'list',
    },

    {
      display: 'dynamicColumnGroupByEntity',
      name: 'dynamicColumnGroupByEntity',
      props: {
        items: [
          ...groupByEntityList.reduce((acc, groupByEntity) => {

            acc = acc.concat(
              [
                {
                  label: `${groupByEntity}`,
                  value: `${groupByEntity}`,
                }
              ]
            )

            return acc

          }, [])
        ],
        required: true,
      },
      type: 'list',
    },

    {
      display: 'sorting',
      name: 'sorting',
      type: 'sorting',
      props: {
        multi: true,
        items: [
          ...summaryVariableList.reduce((acc, summaryVariable) => {

            acc = acc.concat(
              [
                {
                  label: `${summaryVariable}`,
                  value: `${summaryVariable}`,
                }
              ]
            )

            return acc

          }, [])
        ],
      }
    }
  ]
} as JqlDefinition
