import {
  ColumnExpression,
  CreateTableJQL,
  FromTable,
  FunctionExpression,
  GroupBy,
  Query,
  ResultColumn,
  Value,
} from 'node-jql'
import moment = require('moment')

const shipmentBottomSheetId = 'cb22011b-728d-489b-a64b-b881914be600'
const bookingBottomSheetId = 'bde2d806-d2bb-490c-b3e3-9e4792f353dd'

function prepareParams(): Function {
  return function(require, session, params) {
    // import
    const { BadRequestException } = require('@nestjs/common')

    // script
    const subqueries = (params.subqueries = params.subqueries || {})

    if (!subqueries.entityType) throw new Error('MISSING_ENTITY_TYPE')
    if (['shipment', 'booking', 'purchase-order'].indexOf(subqueries.entityType.value) === -1)
      throw new Error(
        `INVALID_ENTITY_TYPE_${String(subqueries.type.value).toLocaleUpperCase()}`
      )

    if (!subqueries.withinHours) throw new Error('MISSING_withinHours')

    const withinHours = params.subqueries.withinHours

    // const alertCreatedAtJson = {
    //     from : moment('2018-01-01'),
    //     to : moment()
    //   }

    const alertCreatedAtJson = {
      from : moment().subtract(withinHours.value, 'hours'),
      to : moment()
    }

    subqueries.alertCreatedAt = alertCreatedAtJson

    subqueries.alertStatus = {
      value : ['open']
    }

    subqueries.alertCategory = {
      value : ['Exception', 'Notification']
    }

    subqueries.date = undefined

    subqueries.alertJoin = true

    params.fields = ['alertType', 'alertCategory', 'tableName', 'count']
    params.groupBy = ['alertType', 'alertCategory', 'tableName']

    return params
  }
}

function finalQuery(): Function {

  return function(require, session, params) {
    // import
    const { BadRequestException } = require('@nestjs/common')

    // script
    const subqueries = (params.subqueries = params.subqueries || {})

    const entityType = subqueries.entityType.value

    const withinHours = params.subqueries.withinHours

    // const alertCreatedAtJson = {
    //     from : moment('2018-01-01'),
    //     to : moment()
    //   }

    const alertCreatedAtJson = {
      from : moment().subtract(withinHours.value, 'hours'),
      to : moment()
    }

    let bottomSheetId

    if (entityType === 'shipment')
    {
      bottomSheetId = shipmentBottomSheetId
    }

    else if (entityType === 'booking')
    {
      bottomSheetId = bookingBottomSheetId
    }

    return new Query({

      $select : [
        new ResultColumn('alertCategory'),
        new ResultColumn('alertType'),
        new ResultColumn('tableName'),
        new ResultColumn('count'),
        new ResultColumn(new Value(bottomSheetId), `bottomSheetId`)
      ],

      $from: new FromTable(
        {
          method: 'POST',
          url: `api/${entityType}/query/${entityType}`,
          columns: [
            {
              name: 'alertCategory',
              type: 'string',
            },
            {
              name: 'alertType',
              type: 'string',
            },
            {
              name: 'tableName',
              type: 'string',
            },

            { name: 'count', type: 'number'},
          ],
        },
        'alert'
      )
    })

  }

}

export default [
  [
    prepareParams(), finalQuery()
  ],
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
  },
  {
    name : 'withinHours',
    props : {
      items : [
        {
          label : '12hrs',
          value : 12
        },
        {
          label : '24hrs',
          value : 24
        },
        {
          label : '36hrs',
          value : 36
        }
      ]
    },
    type : 'list'
  }
]
