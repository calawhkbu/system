import { QueryDef } from 'classes/query/QueryDef'
import { Query, FromTable, FunctionExpression, Unknown, BinaryExpression, ColumnExpression, OrExpressions, LikeExpression } from 'node-jql'

const query = new QueryDef(new Query({
  $distinct: true,
  $from: new FromTable('code_master', 'c', {
    operator: 'LEFT',
    table: new FromTable('flex_data', 'fd'),
    $on: [
      new BinaryExpression(new ColumnExpression('fd', 'tableName'), '=', 'code_master'),
      new BinaryExpression(new ColumnExpression('c', 'id'), '=', new ColumnExpression('fd', 'primaryKey'))
    ]
  })
}))

query.register('codeType', new Query({
  $where: new BinaryExpression(new ColumnExpression('c', 'codeType'), '=')
})).register('value', 0)

query.register('code', new Query({
  $where: new BinaryExpression(new ColumnExpression('c', 'code'), '=')
})).register('value', 0)

query.register('flexDataData', new Query({
  $where: new BinaryExpression(
    new FunctionExpression('JSON_UNQUOTE',
      new FunctionExpression('JSON_EXTRACT',
        new ColumnExpression('fd', 'data'),
        new Unknown('string')
      )
    ),
    '='
  )
})).register('flexDataKey', 0).register('value', 1)

query.register('q', new Query({
  $where: new OrExpressions([
    new LikeExpression({ left: new ColumnExpression('c', 'code'), operator: 'REGEXP' }),
    new LikeExpression({ left: new ColumnExpression('c', 'name'), operator: 'REGEXP' })
  ])
})).register('value', 0).register('value', 1)

export default query
