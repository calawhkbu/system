import {
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

    if (!subqueries.lastStatus || !subqueries.lastStatus.value)
      throw new Error('MISSING_lastStatus')

    subqueries.lastStatusJoin = true

    params.groupBy = ['lastStatus']
    params.fields = ['primaryKeyListString', 'lastStatus', 'count']

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

    const lastStatusList = subqueries.lastStatus.value as string[]

    const $select = [
      new ResultColumn(new Value(bottomSheetId), 'bottomSheetId')
    ]

    lastStatusList.map(status => {

      $select.push(new ResultColumn(
        new FunctionExpression('FIND',

          new BinaryExpression(new ColumnExpression('lastStatus'), '=', status),
          new ColumnExpression('primaryKeyListString')
        ), `${status}_primaryKeyListString`))

      $select.push(
        new ResultColumn(
          new FunctionExpression('IFNULL',
            new FunctionExpression('SUM',
              new FunctionExpression('IF', new BinaryExpression(new ColumnExpression('lastStatus'), '=', status), new ColumnExpression('count'), 0)
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
              name: 'lastStatus',
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
]
