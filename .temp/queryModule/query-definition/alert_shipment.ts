import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
  FromTable,
  BinaryExpression,
  ColumnExpression,
  BetweenExpression,
  InExpression,
  FunctionExpression,
  Unknown,
  IsNullExpression,
  ResultColumn,
  MathExpression,
} from 'node-jql'
const query = new QueryDef(
  new Query({
    $select: [
      new ResultColumn(new ColumnExpression('alert', '*')),
      new ResultColumn(new ColumnExpression('shipment', '*')),
    ],

    $from: new FromTable(
      'alert',
      {
        operator: 'LEFT',
        table: 'shipment',
        $on: [
          new BinaryExpression(new ColumnExpression('alert', 'tableName'), '=', 'shipment'),
          new BinaryExpression(
            new ColumnExpression('alert', 'primaryKey'),
            '=',
            new ColumnExpression('shipment', 'houseNo')
          ),
        ],
      }
    ),
  })
)

query
  .register(
    'alertType',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('alert', 'alertType'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'createdAt',
    new Query({
      $where: new BetweenExpression(new ColumnExpression('alert', 'createdAt'), false),
    })
  )
  .register('from', 0)
  .register('to', 1)

query
  .register(
    'entityType',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('alert', 'tableName'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'categories',
    new Query({
      $where: new InExpression(new ColumnExpression('alert', 'alertCategory'), false),
    })
  )
  .register('value', 0)
query
  .register(
    'severity',
    new Query({
      $where: new InExpression(new ColumnExpression('alert', 'severity'), false),
    })
  )
  .register('value', 0)
query
  .register(
    'moduleType',
    new Query({
      $where: new BinaryExpression(
        new MathExpression(
          new ColumnExpression('flex_data', 'data'),
          '->>',
          '$.entity.moduleType.code'
        ),
        '='
      ),
    })
  )
  .register('value', 1)
query.register(
  'isActive',
  new Query({
    $where: [
      new IsNullExpression(new ColumnExpression('code_master', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('code_master', 'deletedBy'), false),
      new IsNullExpression(new ColumnExpression('flex_data', 'deletedBy'), false),
      new IsNullExpression(new ColumnExpression('flex_data', 'deletedBy'), false),
    ],
  })
)
export default query
