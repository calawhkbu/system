import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
  ResultColumn,
  FromTable,
  OrExpressions,
  RegexpExpression,
  ColumnExpression,
  BinaryExpression,
  InExpression,
  IsNullExpression,
  AndExpressions,
  FunctionExpression,
  Unknown,
  Value,
} from 'node-jql'

const query = new QueryDef(
  new Query({
    $distinct: true,
    $from: new FromTable(
      'i18n'
    ),
  })
)

query
  .register(
    'id',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('i18n', 'id'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'partyGroupCode',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('i18n', 'partyGroupCode'), '='),
    })
  )
  .register('value', 0)

  query
  .register(
    'categoryLike',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('i18n', 'category'), false, new Unknown('string')),
    })
  )
  .register('value', 0)

export default query
