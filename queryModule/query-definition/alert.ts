import { QueryDef } from 'classes/query/QueryDef'
import { Query, FromTable, BinaryExpression, ColumnExpression, InExpression } from 'node-jql'

const query = new QueryDef(new Query({
  $from: new FromTable('alert', 'a')
}))

query.register('entityType', new Query({
  $where: new BinaryExpression(new ColumnExpression('a', 'tableName'), '=')
})).register('value', 0)

query.register('categories', new Query({
  $where: new InExpression(new ColumnExpression('a', 'alertCategory'))
})).register('value', 0)

query.register('severity', new Query({
  $where: new InExpression(new ColumnExpression('a', 'severity'))
})).register('value', 0)

query.register('status', new Query({
  $where: new InExpression(new ColumnExpression('a', 'status'))
})).register('value', 0)

export default query
