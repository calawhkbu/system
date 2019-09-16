import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
  FromTable,
  BinaryExpression,
  ColumnExpression,
  RegexpExpression,
  IsNullExpression,
  ResultColumn,
  BetweenExpression,
  FunctionExpression,
  InExpression,
  GroupBy,
} from 'node-jql'

const query = new QueryDef(
  new Query({
    $distinct: true,

    $select: [new ResultColumn(new ColumnExpression('shipment', '*'))],

    $from: new FromTable('shipment'),
  })
)

// use houseNo as primarykey list
query
  .register(
    'primaryKeyList',
    new Query({
      $where: new InExpression(new ColumnExpression('shipment', 'houseNo'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'date',
    new Query({
      $where: new BetweenExpression(new ColumnExpression('shipment', 'jobDate'), false),
    })
  )
  .register('from', 0)
  .register('to', 1)

// used createdAt as jobMonth
query.register('jobMonth', {
  expression: new FunctionExpression({
    name: 'DATE_FORMAT',
    parameters: [new ColumnExpression('shipment', 'jobDate'), '%y-%m'],
  }),
  $as: 'jobMonth',
})

query
  .register(
    'moduleType',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('shipment', 'moduleType'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'carrierCode',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('shipment', 'carrierCode'), '='),
    })
  )
  .register('value', 0)

query.register(
  'chargeableWeightTotal',

  new ResultColumn(
    new FunctionExpression('SUM', new ColumnExpression('shipment', 'chargeableWeight')),
    'chargeableWeightTotal'
  )
)

export default query
