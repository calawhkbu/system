import {
  ColumnExpression,
  CreateTableJQL,
  FromTable,
  BetweenExpression,
  FunctionExpression,
  BinaryExpression,
  GroupBy,
  Query,
  ResultColumn,
} from 'node-jql'
import { parseCode } from 'utils/function'

function prepareParams(): Function {
  return function(require, session, params) {
    // import
    const { BadRequestException } = require('@nestjs/common')
    const moment = require('moment')

    // script
    const subqueries = (params.subqueries = params.subqueries || {})

    if (!subqueries.withinHours) throw new BadRequestException('MISSING_withinHours')

    const withinHours = params.subqueries.withinHours
    subqueries.createdAt = {
      from: moment().subtract(withinHours.value, 'hours'),
      to: moment(),
    }

    subqueries.entityType = {
      value: 'shipment',
    }

    subqueries.categories = {
      value: ['Exception', 'Notification'],
    }

    return params
  }
}

const query = new Query({
  $select: [
    new ResultColumn(
      new FunctionExpression('CONCAT', new ColumnExpression('alert', 'alertType'), 'Title'),
      'alertTypeTitle'
    ),
    new ResultColumn('alertType'),
    new ResultColumn(
      new FunctionExpression('COUNT', new ColumnExpression('alert', 'alertType')),
      'count'
    ),
    new ResultColumn(
      new FunctionExpression('GROUP_CONCAT', new ColumnExpression('alert', 'primaryKey')),
      'primaryKeyListString'
    ),
  ],
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/alert/query/alert',
      columns: [
        { name: 'alertType', type: 'string' },
        { name: 'tableName', type: 'string' },
        { name: 'primaryKey', type: 'number' },
      ],
    },
    'alert'
  ),

  $group: new GroupBy([new ColumnExpression('alertType')]),
})

export default [[prepareParams(), query]]
