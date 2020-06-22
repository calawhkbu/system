import { QueryDef } from 'classes/query/QueryDef'
import {
  BinaryExpression,
  ColumnExpression,
  FromTable,
  JoinClause,
  Query,
  ResultColumn,
  FunctionExpression
} from 'node-jql'

const query = new QueryDef(
  new Query({
    $select: [
      new ResultColumn(new ColumnExpression('tracking', 'lastStatusCode')),
      new ResultColumn(
        new FunctionExpression(
          'SUM',
          new ColumnExpression('shipment_cargo', 'volumeWeight')
        ),
        'cargo_volumeWeight'
      ),
    ],
    $from: new FromTable(
      new Query({
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
      }),
      'tracking',
      {
        operator: 'LEFT',
        table: new FromTable({
          table: new Query({
            $select: [

            ],
            $from: [
              new FromTable(
                `
                select id, masterNo as trackingNo
                  from shipment
                  UNION
                select shipmentId, carrierBookingNo as trackingNo
                  from shipment_container sc_cbn
                  UNION
                select shipmentId, containerNo as trackingNo
                  from shipment_container sc_cn
                `,
                'shipment_tracking'
              ),
              new FromTable('shipment', 'shipment'),
            ],
            $where: []
          }),
          $as: 'shipment'
        }),
        $on: [
          new BinaryExpression(
            new ColumnExpression('shipment', 'id'),
            '=',
            new ColumnExpression('shipment_amount', 'shipment_amount_shipmentId')
          ),
        ]
      }
    ),
  })
)

export default query
