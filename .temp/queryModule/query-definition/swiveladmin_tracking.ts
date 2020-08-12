import { QueryDef } from 'classes/query/QueryDef'
import {
  IsNullExpression,
  ColumnExpression,
  FromTable,
  RegexpExpression,
  AndExpressions,
  Query,
  FunctionExpression,
  OrExpressions,
  Unknown,
  Value,
  BinaryExpression
} from 'node-jql'

const query = new QueryDef(
  new Query({
    $from: new FromTable('tracking'),
  })
)



export default query
