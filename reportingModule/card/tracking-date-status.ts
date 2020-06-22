import { JqlDefinition } from 'modules/report/interface'
import { IQueryParams } from 'classes/query'

const shipmentBottomSheetId = 'cb22011b-728d-489b-a64b-b881914be600'
const bookingBottomSheetId = 'bde2d806-d2bb-490c-b3e3-9e4792f353dd'

export default {
  jqls: [
    {
      type: 'prepareParams',
      async prepareParams(params, prevResult, user): Promise<IQueryParams> {
        const { moment } = await this.preparePackages(user)
        const subqueries = params.subqueries || {}

        if (!subqueries.entityType || !(subqueries.entityType !== true && 'value' in subqueries.entityType)) throw new Error('MISSING_ENTITY_TYPE')
        if (['shipment', 'booking', 'purchase-order'].indexOf(subqueries.entityType.value) === -1) {
          throw new Error(`INVALID_ENTITY_TYPE_${String(subqueries.entityType.value).toLocaleUpperCase()}`)
        }

        if (!subqueries.dateStatus || !(subqueries.dateStatus !== true && 'value' in subqueries.dateStatus)) throw new Error('MISSING_dateStatus')

        subqueries.dateStatus = {
          today : moment().format('YYYY-MM-DD'),
          currentTime : moment().format('YYYY-MM-DD HH:mm:ss'),
          ...subqueries.dateStatus
        } as any
        subqueries.dateStatusJoin = true

        params.groupBy = ['dateStatus']
        params.fields = ['primaryKeyListString', 'dateStatus', 'count']

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
      onResult(res, params): any[] {
        let bottomSheetId = shipmentBottomSheetId
        const subqueries = (params.subqueries = params.subqueries || {})
        if (subqueries.entityType && subqueries.entityType !== true && 'value' in subqueries.entityType) {
          if (subqueries.entityType.value === 'booking') bottomSheetId = bookingBottomSheetId
        }
        let dateStatus: string[] = []
        if (subqueries.dateStatus && subqueries.dateStatus !== true && 'value' in subqueries.dateStatus) {
          dateStatus = subqueries.dateStatus.value
        }
        return [dateStatus.reduce<any>((r, status) => {
          const found = res.find(row => row.dateStatus === status)
          if (found) r[`${status}_primaryKeyListString`] = found.primaryKeyListString
          r[`${status}_count`] = res.reduce((r, row) => r + (row.dateStatus === status ? row.count : 0), 0)
          return r
        }, { bottomSheetId })]
      }
    }
  ],
  filters: [
    {
      display: 'entityType',
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
    }
  ]
} as JqlDefinition

/* import {
  ColumnExpression,
  CreateTableJQL,
  FromTable,
  FunctionExpression,
  Query,
  ResultColumn,
  OrderBy,
  JoinClause,
  BinaryExpression,
  IsNullExpression,
  CreateFunctionJQL,
  InExpression,
  Value,
  GroupBy,
} from 'node-jql'

import { parseCode } from 'utils/function'

const shipmentBottomSheetId = 'cb22011b-728d-489b-a64b-b881914be600'
const bookingBottomSheetId = 'bde2d806-d2bb-490c-b3e3-9e4792f353dd'

function prepareParams(): Function {

  const fn = function(require, session, params) {

    // import
    const { moment } = params.packages
    // script
    const subqueries = params.subqueries || {}

    if (!subqueries.entityType) throw new Error('MISSING_ENTITY_TYPE')
    if (['shipment', 'booking', 'purchase-order'].indexOf(subqueries.entityType.value) === -1)
      throw new Error(
        `INVALID_ENTITY_TYPE_${String(subqueries.type.value).toLocaleUpperCase()}`
      )

    if (!subqueries.dateStatus || !subqueries.dateStatus.value)
      throw new Error('MISSING_dateStatus')

    subqueries.dateStatus = {

      today : moment().format('YYYY-MM-DD'),
      currentTime : moment().format('YYYY-MM-DD HH:mm:ss'),
      ...subqueries.dateStatus
    }
    subqueries.dateStatusJoin = true

    params.groupBy = ['dateStatus']
    params.fields = ['primaryKeyListString', 'dateStatus', 'count']

    return params
  }

  const code = fn.toString()
  return parseCode(code)
}

function prepareFinalQuery() {
  return function(require, session, params) {

    const subqueries = params.subqueries || {}

    const entityType = subqueries.entityType.value

    let bottomSheetId

    if (entityType === 'shipment') {
      bottomSheetId = shipmentBottomSheetId
    }

    else if (entityType === 'booking') {
      bottomSheetId = bookingBottomSheetId
    }

    const dateStatusList = subqueries.dateStatus.value as string[]

    const $select = [
      new ResultColumn(new Value(bottomSheetId), 'bottomSheetId')
    ]

    dateStatusList.map(status => {

      $select.push(new ResultColumn(
        new FunctionExpression('FIND',

          new BinaryExpression(new ColumnExpression('dateStatus'), '=', status),
          new ColumnExpression('primaryKeyListString')
        ), `${status}_primaryKeyListString`))

      $select.push(
        new ResultColumn(
          new FunctionExpression('IFNULL',
            new FunctionExpression('SUM',
              new FunctionExpression('IF', new BinaryExpression(new ColumnExpression('dateStatus'), '=', status), new ColumnExpression('count'), 0)
            ),
            0),
          `${status}_count`)
      )

    })

    return new Query({
      $select,
      $from: new FromTable(
        {
          method: 'POST',
          url: `api/${entityType}/query/${entityType}`,
          columns: [
            {
              name: 'count',
              type: 'number',
            },
            {
              name: 'dateStatus',
              type: 'string'
            },
            {
              name: 'primaryKeyListString',
              type: 'string'
            }
          ],
        },
        'tracking'
      ),
    })
  }
}

export default [

  [prepareParams(), prepareFinalQuery()]

]

export const filters = [
  // currently comment out
  {
    display: 'entityType',
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
  }
] */
