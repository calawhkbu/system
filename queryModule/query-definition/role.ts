import { QueryDef } from 'classes/query/QueryDef'
import { Query, TableOrSubquery, LikeExpression, ColumnExpression, InExpression, BinaryExpression, IsNullExpression } from 'node-jql'

const query = new QueryDef(new Query({
  $from: new TableOrSubquery(['role', 'r'])
}))

query.register('id', new Query({
  $where: new BinaryExpression({ left: new ColumnExpression(['r', 'id']), operator: '=' })
})).register('value', 0)

query.register('partyGroupCode', new Query({
  $where: new BinaryExpression({ left: new ColumnExpression(['r', 'partyGroupCode']), operator: '=' })
})).register('value', 0)

query.register('name', new Query({
  $where: new LikeExpression({ left: new ColumnExpression(['r', 'roleName']), operator: 'REGEXP' })
})).register('value', 0)

query.register('group', new Query({
  $where: new InExpression({ left: new ColumnExpression(['r', 'roleGroup']) })
})).register('value', 0)

export default query
