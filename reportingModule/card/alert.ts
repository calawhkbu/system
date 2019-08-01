import { ColumnExpression, CreateTableJQL, FromTable, FunctionExpression, GroupBy, Query, ResultColumn } from 'node-jql'

function prepareParams(): Function {
  return function (require, session, params) {
    // import
    const { BadRequestException } = require('@nestjs/common')

    // script
    const subqueries = params.subqueries = params.subqueries || {}
    if (!subqueries.entityType) throw new BadRequestException('MISSING_ENTITY_TYPE')
    if (['shipment', 'booking', 'purchase-order'].indexOf(subqueries.entityType.value) === -1) throw new BadRequestException(`INVALID_ENTITY_TYPE_${String(subqueries.type.value).toLocaleUpperCase()}`)
    if (!subqueries.lastStatusDate) throw new BadRequestException('MISSING_LAST_STATUS_DATE')
    if (!subqueries.moduleType) throw new BadRequestException('MISSING_MODULE_TYPE')
    return params
  }
}

export default [
  [prepareParams(), new CreateTableJQL({
    $temporary: true,
    name: 'alert',
    $as: new Query({
      $select: [
        new ResultColumn('alertCategory'),
        new ResultColumn('alertType'),
        new ResultColumn(new FunctionExpression('COUNT', new ColumnExpression('alertType')), 'count')
      ],
      $from: new FromTable({
        method: 'POST',
        url: 'api/alert/query/alert',
        columns: [
          { name: 'alert.alertCategory', type: 'string', $as: 'alertCategory' },
          { name: 'alert.alertType', type: 'string', $as: 'alertType' }
        ]
      }, 'alert'),
      $group: new GroupBy([
        new ColumnExpression('alertCategory'),
        new ColumnExpression('alertType')
      ])
    })
  })]
]