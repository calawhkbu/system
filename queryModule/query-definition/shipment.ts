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
} from 'node-jql'

const query = new QueryDef(new Query({

    $distinct: true,

    $select : [

        new ResultColumn(new ColumnExpression('shipment', '*')),
    ],

    $from : new FromTable('shipment'),
}))

query
  .register(
    'date',
    new Query({
      $where: new BetweenExpression(new ColumnExpression('shipment', 'jobDate'), false),
    })
  )
  .register('from', 0)
  .register('to', 1)

  query
  .register(
    'moduleType',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('shipment', 'moduleType'), '='),
    })
  )
  .register('value', 0)

export default query
