import { QueryDef } from 'classes/query/QueryDef'
import { Query, TableOrSubquery } from 'node-jql'

const query = new QueryDef(new Query({
  $from: new TableOrSubquery(['template', 't'])
}))

query.register('fileType', new Query({
  $where: new BinaryExpression({ left: new ColumnExpression(['f', 'fileType']), operator: '=' })
})).register('value', 0)

query.register('fileTypes', new Query({
  $where: new InExpression({ left: new ColumnExpression(['f', 'fileType']) })
})).register('value', 0)

query.register('templateName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression(['f', 'templateName']), operator: 'REGEXP' })
})).register('value', 0)

export default query
