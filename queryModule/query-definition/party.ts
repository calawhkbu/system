import { QueryDef } from 'classes/query/QueryDef'
import { Query, TableOrSubquery, LikeExpression, ColumnExpression } from 'node-jql'

const query = new QueryDef(new Query({
  $from: new TableOrSubquery(['party', 'p'])
}))

query.register('name', new Query({
  $where: new LikeExpression({ left: new ColumnExpression(['p', 'name']) })
})).register('value', 0)

export default query
