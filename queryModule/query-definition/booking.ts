import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
  FromTable,
  ResultColumn,
  GroupBy,
  BinaryExpression,
  BetweenExpression,
  RegexpExpression,
  ColumnExpression,
  FunctionExpression,
  ParameterExpression,
  InExpression,
  IsNullExpression,
  OrExpressions,
  AndExpressions,
  Value,
} from 'node-jql'

const query = new QueryDef(
  new Query({
    $distinct: true,
    $select: [
      new ResultColumn(new ColumnExpression('booking', '*')),
      new ResultColumn(new ColumnExpression('booking', 'id'), 'bookingId'),
    ],
    $from: new FromTable(
      'booking',
      {
        operator: 'LEFT',
        table: new FromTable({
          table: new Query({
            $select: [
              new ResultColumn(new ColumnExpression('booking_party', '*')),
            ],
            $from: new FromTable('booking_party', 'booking_party'),
            $where: new AndExpressions({
              expressions: [
                new IsNullExpression(new ColumnExpression('booking_party', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('booking_party', 'deletedBy'), false),
              ]
            }),
          }),
          $as: 'booking_party'
        }),
        $on: [
          new BinaryExpression(
            new ColumnExpression('booking', 'id'),
            '=',
            new ColumnExpression('booking_party', 'id')
          ),
        ],
      },
      {
        operator: 'LEFT',
        table: new FromTable({
          table: new Query({
            $select: [
              new ResultColumn(new ColumnExpression('booking_date', 'bookingId'), 'booking_date_booking_id'),
              new ResultColumn(new ColumnExpression('booking_date', 'cargoReadyDateEstimated')),
              new ResultColumn(new ColumnExpression('booking_date', 'cargoReadyDateActual')),
              new ResultColumn(new ColumnExpression('booking_date', 'cargoReadyDateRemark')),
              new ResultColumn(new ColumnExpression('booking_date', 'cYCutOffDateEstimated')),
              new ResultColumn(new ColumnExpression('booking_date', 'cYCutOffDateActual')),
              new ResultColumn(new ColumnExpression('booking_date', 'cYCutOffDateRemark')),
              new ResultColumn(new ColumnExpression('booking_date', 'pickupDateEstimated')),
              new ResultColumn(new ColumnExpression('booking_date', 'pickupDateActual')),
              new ResultColumn(new ColumnExpression('booking_date', 'pickupDateRemark')),
              new ResultColumn(new ColumnExpression('booking_date', 'departureDateEstimated')),
              new ResultColumn(new ColumnExpression('booking_date', 'departureDateActual')),
              new ResultColumn(new ColumnExpression('booking_date', 'departureDateRemark')),
              new ResultColumn(new ColumnExpression('booking_date', 'arrivalDateEstimated')),
              new ResultColumn(new ColumnExpression('booking_date', 'arrivalDateActual')),
              new ResultColumn(new ColumnExpression('booking_date', 'arrivalDateRemark')),
              new ResultColumn(new ColumnExpression('booking_date', 'finalDoorDeliveryDateEstimated')),
              new ResultColumn(new ColumnExpression('booking_date', 'finalDoorDeliveryDateActual')),
              new ResultColumn(new ColumnExpression('booking_date', 'finalDoorDeliveryDateRemark')),
              new ResultColumn(new ColumnExpression('booking_date', 'flexData'), 'booking_date_flexData'),
            ],
            $from: new FromTable('booking_date', 'booking_date'),
            $where: new AndExpressions({
              expressions: [
                new IsNullExpression(new ColumnExpression('booking_date', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('booking_date', 'deletedBy'), false),
              ]
            }),
          }),
          $as: 'booking_date'
        }),
        $on: [
          new BinaryExpression(
            new ColumnExpression('booking', 'id'),
            '=',
            new ColumnExpression('booking_date', 'booking_date_booking_id')
          ),
        ],
      },
      {
        operator: 'LEFT',
        table: new FromTable({
          table: new Query({
            $select: [
              new ResultColumn(new ColumnExpression('booking_amount', 'bookingId'), 'bookingId'),
            ],
            $from: new FromTable('booking_amount', 'booking_amount'),
            $group: new GroupBy([
              new ColumnExpression('bookingId')
            ])
          }),
          $as: 'booking_amount'
        }),
        $on: new BinaryExpression(new ColumnExpression('booking', 'id'), '=', new ColumnExpression('booking_amount', 'bookingId'))
      },
      {
        operator: 'LEFT',
        table: new FromTable({
          table: new Query({
            $select: [
              new ResultColumn(
                new ColumnExpression('booking_container', 'bookingId'),
                'booking_container_bookingId'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new ColumnExpression('booking_container', 'containerTypeCode'),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'containerTypeCode'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new ColumnExpression('booking_container', 'containerNo'),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'containerNo'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new ColumnExpression('booking_container', 'soNo'),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'soNo'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new ColumnExpression('booking_container', 'sealNo'),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'sealNo'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'SUM',
                  new ColumnExpression('booking_container', 'quantity')
                ),
                'quantity'
              ),
            ],
            $from: new FromTable('booking_container', 'booking_container'),
            $where: new AndExpressions({
              expressions: [
                new IsNullExpression(new ColumnExpression('booking_container', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('booking_container', 'deletedBy'), false),
              ],
            }),
            $group: new GroupBy([new ColumnExpression('booking_container', 'bookingId')]),
          }),
          $as: 'booking_container',
        }),
        $on: new BinaryExpression(
          new ColumnExpression('booking', 'id'),
          '=',
          new ColumnExpression('booking_container', 'booking_container_bookingId')
        ),
      },
      {
        operator: 'LEFT',
        table: new FromTable({
          table: new Query({
            $select: [
              new ResultColumn(
                new ColumnExpression('booking_popacking', 'bookingId'),
                'booking_popacking_bookingId'
              ),
              new ResultColumn(
                new FunctionExpression('SUM', new ColumnExpression('booking_popacking', 'volume')),
                'volume'
              ),
              new ResultColumn(
                new FunctionExpression('SUM', new ColumnExpression('booking_popacking', 'weight')),
                'weight'
              ),
              new ResultColumn(
                new FunctionExpression('SUM', new ColumnExpression('booking_popacking', 'ctns')),
                'ctns'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'SUM',
                  new ColumnExpression('booking_popacking', 'quantity')
                ),
                'quantity'
              ),
            ],
            $from: new FromTable('booking_popacking', 'booking_popacking'),
            $where: new AndExpressions({
              expressions: [
                new IsNullExpression(new ColumnExpression('booking_popacking', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('booking_popacking', 'deletedBy'), false),
              ],
            }),
            $group: new GroupBy([new ColumnExpression('booking_popacking', 'bookingId')]),
          }),
          $as: 'booking_popacking',
        }),
        $on: new BinaryExpression(
          new ColumnExpression('booking', 'id'),
          '=',
          new ColumnExpression('booking_popacking', 'booking_popacking_bookingId')
        ),
      },
      {
        operator: 'LEFT',
        table: new FromTable({
          table: new Query({
            $select: [
              new ResultColumn(
                new ColumnExpression('booking_reference', 'bookingId'),
                'booking_reference_bookingId'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new ColumnExpression('booking_reference', 'refName'),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'refName'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new ColumnExpression('booking_reference', 'refDescription'),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'refDescription'
              ),
            ],
            $from: new FromTable('booking_reference', 'booking_reference'),
            $where: new AndExpressions({
              expressions: [
                new IsNullExpression(new ColumnExpression('booking_reference', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('booking_reference', 'deletedBy'), false),
              ],
            }),
            $group: new GroupBy([new ColumnExpression('booking_reference', 'bookingId')]),
          }),
          $as: 'booking_reference',
        }),
        $on: new BinaryExpression(
          new ColumnExpression('booking', 'id'),
          '=',
          new ColumnExpression('booking_reference', 'booking_reference_bookingId')
        ),
      },
      {
        operator: 'LEFT',
        table: new FromTable({
          table: new Query({
            $select: [
              new ResultColumn(new ColumnExpression('workflow', 'tableName')),
              new ResultColumn(new ColumnExpression('workflow', 'primaryKey')),
              new ResultColumn(
                new FunctionExpression('ANY_VALUE', new ColumnExpression('workflow', 'statusName')),
                'lastStatus'
              ),
              new ResultColumn(
                new FunctionExpression('ANY_VALUE', new ColumnExpression('workflow', 'statusDate')),
                'lastStatusDate'
              ),
            ],

            $from: new FromTable(
              new Query({
                $select: [
                  new ResultColumn(new ColumnExpression('workflow', 'tableName')),
                  new ResultColumn(new ColumnExpression('workflow', 'primaryKey')),
                  new ResultColumn(
                    new FunctionExpression('MAX', new ColumnExpression('workflow', 'statusDate')),
                    'lastStatusDate'
                  ),
                ],
                $from: new FromTable('workflow'),
                $group: new GroupBy([
                  new ColumnExpression('workflow', 'tableName'),
                  new ColumnExpression('workflow', 'primaryKey'),
                  // new ColumnExpression('workflow', 'statusName'),
                ]),
              }),
              't1',

              {
                operator: 'LEFT',
                table: new FromTable('workflow', 'workflow'),

                $on: [
                  new BinaryExpression(
                    new ColumnExpression('t1', 'tableName'),
                    '=',
                    new ColumnExpression('workflow', 'tableName')
                  ),
                  new BinaryExpression(
                    new ColumnExpression('t1', 'lastStatusDate'),
                    '=',
                    new ColumnExpression('workflow', 'statusDate')
                  ),
                  new BinaryExpression(
                    new ColumnExpression('t1', 'primaryKey'),
                    '=',
                    new ColumnExpression('workflow', 'primaryKey')
                  ),
                ],
              },
            ),

            $group: new GroupBy([
              new ColumnExpression('workflow', 'tableName'),
              new ColumnExpression('workflow', 'primaryKey'),
            ]),
          }),
          $as: 'finalWorkflow',
        }),
        $on: [
          new BinaryExpression(new ColumnExpression('finalWorkflow', 'tableName'), '=', 'booking'),
          new BinaryExpression(
            new ColumnExpression('finalWorkflow', 'primaryKey'),
            '=',
            new ColumnExpression('booking', 'id')
          ),
        ],
      },
      {
        operator: 'LEFT',
        table: new FromTable('code_master', 'carrier'),
        $on: [
          new BinaryExpression(
            new ColumnExpression('carrier', 'codeType'),
            '=',
            new Value('CARRIER')
          ),

          new BinaryExpression(
            new ColumnExpression('booking', 'carrierCode'),
            '=',
            new ColumnExpression('carrier', 'code')
          ),
        ],
      },
      {
        operator: 'LEFT',
        table: new FromTable('code_master', 'moduleType'),
        $on: [
          new BinaryExpression(
            new ColumnExpression('moduleType', 'codeType'),
            '=',
            new Value('MODULE')
          ),

          new BinaryExpression(
            new ColumnExpression('booking', 'moduleTypeCode'),
            '=',
            new ColumnExpression('moduleType', 'code')
          ),
        ],
      },
      {
        operator: 'LEFT',
        table: new FromTable('code_master', 'boundType'),
        $on: [
          new BinaryExpression(
            new ColumnExpression('boundType', 'codeType'),
            '=',
            new Value('BOUND')
          ),

          new BinaryExpression(
            new ColumnExpression('booking', 'boundTypeCode'),
            '=',
            new ColumnExpression('boundType', 'code')
          ),
        ],
      },
      {
        operator: 'LEFT',
        table: new FromTable('code_master', 'service'),
        $on: [
          new BinaryExpression(
            new ColumnExpression('service', 'codeType'),
            '=',
            new Value('SERVTYPE')
          ),

          new BinaryExpression(
            new ColumnExpression('booking', 'serviceCode'),
            '=',
            new ColumnExpression('service', 'code')
          ),
        ],
      },
      {
        operator: 'LEFT',
        table: new FromTable('code_master', 'incoTerms'),
        $on: [
          new BinaryExpression(
            new ColumnExpression('incoTerms', 'codeType'),
            '=',
            new Value('INCOTERMS')
          ),

          new BinaryExpression(
            new ColumnExpression('booking', 'incoTermsCode'),
            '=',
            new ColumnExpression('incoTerms', 'code')
          ),
        ],
      },
      {
        operator: 'LEFT',
        table: new FromTable('code_master', 'freightTerms'),
        $on: [
          new BinaryExpression(
            new ColumnExpression('freightTerms', 'codeType'),
            '=',
            new Value('PAYTERMS')
          ),

          new BinaryExpression(
            new ColumnExpression('booking', 'freightTermsCode'),
            '=',
            new ColumnExpression('freightTerms', 'code')
          ),
        ],
      },
      {
        operator: 'LEFT',
        table: new FromTable('code_master', 'otherTerms'),
        $on: [
          new BinaryExpression(
            new ColumnExpression('otherTerms', 'codeType'),
            '=',
            new Value('PAYTERMS')
          ),

          new BinaryExpression(
            new ColumnExpression('booking', 'otherTermsCode'),
            '=',
            new ColumnExpression('otherTerms', 'code')
          ),
        ],
      }
    ),
  })
)

// register fields
query.register('id', {
  expression: new ColumnExpression('booking', 'id'),
  $as: 'id',
})

query.register('createdAt', {
  expression: new ColumnExpression('booking', 'createdAt'),
  $as: 'createdAt',
})

query.register('updatedAt', {
  expression: new ColumnExpression('booking', 'updatedAt'),
  $as: 'updatedAt',
})

query.register('totalBooking', {
  expression: new FunctionExpression({
    name: 'COUNT',
    parameters: new ParameterExpression({
      // cannot use distinct while using *
      // prefix: 'DISTINCT',
      expression: new ColumnExpression('booking', 'id'),
    }),
  }),
  $as: 'totalBooking',
})

// query.register('houseNo2', {
//   expression: new FunctionExpression(
//     'IFNULL',
//     new FunctionExpression('SUM', new ColumnExpression('weight')),
//     0
//   ),
//   $as: 'weight',
// })

query.register('houseNo', {
  expression: new FunctionExpression(
    'IF',
    new BinaryExpression(
      new ColumnExpression('booking_reference', 'refName'),
      '=',
      new Value('HBL')
    ),
    new ColumnExpression('booking_reference', 'refDescription'),
    new Value(null)
  ),
  $as: 'houseNo',
})

query.register('masterNo', {
  expression: new FunctionExpression(
    'IF',
    new BinaryExpression(new ColumnExpression('booking_reference', 'refName'), '=', 'MBL'),
    new ColumnExpression('booking_reference', 'refDescription'),
    new Value(null)
  ),
  $as: 'masterNo',
})

query.register('poNo', {
  expression: new FunctionExpression(
    'JSON_UNQUOTE',
    new FunctionExpression('JSON_EXTRACT', new ColumnExpression('booking', 'flexData'), '$.poNo')
  ),
  $as: 'poNo',
})

query.register('weight', {
  expression: new FunctionExpression(
    'IFNULL',
    new FunctionExpression('SUM', new ColumnExpression('weight')),
    0
  ),
  $as: 'weight',
})

query.register('cbm', {
  expression: new FunctionExpression(
    'IFNULL',
    new FunctionExpression('SUM', new ColumnExpression('volume')),
    0
  ),
  $as: 'cbm',
})

query.register('service', {
  expression: new FunctionExpression(
    'IFNULL',
    new ColumnExpression('service', 'name'),
    new ColumnExpression('booking', 'serviceCode')
  ),
  $as: 'service',
})

query.register('moduleType', {
  expression: new FunctionExpression(
    'IFNULL',
    new ColumnExpression('moduleType', 'name'),
    new ColumnExpression('booking', 'moduleTypeCode')
  ),
  $as: 'moduleType',
})

query.register('boundType', {
  expression: new FunctionExpression(
    'IFNULL',
    new ColumnExpression('boundType', 'name'),
    new ColumnExpression('booking', 'boundTypeCode')
  ),
  $as: 'boundType',
})

query.register('incoTerms', {
  expression: new FunctionExpression(
    'IFNULL',
    new ColumnExpression('incoTerms', 'name'),
    new ColumnExpression('booking', 'incoTermsCode')
  ),
  $as: 'incoTerms',
})

query.register('otherTerms', {
  expression: new FunctionExpression(
    'IFNULL',
    new ColumnExpression('otherTerms', 'name'),
    new ColumnExpression('booking', 'otherTermsCode')
  ),
  $as: 'otherTerms',
})

query.register('freightTerms', {
  expression: new FunctionExpression(
    'IFNULL',
    new ColumnExpression('freightTerms', 'name'),
    new ColumnExpression('booking', 'freightTermsCode')
  ),
  $as: 'freightTerms',
})

query.register('carrierName', {
  expression: new FunctionExpression(
    'IFNULL',
    new ColumnExpression('carrier', 'name'),
    new FunctionExpression(
      'IFNULL',
      new ColumnExpression('booking', 'carrierName'),
      new ColumnExpression('booking', 'carrierCode')
    )
  ),
  $as: 'carrierName',
})

// used createdAt as jobMonth
query.register('jobMonth', {
  expression: new FunctionExpression({
    name: 'DATE_FORMAT',
    parameters: [new ColumnExpression('booking', 'createdAt'), '%y-%m'],
  }),
  $as: 'jobMonth',
})

query.register(
  'primaryKeyListString',
  new ResultColumn(
    new FunctionExpression('GROUP_CONCAT', new ColumnExpression('booking', 'id')),
    'primaryKeyListString'
  )
)

// ------------- register filter

query
  .register(
    'shipperPartyId',
    new Query({
      $where: new InExpression(new ColumnExpression('booking_party', 'shipperPartyId'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'consigneePartyId',
    new Query({
      $where: new InExpression(new ColumnExpression('booking_party', 'consigneePartyId'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'forwarderPartyId',
    new Query({
      $where: new InExpression(new ColumnExpression('booking_party', 'forwarderPartyId'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'officePartyId',
    new Query({
      $where: new InExpression(new ColumnExpression('booking_party', 'forwarderPartyId'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'agentPartyId',
    new Query({
      $where: new InExpression(new ColumnExpression('booking_party', 'agentPartyId'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'departureDateEstimated',
    new Query({
      $where: new BetweenExpression(
        new ColumnExpression('booking_date', 'departureDateEstimated'),
        false
      ),
    })
  )
  .register('from', 0)
  .register('to', 1)

query
  .register(
    'arrivalDateEstimated',
    new Query({
      $where: new BetweenExpression(new ColumnExpression('booking_date', 'arrivalDateEstimated'), false),
    })
  )
  .register('from', 0)
  .register('to', 1)

query
  .register(
    'moduleTypeCode',
    new Query({
      $where: new InExpression(new ColumnExpression('booking', 'moduleTypeCode'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'boundTypeCode',
    new Query({
      $where: new InExpression(new ColumnExpression('booking', 'boundTypeCode'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'portOfLoadingCode',
    new Query({
      $where: new InExpression(new ColumnExpression('booking', 'portOfLoadingCode'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'portOfDischargeCode',
    new Query({
      $where: new InExpression(new ColumnExpression('booking', 'portOfDischargeCode'), false),
    })
  )
  .register('value', 0)

// ----------------- filter in main filter menu

query
  .register(
    'partyGroupCode',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('booking', 'partyGroupCode'), '='),
    })
  )
  .register('value', 0)
query
  .register(
    'bookingNo',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('booking', 'bookingNo'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'shipperPartyName',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('booking_party', 'shipperPartyName'), false),
    })
  )
  .register('value', 0)

query.register(
  'shipperPartyCodeIsNotNull',
  new Query({
    $where: new IsNullExpression(new ColumnExpression('booking_party', 'shipperPartyCode'), true),
  })
)

query
  .register(
    'consigneePartyName',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('booking_party', 'consigneePartyName'), false),
    })
  )
  .register('value', 0)

query.register(
  'consigneePartyCodeIsNotNull',
  new Query({
    $where: new IsNullExpression(new ColumnExpression('booking_party', 'consigneePartyCode'), true),
  })
)

query
  .register(
    'forwarderPartyName',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('booking_party', 'forwarderPartyName'), false),
    })
  )
  .register('value', 0)

query.register(
  'forwarderPartyCodeIsNotNull',
  new Query({
    $where: new IsNullExpression(new ColumnExpression('booking_party', 'forwarderPartyCode'), true),
  })
)

query
  .register(
    'notifyPartyPartyName',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('booking_party', 'notifyPartyPartyName'), false),
    })
  )
  .register('value', 0)

query.register(
  'notifyPartyPartyCodeIsNotNull',
  new Query({
    $where: new IsNullExpression(new ColumnExpression('booking_party', 'notifyPartyPartyCode'), true),
  })
)

query
  .register(
    'agentPartyName',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('booking', 'agentPartyName'), false),
    })
  )
  .register('value', 0)

query.register(
  'agentPartyCodeIsNotNull',
  new Query({
    $where: new IsNullExpression(new ColumnExpression('booking_party', 'agentPartyCode'), true),
  })
)

query
  .register(
    'primaryKeyList',
    new Query({
      $where: new InExpression(new ColumnExpression('booking', 'id'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'date',
    new Query({
      $where: new BetweenExpression(new ColumnExpression('booking', 'createdAt'), false),
    })
  )
  .register('from', 0)
  .register('to', 1)

query.register(
    'primaryKey',
    new Query({
      $select: [
        new ResultColumn(new ColumnExpression('booking', 'id'), 'primaryKey'),
      ]
    })
  )

query
  .register(
    'q',
    new Query({
      $where: new OrExpressions({
        expressions: [
          new RegexpExpression(new ColumnExpression('booking', 'bookingNo'), false),
          new RegexpExpression(new ColumnExpression('booking', 'carrierCode'), false),
          new RegexpExpression(new ColumnExpression('booking', 'vesselName'), false),
          new RegexpExpression(new ColumnExpression('booking', 'voyageFlightNumber'), false),
          new RegexpExpression(new ColumnExpression('booking', 'commodity'), false),
          new RegexpExpression(new ColumnExpression('booking', 'polHSCode'), false),
          new RegexpExpression(new ColumnExpression('booking', 'podHSCode'), false),
          new RegexpExpression(new ColumnExpression('booking', 'placeOfReceiptCode'), false),
          new RegexpExpression(new ColumnExpression('booking', 'portOfLoadingCode'), false),
          new RegexpExpression(new ColumnExpression('booking', 'portOfDischargeCode'), false),
          new RegexpExpression(new ColumnExpression('booking', 'placeOfDeliveryCode'), false),
          new RegexpExpression(new ColumnExpression('booking', 'finalDestinationCode'), false),
          new RegexpExpression(new ColumnExpression('booking_party', 'shipperPartyName'), false),
          new RegexpExpression(new ColumnExpression('booking_party', 'shipperPartyContactName'), false),
          new RegexpExpression(new ColumnExpression('booking_party', 'consigneePartyName'), false),
          new RegexpExpression(new ColumnExpression('booking_party', 'consigneePartyContactName'), false),
          new RegexpExpression(new ColumnExpression('booking_party', 'forwarderPartyName'), false),
          new RegexpExpression(new ColumnExpression('booking_party', 'forwarderPartyContactName'), false),
          new RegexpExpression(new ColumnExpression('booking_party', 'notifyPartyPartyName'), false),
          new RegexpExpression(
            new ColumnExpression('booking_party', 'notifyPartyPartyContactName'),
            false
          ),
          new RegexpExpression(new ColumnExpression('booking_party', 'agentPartyName'), false),
          new RegexpExpression(new ColumnExpression('booking_party', 'agentPartyContactName'), false),
          // new RegexpExpression(new ColumnExpression('booking_amount', 'amountName'), false),
          new RegexpExpression(new ColumnExpression('booking_container', 'containerNo'), false),
          new RegexpExpression(new ColumnExpression('booking_container', 'sealNo'), false),
          new RegexpExpression(new ColumnExpression('booking_reference', 'refName'), false),
          new RegexpExpression(new ColumnExpression('booking_reference', 'refDescription'), false),
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
// .register('value', 26)

query.register(
  'isActive',
  new Query({
    $where: new AndExpressions({
      expressions: [
        new IsNullExpression(new ColumnExpression('booking', 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression('booking', 'deletedBy'), false),
      ],
    }),
  })
)

export default query
