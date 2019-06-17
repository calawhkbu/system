import { QueryDef } from 'classes/query/QueryDef'
import { Query, TableOrSubquery, BinaryExpression, ColumnExpression, OrExpressions, LikeExpression } from 'node-jql'

const query = new QueryDef(new Query({
  $from: new TableOrSubquery(['code_master', 'c'])
}))

query.register('codeType', new Query({
  $where: new BinaryExpression({ left: new ColumnExpression(['c', 'codeType']), operator: '=' })
}))
  .register('value', 0)

query.register('code', new Query({
  $where: new BinaryExpression({ left: new ColumnExpression(['c', 'code']), operator: '=' })
}))
  .register('value', 0)

query.register('q', new Query({
  $where: new OrExpressions({
    expressions: [
      new LikeExpression({ left: new ColumnExpression(['c', 'code']), operator: 'REGEXP' }),
      new LikeExpression({ left: new ColumnExpression(['c', 'name']), operator: 'REGEXP' })
    ]
  })
}))
  .register('value', 0)
  .register('value', 1)

export default query
