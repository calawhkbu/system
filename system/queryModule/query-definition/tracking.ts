import { QueryDef } from 'classes/query/QueryDef'
import {
  BetweenExpression,
  BinaryExpression,
  ColumnExpression,
  FromTable,
  Query,
  IsNullExpression,
  RegexpExpression,
  AndExpressions,
  FunctionExpression,
  OrExpressions,
  Unknown,
  Value,
  CaseExpression,
} from 'node-jql'
import { registerAll } from 'utils/jql-subqueries'

const query = new QueryDef(new Query({ $from: new FromTable('tracking', 'tracking') }))

const isActiveConditionExpression = new AndExpressions([
  new IsNullExpression(new ColumnExpression('tracking', 'deletedAt'), false),
  new IsNullExpression(new ColumnExpression('tracking', 'deletedBy'), false),
])

const activeStatusExpression = new CaseExpression({
  cases: [
    {
      $when: new BinaryExpression(isActiveConditionExpression, '=', false),
      $then: new Value('deleted')
    }
  ],
  $else: new Value('active')
})

const lastStatusExpression = new FunctionExpression(
  'concat',
  new ColumnExpression('tracking', 'lastStatusCode'),
  ' (',
  new ColumnExpression('tracking', 'lastStatusDescription'),
  ')'
)

const baseTableName = 'tracking'
const fieldList = [
  'id',
  'source',
  'trackingNo',
  'updatedAt',
  'manual',
  'lastStatusCode',
  {
    name: 'activeStatus',
    expression: activeStatusExpression
  },

  {
    name: 'lastStatus',
    expression: lastStatusExpression
  }

]

registerAll(query, baseTableName, fieldList)

// query.register('lastStatus', {
//   expression: new FunctionExpression(
//     'concat',
//     new ColumnExpression('tracking', 'lastStatusCode'),
//     ' (',
//     new ColumnExpression('tracking', 'lastStatusDescription'),
//     ')'
//   ),
//   $as: 'lastStatus',
// })

// query.register('id', {
//   expression: new ColumnExpression('tracking', 'id'),
//   $as: 'id',
// })

// query.register('trackingNo', {
//   expression: new ColumnExpression('tracking', 'trackingNo'),
//   $as: 'trackingNo',
// })

// query.register('updatedAt', {
//   expression: new ColumnExpression('tracking', 'updatedAt'),
//   $as: 'updatedAt',
// })

// query.register('trackingNo', new Query({
//   $where: new RegexpExpression(new ColumnExpression('tracking', 'trackingNo'), false)
// })).register('value', 0)

query.register('date', new Query({
  $where: new BetweenExpression(new ColumnExpression('tracking', 'lastStatusDate'), false)
})).register('from', 0).register('to', 1)

// query.register('lastStatus', new Query({
//   $where: new BinaryExpression(new ColumnExpression('tracking', 'lastStatus'), '=')
// })).register('value', 0)

// query.register('manual', new Query({
//   $where: new BinaryExpression(new ColumnExpression('tracking', 'manual'), '=')
// })).register('value', 0)

export default query
