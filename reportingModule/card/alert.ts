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

    params.fields = ['alertType', 'alertCategory', 'tableName', 'count', 'primaryKeyListString']
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

    return new Query({

      $select : [
        new ResultColumn('alertCategory'),
        new ResultColumn('alertType'),
        new ResultColumn('tableName'),
        new ResultColumn('count'),
        new ResultColumn('primaryKeyListString')
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
            {
              name : 'primaryKeyListString',
              type : 'string'
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
