import { QueryDef } from 'classes/query/QueryDef'
import { Query, BinaryExpression, ColumnExpression, TableOrSubquery, FunctionExpression, ParameterExpression } from 'node-jql'

const query = new QueryDef(new Query({
  $from: new TableOrSubquery(['booking', 'b'])
}))

query.register('noOfShipments', {
  expression: new FunctionExpression({
    name: 'COUNT',
    parameters: new ParameterExpression({
      prefix: 'DISTINCT',
      expression: new ColumnExpression('*')
    })
  }),
  $as: 'noOfShipments'
})

query.register('moduleType', new Query({
  $where: new BinaryExpression({ left: new ColumnExpression(['b', 'moduleTypeCode']), operator: '=' })
}))
  .register('value', 0)

query.register('boundType', new Query({
  $where: new BinaryExpression({ left: new ColumnExpression(['b', 'boundTypeCode']), operator: '=' })
}))
  .register('value', 0)

export default query
