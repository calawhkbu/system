import { QueryDef } from 'classes/query/QueryDef'
import {
  BinaryExpression,
  ColumnExpression,
  Query,
  AndExpressions,
  IsNullExpression,
  FromTable,
  OrExpressions,
  Value,
  Unknown
} from 'node-jql'

const query = new QueryDef(new Query({
  $from: new FromTable('schedule', 'schedule', {
    operator: 'LEFT',
    table: new FromTable('code_master', 'carrier'),
    $on: [
      new BinaryExpression(
        new ColumnExpression('carrier', 'codeType'),
        '=',
        'CARRIER'
      ),
      new BinaryExpression(
        new ColumnExpression('carrier', 'code'),
        '=',
        new ColumnExpression('schedule', 'carrierCode')
      ),
    ],
  }, {
    operator: 'LEFT',
    table: new FromTable('location', 'portOfLoading'),
    $on: [
      new BinaryExpression(
        new ColumnExpression('portOfLoading', 'portCode'),
        '=',
        new ColumnExpression('schedule', 'portOfLoadingCode')
      ),
    ],
  }, {
    operator: 'LEFT',
    table: new FromTable('location', 'portOfDischarge'),
    $on: [
      new BinaryExpression(
        new ColumnExpression('portOfDischarge', 'portCode'),
        '=',
        new ColumnExpression('schedule', 'portOfDischargeCode')
      ),
    ],
  })
}))

// fields
query.register('id', {
  expression: new ColumnExpression('schedule', 'id'),
  $as: 'id',
})
query.register('carrier', {
  expression: new ColumnExpression('carrier', 'name'),
  $as: 'carrier',
})
query.register('portOfLoading', {
  expression: new ColumnExpression('portOfLoading', 'name'),
  $as: 'portOfLoading',
})
query.register('portOfDischarge', {
  expression: new ColumnExpression('portOfDischarge', 'name'),
  $as: 'portOfDischarge',
})

// query
query.register('isActive', new Query({
  $where : new OrExpressions([
    new AndExpressions([
      new BinaryExpression(new Value('active'), '=', new Unknown('string')),
      // active case
      new IsNullExpression(new ColumnExpression('schedule', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('schedule', 'deletedBy'), false)
    ]),
    new AndExpressions([
      new BinaryExpression(new Value('deleted'), '=', new Unknown('string')),
      // deleted case
      new IsNullExpression(new ColumnExpression('schedule', 'deletedAt'), true),
      new IsNullExpression(new ColumnExpression('schedule', 'deletedBy'), true)
    ])
  ])
}))
.register('value', 0)
.register('value', 1)

export default query
