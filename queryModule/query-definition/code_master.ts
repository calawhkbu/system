import { QueryDef } from 'classes/query/QueryDef'
import { Query, FromTable, FunctionExpression, Unknown, BinaryExpression, ColumnExpression, OrExpressions, RegexpExpression, IsNullExpression } from 'node-jql'

const query = new QueryDef(new Query({
  $distinct: true,
  $from: new FromTable('code_master', 'code_master', {
    operator: 'LEFT',
    table: new FromTable('flex_data', 'flex_data'),
    $on: [
      new BinaryExpression(new ColumnExpression('flex_data', 'tableName'), '=', 'code_master'),
      new BinaryExpression(new ColumnExpression('code_master', 'id'), '=', new ColumnExpression('flex_data', 'primaryKey'))
    ]
  })
}))

query.register('codeType', new Query({
  $where: new BinaryExpression(new ColumnExpression('code_master', 'codeType'), '=')
})).register('value', 0)

query.register('code', new Query({
  $where: new BinaryExpression(new ColumnExpression('code_master', 'code'), '=')
})).register('value', 0)

query.register('flexDataData', new Query({
  $where: new BinaryExpression(
    new FunctionExpression('JSON_UNQUOTE',
      new FunctionExpression('JSON_EXTRACT', new ColumnExpression('flex_data', 'data'), new Unknown('string'))
    ),
    '='
  )
})).register('flexDataKey', 0).register('value', 1)

query.register('q', new Query({
  $where: new OrExpressions([
    new RegexpExpression(new ColumnExpression('code_master', 'code'), false),
    new RegexpExpression(new ColumnExpression('code_master', 'name'), false)
  ])
})).register('value', 0).register('value', 1)

query.register('isActive', new Query({
  $where: [
    new IsNullExpression(new ColumnExpression('code_master', 'deletedAt'), false),
    new IsNullExpression(new ColumnExpression('code_master', 'deletedBy'), false),
    new IsNullExpression(new ColumnExpression('flex_data', 'deletedBy'), false),
    new IsNullExpression(new ColumnExpression('flex_data', 'deletedBy'), false),
  ]
}))

export default query
