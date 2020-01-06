import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
  FromTable,
  BinaryExpression,
  ColumnExpression,
  AndExpressions,
  IsNullExpression,
  ResultColumn,
  FunctionExpression,
  GroupBy,
  ParameterExpression,
  RegexpExpression,
  OrExpressions,
  BetweenExpression,
  InExpression,
  CaseExpression
} from 'node-jql'

// warning : this file should not be called since the shipment should be getting from outbound but not from internal

const query = new QueryDef(
  new Query({
    $distinct: true,
    $select: [
      new ResultColumn(new ColumnExpression('shipment', '*'))
    ],
    $from: new FromTable(
      'shipment',
      {
        operator: 'LEFT',
        table: new FromTable({
          table: new Query({
            $select: [
              new ResultColumn(
                new ColumnExpression('shipment_amount', 'shipmentId'),
                'shipment_amount_shipmentId'
              ),
            ],
            $from: new FromTable('shipment_amount', {
              operator: 'LEFT',
              table: new FromTable('flex_data', 'flex_data'),
              $on: [
              new BinaryExpression(
                  new ColumnExpression('flex_data', 'tableName'),
                  '=',
                  'shipment_amount'
                ),
                new BinaryExpression(
                  new ColumnExpression('flex_data', 'primaryKey'),
                  '=',
                  new ColumnExpression('shipment_amount', 'id')
                ),
              ]
            }),
            $where: new AndExpressions({
              expressions: [
                new IsNullExpression(new ColumnExpression('shipment_amount', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('shipment_amount', 'deletedBy'), false),
                new IsNullExpression(new ColumnExpression('flex_data', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('flex_data', 'deletedBy'), false),
              ]
            }),
            $group: new GroupBy([
              new ColumnExpression('shipment_amount', 'shipmentId')
            ]),
          }),
          $as: 'shipment_amount'
        }),
        $on: [
          new BinaryExpression(
            new ColumnExpression('shipment', 'id'),
            '=',
            new ColumnExpression('shipment_amount', 'shipment_amount_shipmentId')
          ),
        ]
      },
      {
        operator: 'LEFT',
        table: new FromTable({
          table: new Query({
            $select: [
              new ResultColumn(
                new ColumnExpression('shipment_cargo', 'shipmentId'),
                'shipment_cargo_shipmentId'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new ColumnExpression('shipment_cargo', 'commodity'),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'cargo_commodity'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'SUM',
                  new ColumnExpression('shipment_cargo', 'quantity')
                ),
                'cargo_quantity'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new ColumnExpression('shipment_cargo', 'quantityUnit'),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'cargo_quantityUnit'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'SUM',
                  new ColumnExpression('shipment_cargo', 'grossWeight')
                ),
                'cargo_grossWeight'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'SUM',
                  new ColumnExpression('shipment_cargo', 'volumeWeight')
                ),
                'cargo_volumeWeight'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'SUM',
                  new ColumnExpression('shipment_cargo', 'chargeableWeight')
                ),
                'cargo_chargeableWeight'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new ColumnExpression('shipment_cargo', 'weightUnit'),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'container_cargoUnit'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'SUM',
                  new ColumnExpression('shipment_cargo', 'cbm')
                ),
                'cargo_cbm'
              ),
            ],
            $from: new FromTable('shipment_cargo', {
              operator: 'LEFT',
              table: new FromTable('flex_data', 'flex_data'),
              $on: [
              new BinaryExpression(
                  new ColumnExpression('flex_data', 'tableName'),
                  '=',
                  'shipment_cargo'
                ),
                new BinaryExpression(
                  new ColumnExpression('flex_data', 'primaryKey'),
                  '=',
                  new ColumnExpression('shipment_cargo', 'id')
                ),
              ]
            }),
            $where: new AndExpressions({
              expressions: [
                new IsNullExpression(new ColumnExpression('shipment_cargo', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('shipment_cargo', 'deletedBy'), false),
                new IsNullExpression(new ColumnExpression('flex_data', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('flex_data', 'deletedBy'), false),
              ]
            }),
            $group: new GroupBy([
              new ColumnExpression('shipment_cargo', 'shipmentId')
            ]),
          }),
          $as: 'shipment_cargo'
        }),
        $on: [
          new BinaryExpression(
            new ColumnExpression('shipment', 'id'),
            '=',
            new ColumnExpression('shipment_cargo', 'shipment_cargo_shipmentId')
          ),
        ]
      },
      {
        operator: 'LEFT',
        table: new FromTable({
          table: new Query({
            $select: [
              new ResultColumn(
                new ColumnExpression('shipment_container', 'shipmentId'),
                'shipment_container_shipmentId'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new ColumnExpression(
                      'shipment_container',
                      'containerNo'
                    ),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'containerNo'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new ColumnExpression(
                      'shipment_container',
                      'sealNo'
                    ),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'sealNo'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new ColumnExpression(
                      'shipment_container',
                      'sealNo2'
                    ),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'sealNo2'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new ColumnExpression(
                      'shipment_container',
                      'carrierBookingNo'
                    ),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'carrierBookingNo'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new ColumnExpression(
                      'shipment_container',
                      'contractNo'
                    ),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'contractNo'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new ColumnExpression(
                      'shipment_container',
                      'carrierCode'
                    ),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'container_carrierCode'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new ColumnExpression(
                      'shipment_container',
                      'containerType'
                    ),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'containerType'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'SUM',
                  new ColumnExpression('shipment_container', 'quantity')
                ),
                'container_quantity'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new ColumnExpression('shipment_container', 'quantityUnit'),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'container_quantityUnit'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'SUM',
                  new ColumnExpression('shipment_container', 'grossWeight')
                ),
                'container_grossWeight'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'SUM',
                  new ColumnExpression('shipment_container', 'tareWeight')
                ),
                'container_tareWeight'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'SUM',
                  new ColumnExpression('shipment_container', 'contentWeight')
                ),
                'container_contentWeight'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'SUM',
                  new ColumnExpression('shipment_container', 'vgmWeight')
                ),
                'container_vgmWeight'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new ColumnExpression('shipment_container', 'weightUnit'),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'container_weightUnit'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'SUM',
                  new ColumnExpression('shipment_container', 'cbm')
                ),
                'container_cbm'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'SUM',
                  new ColumnExpression('shipment_container', 'loadTEU')
                ),
                'container_loadTEU'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'SUM',
                  new ColumnExpression('shipment_container', 'loadCount')
                ),
                'container_loadCount'
              ),
            ],
            $from: new FromTable('shipment_container', {
              operator: 'LEFT',
              table: new FromTable('flex_data', 'flex_data'),
              $on: [
                new BinaryExpression(
                  new ColumnExpression('flex_data', 'tableName'),
                  '=',
                  'shipment_container'
                ),
                new BinaryExpression(
                  new ColumnExpression('flex_data', 'primaryKey'),
                  '=',
                  new ColumnExpression('shipment_container', 'id')
                ),
              ]
            }),
            $where: new AndExpressions({
              expressions: [
                new IsNullExpression(new ColumnExpression('shipment_container', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('shipment_container', 'deletedBy'), false),
                new IsNullExpression(new ColumnExpression('flex_data', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('flex_data', 'deletedBy'), false),
              ]
            }),
            $group: new GroupBy([
              new ColumnExpression('shipment_container', 'shipmentId')
            ]),
          }),
          $as: 'shipment_container'
        }),
        $on: [
          new BinaryExpression(
            new ColumnExpression('shipment', 'id'),
            '=',
            new ColumnExpression('shipment_container', 'shipment_container_shipmentId')
          ),
        ]
      },
      {
        operator: 'LEFT',
        table: new FromTable({
          table: new Query({
            $select: [
              new ResultColumn(
                new ColumnExpression('shipment_po', 'shipmentId'),
                'shipment_po_shipmentId'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new ColumnExpression('shipment_po', 'poNo'),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'poNo'
              ),
            ],
            $from: new FromTable('shipment_po', {
              operator: 'LEFT',
              table: new FromTable('flex_data', 'flex_data'),
              $on: [
              new BinaryExpression(
                  new ColumnExpression('flex_data', 'tableName'),
                  '=',
                  'shipment_po'
                ),
                new BinaryExpression(
                  new ColumnExpression('flex_data', 'primaryKey'),
                  '=',
                  new ColumnExpression('shipment_po', 'id')
                ),
              ]
            }),
            $where: new AndExpressions({
              expressions: [
                new IsNullExpression(new ColumnExpression('shipment_po', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('shipment_po', 'deletedBy'), false),
                new IsNullExpression(new ColumnExpression('flex_data', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('flex_data', 'deletedBy'), false),
              ]
            }),
            $group: new GroupBy([
              new ColumnExpression('shipment_po', 'shipmentId')
            ]),
          }),
          $as: 'shipment_po'
        }),
        $on: [
          new BinaryExpression(
            new ColumnExpression('shipment', 'id'),
            '=',
            new ColumnExpression('shipment_po', 'shipment_po_shipmentId')
          ),
        ]
      },
      {
        operator: 'LEFT',
        table: new FromTable({
          table: new Query({
            $select: [
              new ResultColumn(
                new ColumnExpression('shipment_reference', 'shipmentId'),
                'shipment_reference_shipmentId'
              ),
            ],
            $from: new FromTable('shipment_reference', {
              operator: 'LEFT',
              table: new FromTable('flex_data', 'flex_data'),
              $on: [
              new BinaryExpression(
                  new ColumnExpression('flex_data', 'tableName'),
                  '=',
                  'shipment_reference'
                ),
                new BinaryExpression(
                  new ColumnExpression('flex_data', 'primaryKey'),
                  '=',
                  new ColumnExpression('shipment_reference', 'id')
                ),
              ]
            }),
            $where: new AndExpressions({
              expressions: [
                new IsNullExpression(new ColumnExpression('shipment_reference', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('shipment_reference', 'deletedBy'), false),
                new IsNullExpression(new ColumnExpression('flex_data', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('flex_data', 'deletedBy'), false),
              ]
            }),
            $group: new GroupBy([
              new ColumnExpression('shipment_reference', 'shipmentId')
            ]),
          }),
          $as: 'shipment_reference'
        }),
        $on: [
          new BinaryExpression(
            new ColumnExpression('shipment', 'id'),
            '=',
            new ColumnExpression('shipment_reference', 'shipment_reference_shipmentId')
          ),
        ]
      },
      {
        operator: 'LEFT',
        table: new FromTable({
          table: new Query({
            $select: [
              new ResultColumn(
                new ColumnExpression('shipment_transport', 'shipmentId'),
                'shipment_transport_shipmentId'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new ColumnExpression('shipment_transport', 'moduleTypeCode'),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'transport_moduleTypeCode'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new ColumnExpression('shipment_transport', 'carrierCode'),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'transport_carrierCode'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new ColumnExpression('shipment_transport', 'vesselName'),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'transport_vesselName'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new ColumnExpression('shipment_transport', 'voyageFlightNumber'),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'transport_voyageFlightNumber'
              ),
            ],
            $from: new FromTable('shipment_transport', {
              operator: 'LEFT',
              table: new FromTable('flex_data', 'flex_data'),
              $on: [
                new BinaryExpression(
                  new ColumnExpression('flex_data', 'tableName'),
                  '=',
                  'shipment_transport'
                ),
                new BinaryExpression(
                  new ColumnExpression('flex_data', 'primaryKey'),
                  '=',
                  new ColumnExpression('shipment_transport', 'id')
                ),
              ]
            }),
            $where: new AndExpressions({
              expressions: [
                new IsNullExpression(new ColumnExpression('shipment_transport', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('shipment_transport', 'deletedBy'), false),
                new IsNullExpression(new ColumnExpression('flex_data', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('flex_data', 'deletedBy'), false),
              ]
            }),
            $group: new GroupBy([
              new ColumnExpression('shipment_transport', 'shipmentId')
            ]),
          }),
          $as: 'shipment_transport'
        }),
        $on: [
          new BinaryExpression(
            new ColumnExpression('shipment', 'id'),
            '=',
            new ColumnExpression('shipment_transport', 'shipment_transport_shipmentId')
          ),
        ]
      }
    ),
  })
)

// -------- register join
query
  .register(
    'flex_data_join',
    new Query({
      $from: new FromTable(
        'shipment',
        {
          operator: 'LEFT',
          table: 'flex_data',
          $on: [
            new BinaryExpression(
              new ColumnExpression('flex_data', 'tableName'),
              '=',
              'shipment'
            ),
            new BinaryExpression(
              new ColumnExpression('shipment', 'id'),
              '=',
              new ColumnExpression('flex_data', 'primaryKey')
            ),
          ],
        },
      ),
      $where: new AndExpressions({
        expressions: [
          new IsNullExpression(new ColumnExpression('flex_data', 'deletedAt'), false),
          new IsNullExpression(new ColumnExpression('flex_data', 'deletedBy'), false),
        ],
      }),
    })
  )
// -------- register field
// Date
query
  .register(
    'date',
    new Query({
      $where: new BetweenExpression(new ColumnExpression('shipment', 'jobDate'), false),
    })
  )
  .register('from', 0)
  .register('to', 1)

// shipper
query
  .register(
    'shipperPartyId',
    new Query({
      $where: new InExpression(new ColumnExpression('shipment', 'shipperPartyId'), false),
    })
  )
  .register('value', 0)

// consignee
query
  .register(
    'consigneePartyId',
    new Query({
      $where: new InExpression(new ColumnExpression('shipment', 'consigneePartyId'), false),
    })
  )
  .register('value', 0)

// office
query
  .register(
    'officePartyId',
    new Query({
      $where: new InExpression(new ColumnExpression('shipment', 'officePartyId'), false),
    })
  )
  .register('value', 0)

// agent
query
  .register(
    'agentPartyId',
    new Query({
      $where: new InExpression(new ColumnExpression('shipment', 'agentPartyId'), false),
    })
  )
  .register('value', 0)

// roagent
query
  .register(
    'consigneePartyId',
    new Query({
      $where: new InExpression(new ColumnExpression('shipment', 'roAgentPartyId'), false),
    })
  )
  .register('value', 0)

// liner agent
query
  .register(
    'linearAgentPartyId',
    new Query({
      $where: new InExpression(new ColumnExpression('shipment', 'linearAgentPartyId'), false),
    })
  )
  .register('value', 0)

// controlling customer
query
  .register(
    'controllingCustomerPartyId',
    new Query({
      $where: new InExpression(new ColumnExpression('shipment', 'controllingCustomerPartyId'), false),
    })
  )
  .register('value', 0)

// estimated departure date
query
  .register(
    'departureDateEstimated',
    new Query({
      $where: new BetweenExpression(new ColumnExpression('shipment', 'departureDateEstimated'), false),
    })
  )
  .register('from', 0)
  .register('to', 1)

// estimated arrival date
query
  .register(
    'arrivalDateEstimated',
    new Query({
      $where: new BetweenExpression(new ColumnExpression('shipment', 'arrivalDateEstimated'), false),
    })
  )
  .register('from', 0)
  .register('to', 1)

// module type
query
  .register(
    'moduleTypeCode',
    new Query({
      $where: new InExpression(new ColumnExpression('shipment', 'moduleTypeCode'), false),
    })
  )
  .register('value', 0)

// bound type
query
  .register(
    'boundTypeCode',
    new Query({
      $where: new InExpression(new ColumnExpression('shipment', 'boundTypeCode'), false),
    })
  )
  .register('value', 0)

// Free hand / RO
query
  .register(
    'nominatedTypeCode',
    new Query({
      $where: new InExpression(new ColumnExpression('shipment', 'nominatedType'), false),
    })
  )
  .register('value', 0)

// Shipment Type
query
  .register(
    'shipmentTypeCode',
    new Query({
      $where: new InExpression(new ColumnExpression('shipment', 'serviceCode'), false),
    })
  )
  .register('value', 0)

// Port of Loading
query
  .register(
    'portOfLoadingCode',
    new Query({
      $where: new InExpression(new ColumnExpression('shipment', 'portOfLoadingCode'), false),
    })
  )
  .register('value', 0)

// Agent Group
// TODO::
query
  .register(
    'agentGroup',
    new Query({
      $from: new FromTable(
        'shipment',
        {
          operator: 'LEFT',
          table: new FromTable('party', 'agent'),
          $on: [
            new BinaryExpression(
              new ColumnExpression('shipment', 'agentPartyId'),
              '=',
              new ColumnExpression('agent', 'id')
            ),
          ],
        },
      ),
      $where: new BinaryExpression(
        new ColumnExpression('agent', 'groupName'), '='
      ),
    })
  )
  .register('value', 0)

// Bill Type
query
  .register(
    'billTypeCode',
    new Query({
      $where: new InExpression(new ColumnExpression('shipment', 'billType'), false),
    })
  )
  .register('value', 0)

// Division
query
  .register(
    'division',
    new Query({
      $where: new InExpression(new ColumnExpression('shipment', 'division'), false),
    })
  )
  .register('value', 0)

// Salesman
query
  .register(
    'salesmanCode',
    new Query({
      $where: new BinaryExpression(
        new CaseExpression({
          cases: [
            {
              $when: new IsNullExpression(
                new ColumnExpression('shipment', 'rSalesmanPersonCode'), true
              ),
              $then: new ColumnExpression('shipment', 'rSalesmanPersonCode')
            },
            {
              $when: new BinaryExpression(
                new ColumnExpression('shipment', 'boundType'),
                '=',
                'O'
              ),
              $then: new ColumnExpression('shipment', 'sSalesmanPersonCode')
            },
            {
              $when: new BinaryExpression(
                new ColumnExpression('shipment', 'boundType'),
                '=',
                'I'
              ),
              $then: new ColumnExpression('shipment', 'cSalesmanPersonCode')
            }
          ],
          $else: null
        }),
        '='
      ),
    })
  )
  .register('value', 0)

// Controller Customer Salesman
query
  .register(
    'rSalesmanCode',
    new Query({
      $where: new InExpression(new ColumnExpression('shipment', 'rSalesmanPersonCode'), false),
    })
  )
  .register('value', 0)

// search
query
    .register(
      'q',
      new Query({
        $where: new OrExpressions({
          expressions: [
            new RegexpExpression(new ColumnExpression('shipment', 'agentPartyCode'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'agentPartyName'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'bookingNo'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'carrierCode'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'carrierName'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'consigneePartyCode'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'consigneePartyName'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'containerNos'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'contractNos'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'controllingCustomerPartyCode'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'controllingCustomerPartyName'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'cSalesmanPersonCode'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'division'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'finalDestinationCode'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'finalDestinationName'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'houseNo'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'jobNo'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'linerAgentPartyCode'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'linerAgentPartyName'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'masterNo'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'officePartyCode'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'officePartyName'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'placeOfDeliveryCode'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'placeOfDeliveryName'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'placeOfReceiptCode'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'placeOfReceiptName'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'portOfDischargeCode'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'portOfDischargeName'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'portOfLoadingCode'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'portOfLoadingName'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'roAgentPartyName'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'roAgentPartyCode'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'shipperPartyCode'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'shipperPartyName'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'sSalesmanPersonCode'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'vessel'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'voyageFlightNumber'), false),
            new RegexpExpression(new ColumnExpression('shipment', 'xrayStatus'), false),
            new RegexpExpression(new ColumnExpression('shipment_container', 'contractNo'), false),
            new RegexpExpression(new ColumnExpression('shipment_container', 'containerNo'), false),
            new RegexpExpression(new ColumnExpression('shipment_container', 'sealNo'), false),
            new RegexpExpression(new ColumnExpression('shipment_container', 'sealNo2'), false),
            new RegexpExpression(new ColumnExpression('shipment_container', 'carrierBookingNo'), false),
            new RegexpExpression(new ColumnExpression('shipment_po', 'poNo'), false),
          ],
        }),
      })
    )
    .register('value', 0)
    .register('value', 1)
    .register('value', 2)
    .register('value', 3)
    .register('value', 4)
    .register('value', 5)
    .register('value', 6)
    .register('value', 7)
    .register('value', 8)
    .register('value', 9)
    .register('value', 10)
    .register('value', 11)
    .register('value', 12)
    .register('value', 13)
    .register('value', 14)
    .register('value', 15)
    .register('value', 16)
    .register('value', 17)
    .register('value', 18)
    .register('value', 19)
    .register('value', 20)
    .register('value', 21)
    .register('value', 22)
    .register('value', 23)
    .register('value', 24)
    .register('value', 25)
    .register('value', 26)
    .register('value', 27)
    .register('value', 28)
    .register('value', 29)
    .register('value', 30)
    .register('value', 31)
    .register('value', 32)
    .register('value', 33)
    .register('value', 34)
    .register('value', 35)
    .register('value', 36)
    .register('value', 37)
    .register('value', 38)
    .register('value', 39)
    .register('value', 40)
    .register('value', 41)
    .register('value', 42)
    .register('value', 43)

query.register(
    'isActive',
    new Query({
      $where: new AndExpressions({
        expressions: [
          new IsNullExpression(new ColumnExpression('shipment', 'deletedAt'), false),
          new IsNullExpression(new ColumnExpression('shipment', 'deletedBy'), false),
        ],
      }),
    })
  )
export default query
