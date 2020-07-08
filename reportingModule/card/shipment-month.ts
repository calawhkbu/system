import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'
import { OrderBy } from 'node-jql'
import Moment = require('moment')

import { expandGroupEntity,expandSummaryVariable, extendDate } from 'utils/card'



interface Result {
  moment: typeof Moment
  groupByEntity: string
  codeColumnName: string
  nameColumnName: string
  summaryVariables: string[]
}

export default {
  jqls: [
    {
      type: 'prepareParams',
      defaultResult: {},
      async prepareParams(params, prevResult: Result, user): Promise<IQueryParams> {
        function guessSortingExpression(sortingValue: string, subqueries) {
          const variablePart = sortingValue.substr(0, sortingValue.lastIndexOf('_'))
          const sortingDirection = sortingValue.substr(sortingValue.lastIndexOf('_') + 1)

          if (!['ASC', 'DESC'].includes(sortingDirection)) {
            throw new Error(`cannot guess sortingDirection`)
          }

          // here will handle 2 special cases : metric , summaryVariable
          const metricRegex = new RegExp('metric[0-9]+')
          const summaryVariableRegex = new RegExp('summaryVariable')

          let finalColumnName: string

          // summaryVariable case
          if (summaryVariableRegex.test(variablePart)) {
            finalColumnName = variablePart.replace('summaryVariable', subqueries.summaryVariable.value)
          }
          else if (metricRegex.test(variablePart)) {
            const metricPart = variablePart.match(metricRegex)[0]
            const metricValue = subqueries[metricPart].value
            finalColumnName = variablePart.replace(metricPart, metricValue)
          }
          else {
            finalColumnName = variablePart
          }
          return new OrderBy(finalColumnName, sortingDirection as 'ASC'|'DESC')
        }

        const moment = prevResult.moment = (await this.preparePackages(user)).moment as typeof Moment
        const subqueries = (params.subqueries = params.subqueries || {})

        // idea: userGroupByVariable and userSummaryVariable is selected within filter by user
        if (!subqueries.groupByEntity || !(subqueries.groupByEntity !== true && 'value' in subqueries.groupByEntity)) throw new Error('MISSING_groupByVariable')
        if (!subqueries.topX || !(subqueries.topX !== true && 'value' in subqueries.topX)) throw new Error('MISSING_topX')

        // -----------------------------groupBy variable
        // const groupByEntity = prevResult.groupByEntity = subqueries.groupByEntity.value // should be shipper/consignee/agent/controllingCustomer/carrier
        // const codeColumnName = prevResult.codeColumnName = groupByEntity === 'houseNo' ? 'houseNo': groupByEntity === 'carrier' ? `carrierCode`: groupByEntity === 'agentGroup' ? 'agentGroup': groupByEntity === 'moduleType' ? 'moduleTypeCode': `${groupByEntity}PartyCode`
        // const nameColumnName = prevResult.nameColumnName = (groupByEntity === 'houseNo' ? 'houseNo': groupByEntity === 'carrier' ? `carrierName`: groupByEntity === 'agentGroup' ? 'agentGroup': groupByEntity === 'moduleType' ? 'moduleTypeCode': `${groupByEntity}PartyShortNameInReport`) + 'Any'

        const { groupByEntity, codeColumnName,nameColumnName } = expandGroupEntity(subqueries)

        prevResult.groupByEntity = groupByEntity
        prevResult.codeColumnName = codeColumnName
        prevResult.nameColumnName = nameColumnName


        const topX = subqueries.topX.value

        // ---------------------summaryVariables
        // let summaryVariables: string[] = []
        // if (subqueries.summaryVariables && subqueries.summaryVariables !== true && 'value' in subqueries.summaryVariables) {
        //   // sumamary variable
        //   summaryVariables = Array.isArray(subqueries.summaryVariables.value ) ? subqueries.summaryVariables.value : [subqueries.summaryVariables.value]
        // }
        // if (subqueries.summaryVariable && subqueries.summaryVariable !== true && 'value' in subqueries.summaryVariable) {
        //   summaryVariables = [...new Set([...summaryVariables, subqueries.summaryVariable.value] as string[])]
        // }
        // if (!(summaryVariables && summaryVariables.length)){
        //   throw new Error('MISSING_summaryVariables')
        // }

        const summaryVariables = expandSummaryVariable(subqueries)
        prevResult.summaryVariables = summaryVariables

        // ----------------------- filter
        // limit/extend to 1 year
        // const year = (subqueries.date && subqueries.date !== true && 'from' in subqueries.date ? moment(subqueries.date.from, 'YYYY-MM-DD'): moment()).year()
        // subqueries.date = {
        //   from: moment()
        //     .year(year)
        //     .startOf('year')
        //     .format('YYYY-MM-DD'),
        //   to: moment()
        //     .year(year)
        //     .endOf('year')
        //     .format('YYYY-MM-DD')
        // }

        // extend date into whole year
        extendDate(subqueries,moment,'year')

        subqueries[`${codeColumnName}IsNotNull`]  = { // shoulebe carrierIsNotNull/shipperIsNotNull/controllingCustomerIsNotNull
          value: true
        }

        params.fields = [
          // select Month statistics
          ...summaryVariables.map(variable => `${variable}Month`),
          codeColumnName,
          nameColumnName,
        ]

        // group by
        params.groupBy = [codeColumnName]

        // // warning, will orderBy cbmMonth, if choose cbm as summaryVariables
        // params.sorting = new OrderBy(`total_${summaryVariables[0]}`, 'DESC')

        const sorting = params.sorting = []
        if (subqueries.sorting && subqueries.sorting !== true && 'value' in subqueries.sorting) {
          const sortingValueList = subqueries.sorting.value as string[]
          sortingValueList.forEach(sortingValue => {
            // will try to find in sortingExpressionMap first, if not found , just use the normal value
            const orderByExpression = guessSortingExpression(sortingValue, subqueries)
            sorting.push(orderByExpression)
          })
        }
        else {
          params.sorting = new OrderBy(`total_${summaryVariables[0]}`, 'DESC')
        }

        params.limit = topX
        return params
      }
    },
    {
      type: 'callDataService',
      dataServiceQuery: ['shipment', 'shipment'],
      onResult(res, params, { moment, groupByEntity, codeColumnName, nameColumnName, summaryVariables }: Result): any[] {
        return res.map(row => {
          const row_: any = { code: row[codeColumnName], name: row[nameColumnName], groupByEntity }

          for (const variable of summaryVariables) {
            let total = 0
            for (const m of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) {
              const month = moment().month(m).format('MMMM')
              const key = `${month}_${variable}`
              let value = +row[key]
              if (isNaN(value)) value = 0
              row_[key] = value
              total += value
            }
            row_[`total_${variable}`] = total
          }

          return row_
        })
      }
    }
  ],
  filters: [
    // for this filter, user can only select single,
    // but when config in card definition, use summaryVariables. Then we can set as multi
    {
      display: 'topX',
      name: 'topX',
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
      display: 'summaryVariable',
      name: 'summaryVariable',
      props: {
        items: [
          {
            label: 'chargeableWeight',
            value: 'chargeableWeight',
          },
          {
            label: 'grossWeight',
            value: 'grossWeight',
          },
          {
            label: 'cbm',
            value: 'cbm',
          },
          {
            label: 'totalShipment',
            value: 'totalShipment',
          },
          {
            label: 'teu',
            value: 'teu',
          },
          {
            label: 'teuInReport',
            value: 'teuInReport',
          },
          {
            label: 'quantity',
            value: 'quantity',
          },
        ],
        multi: false,
        required: true,
      },
      type: 'list',
    },
    {
      display: 'groupByEntity',
      name: 'groupByEntity',
      props: {
        items: [
          {
            label: 'carrier',
            value: 'carrier',
          },
          {
            label: 'shipper',
            value: 'shipper',
          },
          {
            label: 'consignee',
            value: 'consignee',
          },
          {
            label: 'agent',
            value: 'agent',
          },
          {
            label: 'agentGroup',
            value: 'agentGroup',
          },
          {
            label: 'controllingCustomer',
            value: 'controllingCustomer',
          },
          {
            label: 'linerAgent',
            value: 'linerAgent',
          },
          {
            label: 'roAgent',
            value: 'roAgent',
          },
          {
            label: 'office',
            value: 'office',
          },
          {
            label: 'moduleType',
            value: 'moduleType'
          },
          {
            label: 'houseNo',
            value: 'houseNo'
          }
        ],
        required: true,
      },
      type: 'list',
    },
    {
      display: 'sorting',
      name: 'sorting',
      type: 'list',
      props: {
        multi: true,
        items: [
          {
            label: 'total_totalShipment_ASC',
            value: 'total_totalShipment_ASC'
          },
          {
            label: 'total_totalShipment_DESC',
            value: 'total_totalShipment_DESC'
          },
          {
            label: 'total_summaryVariable_ASC',
            value: 'total_summaryVariable_ASC'
          },
          {
            label: 'total_summaryVariable_DESC',
            value: 'total_summaryVariable_DESC'
          }
        ]
      }
    }
  ]
} as JqlDefinition

/* import {
  AndExpressions,
  BinaryExpression,
  ColumnExpression,
  CreateTableJQL,
  FromTable,
  FunctionExpression,
  InsertJQL,
  Value,
  Query,
  ResultColumn,
  Column,
  GroupBy,
  OrderBy,
  MathExpression,
  IsNullExpression,
} from 'node-jql'
import { parseCode } from 'utils/function'

function prepareParams(): Function {
  return function(require, session, params) {

    function guessSortingExpression(sortingValue: string, subqueries)
    {
      const variablePart = sortingValue.substr(0, sortingValue.lastIndexOf('_'))
      const sortingDirection = sortingValue.substr(sortingValue.lastIndexOf('_') + 1)

      if (!['ASC', 'DESC'].includes(sortingDirection))
      {
        throw new Error(`cannot guess sortingDirection`)
      }

      // here will handle 2 special cases : metric , summaryVariable

      const metricRegex = new RegExp('metric[0-9]+')
      const summaryVariableRegex = new RegExp('summaryVariable')

      let finalColumnName: string

      // summaryVariable case
      if (summaryVariableRegex.test(variablePart))
      {
        finalColumnName = variablePart.replace('summaryVariable', subqueries.summaryVariable.value)
      }

      //
      else if (metricRegex.test(variablePart))
      {
        const metricPart = variablePart.match(metricRegex)[0]
        const metricValue = subqueries[metricPart].value
        finalColumnName = variablePart.replace(metricPart, metricValue)
      }

      else {
        finalColumnName = variablePart
      }

      return new OrderBy(finalColumnName, sortingDirection)
    }
    // import
    const { moment } = params.packages
    const { OrderBy } = require('node-jql')
    const { BadRequestException } = require('@nestjs/common')

    const subqueries = (params.subqueries = params.subqueries || {})

    // idea : userGroupByVariable and userSummaryVariable is selected within filter by user

    if (!subqueries.groupByEntity || !subqueries.groupByEntity.value) throw new Error('MISSING_groupByVariable')
    if (!subqueries.topX || !subqueries.topX.value) throw new Error('MISSING_topX')

    // -----------------------------groupBy variable

    const groupByEntity = subqueries.groupByEntity.value // should be shipper/consignee/agent/controllingCustomer/carrier

    const codeColumnName = groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierCode` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyCode`
    const nameColumnName = (groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierName` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyShortNameInReport`) + `Any`


    const topX = subqueries.topX.value

    // ---------------------summaryVariables

    let summaryVariables: string[] = []
    if (subqueries.summaryVariables && subqueries.summaryVariables.value)
    {
      // sumamary variable
      summaryVariables = Array.isArray(subqueries.summaryVariables.value ) ? subqueries.summaryVariables.value  : [subqueries.summaryVariables.value ]
    }

    if (subqueries.summaryVariable && subqueries.summaryVariable.value)
    {
      summaryVariables = [...new Set([...summaryVariables, subqueries.summaryVariable.value] as string[])]
    }

    if (!(summaryVariables && summaryVariables.length)){
      throw new Error('MISSING_summaryVariables')
    }

    // ----------------------- filter

    // limit/extend to 1 year
    const year = (subqueries.date ? moment(subqueries.date.from, 'YYYY-MM-DD') : moment()).year()
    subqueries.date.from = moment()
      .year(year)
      .startOf('year')
      .format('YYYY-MM-DD')
    subqueries.date.to = moment()
      .year(year)
      .endOf('year')
      .format('YYYY-MM-DD')

    subqueries[`${codeColumnName}IsNotNull`]  = {// shoulebe carrierIsNotNull/shipperIsNotNull/controllingCustomerIsNotNull
      value : true
    }

    params.fields = [
      // select Month statistics
      ...summaryVariables.map(variable => `${variable}Month`),
      codeColumnName,
      nameColumnName
    ]

    // group by
    params.groupBy = [
      codeColumnName
    ]

    // // warning, will orderBy cbmMonth, if choose cbm as summaryVariables
    // params.sorting = new OrderBy(`total_${summaryVariables[0]}`, 'DESC')

    params.sorting = []

    if (subqueries.sorting && subqueries.sorting.value) {

      const sortingValueList = subqueries.sorting.value as string[]

      sortingValueList.forEach(sortingValue => {

        // will try to find in sortingExpressionMap first, if not found , just use the normal value
        const orderByExpression = guessSortingExpression(sortingValue, subqueries)
        params.sorting.push(orderByExpression)

      })

    }

    else {

      params.sorting = new OrderBy(`total_${summaryVariables[0]}`, 'DESC')

    }

    params.limit = topX

    return params
  }
}

function finalQuery()
{

  return function(require, session, params) {

    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]

    const {
      OrderBy,
      CreateTableJQL,
      Query,
      ResultColumn,
      ColumnExpression,
      FunctionExpression,
      IsNullExpression,
      FromTable,
      BadRequestException
    } = require('node-jql')

    const subqueries = (params.subqueries = params.subqueries || {})
    // groupBy variable
    const groupByEntity = subqueries.groupByEntity.value // should be shipper/consignee/agent/controllingCustomer/carrier

    const codeColumnName = groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierCode` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyCode`
    const nameColumnName = (groupByEntity === 'houseNo' ? 'houseNo' : groupByEntity === 'carrier' ? `carrierName` : groupByEntity === 'agentGroup' ? 'agentGroup' : groupByEntity === 'moduleType' ? 'moduleTypeCode' : `${groupByEntity}PartyShortNameInReport`) + `Any`


    let summaryVariables: string[] = []
    if (subqueries.summaryVariables && subqueries.summaryVariables.value)
    {
      // sumamary variable
      summaryVariables = Array.isArray(subqueries.summaryVariables.value ) ? subqueries.summaryVariables.value  : [subqueries.summaryVariables.value ]
    }

    if (subqueries.summaryVariable && subqueries.summaryVariable.value)
    {
      summaryVariables = [...new Set([...summaryVariables, subqueries.summaryVariable.value] as string[])]
    }

    if (!(summaryVariables && summaryVariables.length)){
      throw new Error('MISSING_summaryVariables')
    }

    const columns = [
      { name: nameColumnName, type: 'string' },
      { name: codeColumnName, type: 'string' },
    ]

    const $select = [
      new ResultColumn(new ColumnExpression(codeColumnName), 'code'),
      new ResultColumn(new ColumnExpression(nameColumnName), 'name'),
      new ResultColumn(new Value(groupByEntity), 'groupByEntity'),
    ]

    summaryVariables.map(variable => {
      months.map(month => {
        columns.push({ name: `${month}_${variable}`, type: 'number' })
        $select.push(new ColumnExpression(`${month}_${variable}`))

      })
      columns.push({ name: `total_${variable}`, type: 'number' })
      $select.push(new ColumnExpression(`total_${variable}`))
    })

    return new Query({
      $select,
      $from: new FromTable(
        {
          method: 'POST',
          url: 'api/shipment/query/shipment',
          columns
        },
        'shipment'
      )
    })

  }
}

export default [

  [prepareParams(), finalQuery()]
]

export const filters = [

  // for this filter, user can only select single,
  // but when config in card definition, use summaryVariables. Then we can set as multi

  {
    display: 'topX',
    name: 'topX',
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
      multi : false,
      required: true,
    },
    type: 'list',
  },
  {
    display: 'summaryVariable',
    name: 'summaryVariable',
    props: {
      items: [

        {
          label: 'chargeableWeight',
          value: 'chargeableWeight',
        },
        {
          label: 'grossWeight',
          value: 'grossWeight',
        },
        {
          label: 'cbm',
          value: 'cbm',
        },
        {
          label: 'totalShipment',
          value: 'totalShipment',
        },
        {
          label: 'teu',
          value: 'teu',
        },
        {
          label: 'teuInReport',
          value: 'teuInReport',
        },

        {
          label: 'quantity',
          value: 'quantity',
        },
      ],
      multi : false,
      required: true,
    },
    type: 'list',
  },
  {
    display: 'groupByEntity',
    name: 'groupByEntity',
    props: {
      items: [
        {
          label: 'carrier',
          value: 'carrier',
        },
        {
          label: 'shipper',
          value: 'shipper',
        },
        {
          label: 'consignee',
          value: 'consignee',
        },
        {
          label: 'agent',
          value: 'agent',
        },
        {
          label: 'agentGroup',
          value: 'agentGroup',
        },

        {
          label: 'controllingCustomer',
          value: 'controllingCustomer',
        },

        {
          label: 'linerAgent',
          value: 'linerAgent',
        },

        {
          label: 'roAgent',
          value: 'roAgent',
        },
        {
          label: 'office',
          value: 'office',
        },
        {
          label : 'moduleType',
          value : 'moduleType'
        },
        {
          label : 'houseNo',
          value : 'houseNo'
        }
      ],
      required: true,
    },
    type: 'list',
  },

  {
    display: 'sorting',
    name: 'sorting',
    type: 'list',
    props: {
      multi: true,
      items: [

        {
          label: 'total_totalShipment_ASC',
          value: 'total_totalShipment_ASC'
        },

        {
          label: 'total_totalShipment_DESC',
          value: 'total_totalShipment_DESC'
        },
        {
          label: 'total_summaryVariable_ASC',
          value: 'total_summaryVariable_ASC'
        },
        {
          label: 'total_summaryVariable_DESC',
          value: 'total_summaryVariable_DESC'
        }
      ]
    }

  }
] */
