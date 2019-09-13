import { QueryDef } from 'classes/query/QueryDef'
import {
  BinaryExpression,
  ColumnExpression,
  FromTable,
  InExpression,
  JoinClause,
  Query,
} from 'node-jql'

const query = new QueryDef(
  new Query({
    $from: new FromTable({
      table: `
    (SELECT \`tracking_reference\`.*, \`masterNo\` AS \`trackingNo\`, 'masterNo' AS \`type\`
    FROM \`tracking_reference\`
    UNION
    SELECT \`tracking_reference\`.*, \`soTable\`.\`trackingNo\`, 'soNo' AS \`type\`
    FROM  \`tracking_reference\`,  JSON_TABLE(\`soNo\`, "$[*]" COLUMNS (\`trackingNo\` VARCHAR(100) PATH "$")) \`soTable\`
    UNION
    SELECT  \`tracking_reference\`.* , \`containerTable\`.\`trackingNo\`, 'containerNo' as \`type\`
    FROM \`tracking_reference\`,  JSON_TABLE(\`containerNo\`, "$[*]" COLUMNS (\`trackingNo\` VARCHAR(100) PATH "$")) \`containerTable\`)
    `,
      $as: 'tracking_reference',
      joinClauses: [
        new JoinClause(
          'LEFT',
          'tracking',
          new BinaryExpression(
            new BinaryExpression(
              new ColumnExpression('tracking', 'trackingNo'),
              '=',
              new ColumnExpression('tracking_reference', 'trackingNo')
            )
          )
        ),
      ],
    }),
  })
)

query
  .register(
    'trackingNo',
    new Query({
      $where: new InExpression(new ColumnExpression('tracking_reference', 'trackingNo'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'partyGroupCode',
    new Query({
      $where: new BinaryExpression(
        new ColumnExpression('tracking_reference', 'partyGroupCode'),
        '='
      ),
    })
  )
  .register('value', 0)

export default query
