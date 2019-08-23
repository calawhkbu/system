import { QueryDef } from 'classes/query/QueryDef'
import {
  BinaryExpression,
  ColumnExpression,
  InExpression,
  Query,
  OrExpressions,
  RegexpExpression,
} from 'node-jql'

const query = new QueryDef(new Query('location'))

query
  .register(
    'moduleTypeCode',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('moduleTypeCode'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'ports',
    new Query({
      $where: new InExpression(new ColumnExpression('portCode'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'q',
    new Query({
      $where: new OrExpressions({
        expressions: [
          new RegexpExpression(new ColumnExpression('portCode'), false),
          new RegexpExpression(new ColumnExpression('name'), false),
        ],
      }),
    })
  )
  .register('value', 0)
  .register('value', 1)

export default query
