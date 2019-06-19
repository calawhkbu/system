import { QueryDef } from 'classes/query/QueryDef'
import { Query, TableOrSubquery, BinaryExpression, ColumnExpression, InExpression, LikeExpression, IsNullExpression } from 'node-jql'

const query = new QueryDef(new Query({
  $from: new TableOrSubquery(['template', 't'])
}))

query.register('partyGroupCode', new Query({
  $where: new BinaryExpression({ left: new ColumnExpression(['t', 'partyGroupCode']), operator: '=' })
})).register('value', 0)

query.register('fileType', new Query({
  $where: new BinaryExpression({ left: new ColumnExpression(['t', 'fileType']), operator: '=' })
})).register('value', 0)

query.register('templateName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression(['t', 'templateName']), operator: 'REGEXP' })
})).register('value', 0)

query.register('isActive', new Query({
  $where: [
    new IsNullExpression({ left: new ColumnExpression(['t', 'deletedAt']) }),
    new IsNullExpression({ left: new ColumnExpression(['t', 'deletedBy']) }),
  ]
}))

export default query
