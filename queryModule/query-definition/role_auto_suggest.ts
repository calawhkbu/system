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
      'role'
    ),
  })
)

query
  .register(
    'id',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('role', 'id'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'partyGroupCode',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('role', 'partyGroupCode'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'q',
    new Query({
      $where: new OrExpressions([
        new RegexpExpression(new ColumnExpression('role', 'roleGroup'), false, new Unknown('string')),
        new RegexpExpression(new ColumnExpression('role', 'roleName'), false, new Unknown('string')),
      ]),
    })
  )
  .register('value', 0)
  .register('value', 1)

  query
  .register(
    'roleGroupLike',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('role', 'roleGroup'), false, new Unknown('string')),
    })
  )
  .register('value', 0)

export default query
