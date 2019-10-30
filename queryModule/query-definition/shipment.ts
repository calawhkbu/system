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

// warning : this file should not be called since the shipment should be getting from outbound but not from internal

const query = new QueryDef(
  new Query({
    $distinct: true,

    $select: [new ResultColumn(new ColumnExpression('shipment', '*'))],

    $from: new FromTable('shipment'),
  })
)

// -------- register field
query.register(
  'jobMonth',
  new ResultColumn(
    new FunctionExpression('DATE_FORMAT', new ColumnExpression('shipment', 'jobDate'), '%Y-%m'),
    'jobMonth'
  )
)

query.register(
  'cbmTotal',
  new ResultColumn(
    new FunctionExpression('SUM', new ColumnExpression('shipment', 'cbm')),
    'cbmTotal'
  )
)

query.register(
  'grossWeightTotal',
  new ResultColumn(
    new FunctionExpression('SUM', new ColumnExpression('shipment', 'grossWeight')),
    'grossWeightTotal'
  )
)

query.register(
  'chargeableWeightTotal',

  new ResultColumn(
    new FunctionExpression('SUM', new ColumnExpression('shipment', 'chargeableWeight')),
    'chargeableWeightTotal'
  )
)

query.register(
  'primaryKeyListString',
  new ResultColumn(
    new FunctionExpression('GROUP_CONCAT', new ColumnExpression('shipment', 'houseNo')),
    'primaryKeyListString'
  )
)

// -------- register filter

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

export default query
