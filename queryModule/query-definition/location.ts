import { QueryDef } from 'classes/query/QueryDef'
import { BinaryExpression, ColumnExpression, InExpression, Query } from 'node-jql'

const query = new QueryDef(new Query('location'))

query.register('moduleType', new Query({
  $where: new BinaryExpression(new ColumnExpression('moduleTypeCode'), '=')
})).register('value', 0)

query.register('ports', new Query({
  $where: new InExpression(new ColumnExpression('portCode'), false)
})).register('value', 0)

export default query