import { QueryDef } from 'classes/query/QueryDef'
import {
  BetweenExpression,
  BinaryExpression,
  ColumnExpression,
  FromTable,
  JoinClause,
  Query,
  IsNullExpression,
  RegexpExpression,
  AndExpressions,
  FunctionExpression,
  OrExpressions,
  Unknown,
  Value,
} from 'node-jql'

const query = new QueryDef(
  new Query({
    $from: new FromTable(
      'tracking',
      new JoinClause(
        'LEFT',
        new FromTable({
          table: `
          (
            (
              SELECT \`tracking_reference\`.*, \`masterNo\` AS \`trackingNo\`, 'masterNo' AS \`type\`
              FROM \`tracking_reference\`
            )
            UNION
            (
              SELECT \`tracking_reference\`.*, \`soTable\`.\`trackingNo\`, 'soNo' AS \`type\`
              FROM  \`tracking_reference\`,  JSON_TABLE(\`soNo\`, "$[*]" COLUMNS (\`trackingNo\` VARCHAR(100) PATH "$")) \`soTable\`
            )
            UNION (
              SELECT  \`tracking_reference\`.* , \`containerTable\`.\`trackingNo\`, 'containerNo' as \`type\`
              FROM \`tracking_reference\`,  JSON_TABLE(\`containerNo\`, "$[*]" COLUMNS (\`trackingNo\` VARCHAR(100) PATH "$")) \`containerTable\`
            )
          )
          `,
          $as: 'tracking_reference',
        }),
        new BinaryExpression(
          new BinaryExpression(
            new ColumnExpression('tracking', 'trackingNo'),
            '=',
            new ColumnExpression('tracking_reference', 'trackingNo')
          )
        )
      ),
    ),
  })
)

query.register('lastStatus', {
  expression: new FunctionExpression(
    'concat',
    new ColumnExpression('tracking', 'lastStatusCode'),
    ' (',
    new ColumnExpression('tracking', 'lastStatusDescription'),
    ')'
  ),
  $as: 'lastStatus',
})

query.register('id', {
  expression: new ColumnExpression('tracking', 'id'),
  $as: 'id',
})

query.register('trackingNo', new Query({
  $where: new RegexpExpression(new ColumnExpression('tracking', 'trackingNo'), false)
})).register('value', 0)

query.register('date', new Query({
  $where: new BetweenExpression(new ColumnExpression('tracking', 'lastStatusDate'), false)
})).register('from', 0).register('to', 1)

query.register('lastStatus', new Query({
  $where: new BinaryExpression(new ColumnExpression('tracking', 'lastStatus'), '=')
})).register('value', 0)

// isActive
const isActiveConditionExpression = new AndExpressions([
  new IsNullExpression(new ColumnExpression('tracking', 'deletedAt'), false),
  new IsNullExpression(new ColumnExpression('tracking', 'deletedBy'), false),
])
query.registerBoth('isActive', isActiveConditionExpression)
query.registerQuery('isActive', new Query({
  $where : new OrExpressions([
    new AndExpressions([
      new BinaryExpression(new Value('active'), '=', new Unknown('string')),
      // active case
      isActiveConditionExpression
    ]),
    new AndExpressions([
      new BinaryExpression(new Value('deleted'), '=', new Unknown('string')),
      // deleted case
      new BinaryExpression(isActiveConditionExpression, '=', false)
    ])
  ])
})).register('value', 0).register('value', 1)

export default query
