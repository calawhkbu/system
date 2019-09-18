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
  CreateFunctionJQL,
} from 'node-jql'

const query = new QueryDef(
  new Query({
    $select: [
      new ResultColumn(new ColumnExpression('booking', '*')),

      // avoid id being overwritten
      new ResultColumn(new ColumnExpression('booking', 'id'), 'bookingId'),

      new ResultColumn(new ColumnExpression('flex_data', 'data')),
      new ResultColumn(new ColumnExpression('booking_container', '*')),
      new ResultColumn(new ColumnExpression('booking_popacking', '*')),
      new ResultColumn(new ColumnExpression('finalWorkflow', '*')),
    ],

    $distinct: true,
    $from: new FromTable(
      'booking',
      {
        operator: 'LEFT',
        table: 'flex_data',
        $on: [
          new BinaryExpression(new ColumnExpression('flex_data', 'tableName'), '=', 'booking'),
          new BinaryExpression(
            new ColumnExpression('booking', 'id'),
            '=',
            new ColumnExpression('flex_data', 'primaryKey')
          ),
        ],
      },
      // {
      //   operator: 'LEFT',
      //   table: new FromTable({
      //     table: new Query({
      //       $select: [
      //         new ResultColumn(new ColumnExpression('booking_amount', 'bookingId'), 'bookingId'),
      //         new ResultColumn(
      //           new FunctionExpression(
      //             'group_concat',
      //             new ParameterExpression({
      //               expression: new ColumnExpression('booking_amount', 'amountName'),
      //               suffix: 'SEPARTOR \',\''
      //             })
      //           )
      //         ),
      //         new ResultColumn(
      //           new FunctionExpression(
      //             'group_concat',
      //             new ParameterExpression({
      //               expression: new ColumnExpression('booking_amount', 'currecyCode'),
      //               suffix: 'SEPARTOR \',\''
      //             })
      //           )
      //         ),
      //         new ResultColumn(new FunctionExpression('SUM', 'amount'), 'amount'),
      //       ],
      //       $from: new FromTable('booking_amount', 'booking_amount'),
      //       $group: new GroupBy([
      //         new ColumnExpression('bookingId')
      //       ])
      //     }),
      //     $as: 'booking_amount'
      //   }),
      //   $on: new BinaryExpression(new ColumnExpression('booking', 'id'), '=', new ColumnExpression('booking_amount', 'bookingId'))
      // },
      // {
      //   operator: 'LEFT',
      //   table: new FromTable('flex_data', 'booking_amount_flex_data'),
      //   $on: [
      //     new BinaryExpression(new ColumnExpression('booking_amount_flex_data', 'tableName'), '=', 'booking_amount'),
      //     new BinaryExpression(new ColumnExpression('booking_amount', 'id'), '=', new ColumnExpression('booking_amount_flex_data', 'primaryKey'))
      //   ]
      // },
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
            $from: new FromTable('booking_container', 'booking_container', {
              operator: 'LEFT',
              table: new FromTable('flex_data', 'flex_data'),
              $on: [
                new BinaryExpression(
                  new ColumnExpression('flex_data', 'tableName'),
                  '=',
                  'booking_container'
                ),
                new BinaryExpression(
                  new ColumnExpression('flex_data', 'primaryKey'),
                  '=',
                  new ColumnExpression('booking_container', 'id')
                ),
              ],
            }),
            $where: new AndExpressions({
              expressions: [
                new IsNullExpression(new ColumnExpression('booking_container', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('booking_container', 'deletedBy'), false),
                new IsNullExpression(new ColumnExpression('flex_data', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('flex_data', 'deletedBy'), false),
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
            $from: new FromTable('booking_popacking', 'booking_popacking', {
              operator: 'LEFT',
              table: new FromTable('flex_data', 'flex_data'),
              $on: [
                new BinaryExpression(
                  new ColumnExpression('flex_data', 'tableName'),
                  '=',
                  'booking_popacking'
                ),
                new BinaryExpression(
                  new ColumnExpression('flex_data', 'primaryKey'),
                  '=',
                  new ColumnExpression('booking_popacking', 'id')
                ),
              ],
            }),
            $where: new AndExpressions({
              expressions: [
                new IsNullExpression(new ColumnExpression('booking_popacking', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('booking_popacking', 'deletedBy'), false),
                new IsNullExpression(new ColumnExpression('flex_data', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('flex_data', 'deletedBy'), false),
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
            $from: new FromTable('booking_reference', 'booking_reference', {
              operator: 'LEFT',
              table: new FromTable('flex_data', 'flex_data'),
              $on: [
                new BinaryExpression(
                  new ColumnExpression('flex_data', 'tableName'),
                  '=',
                  'booking_reference'
                ),
                new BinaryExpression(
                  new ColumnExpression('flex_data', 'primaryKey'),
                  '=',
                  new ColumnExpression('booking_reference', 'bookingId')
                ),
              ],
            }),
            $where: new AndExpressions({
              expressions: [
                new IsNullExpression(new ColumnExpression('booking_reference', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('booking_reference', 'deletedBy'), false),
                new IsNullExpression(new ColumnExpression('flex_data', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('flex_data', 'deletedBy'), false),
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
              new ResultColumn(
                new FunctionExpression('ANY_VALUE', new ColumnExpression('flex_data', 'data')),
                'data'
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
              {
                operator: 'LEFT',
                table: new FromTable('flex_data', 'flex_data'),
                $on: [
                  new BinaryExpression(
                    new ColumnExpression('flex_data', 'tableName'),
                    '=',
                    'workflow'
                  ),
                  new BinaryExpression(
                    new ColumnExpression('flex_data', 'primaryKey'),
                    '=',
                    new ColumnExpression('workflow', 'id')
                  ),
                ],
              }
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
      }
    ),
  })
)

query.register('noOfBookings', {
  expression: new FunctionExpression({
    name: 'COUNT',
    parameters: new ParameterExpression({

      // cannot use distinct while using *
      // prefix: 'DISTINCT',
      expression: new ColumnExpression('*'),
    }),
  }),
  $as: 'noOfBookings',
})

// used createdAt as jobMonth
query.register('jobMonth', {
  expression: new FunctionExpression({
    name: 'DATE_FORMAT',
    parameters: [new ColumnExpression('booking', 'createdAt'), '%y-%m'],
  }),
  $as: 'jobMonth',
})

query
  .register(
    'primaryKeyListString',
    new ResultColumn(new FunctionExpression('GROUP_CONCAT', new ColumnExpression('booking', 'id')), 'primaryKeyListString'))

// ------------- register filter

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
    'moduleTypeCode',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('booking', 'moduleTypeCode'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'moduleTypeCodes',
    new Query({
      $where: new InExpression(new ColumnExpression('booking', 'moduleTypeCode'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'boundTypeCode',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('booking', 'boundTypeCode'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'boundTypeCodes',
    new Query({
      $where: new InExpression(new ColumnExpression('booking', 'boundTypeCode'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'shipperPartyName',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('booking', 'shipperPartyName'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'consigneePartyName',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('booking', 'consigneePartyName'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'forwarderPartyName',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('booking', 'forwarderPartyName'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'notifyPartyPartyName',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('booking', 'notifyPartyPartyName'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'agentPartyName',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('booking', 'agentPartyName'), false),
    })
  )
  .register('value', 0)

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
          new RegexpExpression(new ColumnExpression('booking', 'shipperPartyName'), false),
          new RegexpExpression(new ColumnExpression('booking', 'shipperPartyContactName'), false),
          new RegexpExpression(new ColumnExpression('booking', 'consigneePartyName'), false),
          new RegexpExpression(new ColumnExpression('booking', 'consigneePartyContactName'), false),
          new RegexpExpression(new ColumnExpression('booking', 'forwarderPartyName'), false),
          new RegexpExpression(new ColumnExpression('booking', 'forwarderPartyContactName'), false),
          new RegexpExpression(new ColumnExpression('booking', 'notifyPartyPartyName'), false),
          new RegexpExpression(
            new ColumnExpression('booking', 'notifyPartyPartyContactName'),
            false
          ),
          new RegexpExpression(new ColumnExpression('booking', 'agentPartyName'), false),
          new RegexpExpression(new ColumnExpression('booking', 'agentPartyContactName'), false),
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
        new IsNullExpression(new ColumnExpression('flex_data', 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression('flex_data', 'deletedBy'), false),
        // new IsNullExpression(new ColumnExpression('booking_amount', 'deletedAt'), false),
        // new IsNullExpression(new ColumnExpression('booking_amount', 'deletedBy'), false),
        // new IsNullExpression(new ColumnExpression('booking_amount_flex_data', 'deletedAt'), false),
        // new IsNullExpression(new ColumnExpression('booking_amount_flex_data', 'deletedBy'), false),
        // new IsNullExpression(new ColumnExpression('booking_container', 'deletedAt'), false),
        // new IsNullExpression(new ColumnExpression('booking_container', 'deletedBy'), false),
        // new IsNullExpression(new ColumnExpression('booking_container_flex_data', 'deletedAt'), false),
        // new IsNullExpression(new ColumnExpression('booking_container_flex_data', 'deletedBy'), false),
        // new IsNullExpression(new ColumnExpression('booking_popacking', 'deletedAt'), false),
        // new IsNullExpression(new ColumnExpression('booking_popacking', 'deletedBy'), false),
        // new IsNullExpression(new ColumnExpression('booking_popacking_flex_data', 'deletedAt'), false),
        // new IsNullExpression(new ColumnExpression('booking_popacking_flex_data', 'deletedBy'), false),
        // new IsNullExpression(new ColumnExpression('booking_reference', 'deletedAt'), false),
        // new IsNullExpression(new ColumnExpression('booking_reference', 'deletedBy'), false),
        // new IsNullExpression(new ColumnExpression('booking_reference_flex_data', 'deletedAt'), false),
        // new IsNullExpression(new ColumnExpression('booking_reference_flex_data', 'deletedBy'), false),
      ],
    }),
  })
)

export default query
