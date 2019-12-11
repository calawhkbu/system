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
    $distinct: true,
    $from: new FromTable(
      `
        (
          SELECT
            tracking_reference.*, masterNo AS trackingNo, 'masterNo' AS type
          FROM
            tracking_reference
          WHERE
            tracking_reference.deletedAt IS NULL
            AND
            tracking_reference.deletedBy IS NULL
          UNION
          SELECT
            tracking_reference.*, soTable.trackingNo AS trackingNo, 'soNo' AS type
          FROM
            tracking_reference,
            JSON_TABLE(soNo, "$[*]" COLUMNS (trackingNo VARCHAR(100) PATH "$")) soTable
          WHERE
            tracking_reference.deletedAt IS NULL
            AND
            tracking_reference.deletedBy IS NULL
          UNION
          SELECT
            tracking_reference.*, containerTable.trackingNo AS trackingNo, 'containerNo' AS type
          FROM
            tracking_reference,
            JSON_TABLE(containerNo, "$[*]" COLUMNS (trackingNo VARCHAR(100) PATH "$")) containerTable
          WHERE
            tracking_reference.deletedAt IS NULL
            AND
            tracking_reference.deletedBy IS NULL
        )
      `,
      'tracking_reference',
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
      )
    ),
  })
)

query
  .register(
    'trackingNos',
    new Query({
      $where: new InExpression(new ColumnExpression('tracking_reference', 'trackingNo'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'trackingNo',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('tracking_reference', 'trackingNo'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'trackingType',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('tracking_reference', 'trackingType'), '='),
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
