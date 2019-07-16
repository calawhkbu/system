import { QueryDef } from 'classes/query/QueryDef'
import { Query, FromTable, BinaryExpression, ColumnExpression, LikeExpression, IsNullExpression } from 'node-jql'

const query = new QueryDef(new Query({
  $from: new FromTable('template', 't')
}))

query.register('partyGroupCode', new Query({
  $where: new BinaryExpression(new ColumnExpression('t', 'partyGroupCode'), '=')
})).register('value', 0)

query.register('fileType', new Query({
  $where: new BinaryExpression(new ColumnExpression('t', 'fileType'), '=')
})).register('value', 0)

query.register('templateName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('t', 'templateName'), operator: 'REGEXP' })
})).register('value', 0)

query.register('isActive', new Query({
  $where: [
    new IsNullExpression(new ColumnExpression('t', 'deletedAt')),
    new IsNullExpression(new ColumnExpression('t', 'deletedBy')),
  ]
}))

export default query
