import { QueryDef } from 'classes/query/QueryDef'
import { Query, BinaryExpression, ColumnExpression, FromTable, FunctionExpression, ParameterExpression, ResultColumn } from 'node-jql'

const query = new QueryDef(new Query({
  $from: new FromTable('shipment', 's')
}))

query.register('noOfShipments', new ResultColumn(
  new FunctionExpression('COUNT', new ParameterExpression('DISTINCT', new ColumnExpression('*'))),
  'noOfShipments'
))

query.register('moduleType', new Query({
  $where: new BinaryExpression(new ColumnExpression('s', 'moduleTypeCode'), '=')
})).register('value', 0)

query.register('boundType', new Query({
  $where: new BinaryExpression(new ColumnExpression('s', 'boundTypeCode'), '=')
})).register('value', 0)

export default query
