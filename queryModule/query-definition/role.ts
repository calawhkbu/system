import { QueryDef } from 'classes/query/QueryDef'
import { Query, FromTable, LikeExpression, ColumnExpression, InExpression, BinaryExpression } from 'node-jql'

const query = new QueryDef(new Query({
  $from: new FromTable('role', 'r')
}))

query.register('id', new Query({
  $where: new BinaryExpression(new ColumnExpression('r', 'id'), '=')
})).register('value', 0)

query.register('partyGroupCode', new Query({
  $where: new BinaryExpression(new ColumnExpression('r', 'partyGroupCode'), '=')
})).register('value', 0)

query.register('name', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('r', 'roleName'), operator: 'REGEXP' })
})).register('value', 0)

query.register('group', new Query({
  $where: new InExpression(new ColumnExpression('r', 'roleGroup'))
})).register('value', 0)

export default query
