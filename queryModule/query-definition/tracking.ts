import { QueryDef } from 'classes/query/QueryDef'
import { arrayMap } from 'classes/query/utils'
import { BetweenExpression, BinaryExpression, ColumnExpression, FromTable, FunctionExpression, InExpression, JoinClause, Query, Value } from 'node-jql'

const query = new QueryDef(new Query({
  $from: new FromTable('tracking',
    new JoinClause('LEFT', 'tracking_reference', new BinaryExpression(
      new ColumnExpression('tracking', 'id'), '=', new ColumnExpression('tracking_reference', 'id')
    )),
    new JoinClause('LEFT', 'flex_data', new BinaryExpression(
      new BinaryExpression(new ColumnExpression('flex_data', 'tableName'), '=', 'tracking'),
      new BinaryExpression(new ColumnExpression('tracking', 'id'), '=', new ColumnExpression('flex_data', 'primaryKey'))
    ))
  ),
}))

query.register('branch', arrayMap(value => new BinaryExpression(
  new FunctionExpression('JSON_CONTAINS',
    new ColumnExpression('flex_data', 'data'),
    new Value(value),
    '$.branch'
  ),
  '=',
  1
)))

query.register('data', new Query({
  $where: new BetweenExpression(new ColumnExpression('tracking', 'lastStatusDate'), false)
})).register('from', 0).register('to', 0)

query.register('moduleType', new Query({
  $where: new BinaryExpression(
    new FunctionExpression('JSON_UNQUOTE',
      new FunctionExpression('JSON_EXTRACT', new ColumnExpression('flex_data', 'data'), '$.moduleType')
    ),
    '='
  )
})).register('value', 0)

query.register('boundType', new Query({
  $where: new BinaryExpression(
    new FunctionExpression('JSON_UNQUOTE',
      new FunctionExpression('JSON_EXTRACT', new ColumnExpression('flex_data', 'data'), '$.boundType')
    ),
    '='
  )
})).register('value', 0)

query.register('masterNo', new Query({
  $where: new InExpression(new ColumnExpression('tracking_reference', 'masterNo'), false)
})).register('value', 0)

query.register('lastStatus', new Query({
  $where: new BinaryExpression(new ColumnExpression('tracking', 'lastStatus'), '=')
})).register('value', 0)

export default query
