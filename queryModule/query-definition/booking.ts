import { QueryDef, ResultColumnFn, GroupByFn } from 'classes/query/QueryDef'
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
  IExpression,
  CaseExpression,
  Unknown,
  IConditionalExpression,
  OrderBy,
  ICase,
} from 'node-jql'
import { IQueryParams } from 'classes/query'

const partyList = ['shipper', 'consignee', 'agent', 'roAgent', 'linerAgent', 'office', 'controllingCustomer', 'forwarder']
const locationList = ['portOfLoading', 'portOfDischarge', 'placeOfDelivery', 'placeOfReceipt', 'finalDestination']

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const query = new QueryDef(
  new Query({

    // $distinct: true,

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
            new ColumnExpression('booking_party', 'bookingId')
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

const carrierCodeExpression = new ColumnExpression('booking', 'carrierCode')

const carrierNameExpression = new FunctionExpression(
  'IFNULL',
  new ColumnExpression('carrier', 'name'),
  new FunctionExpression(
    'IFNULL',
    new ColumnExpression('booking', 'carrierName'),
    carrierCodeExpression
  )
)

const reportingGroupExpression = new CaseExpression({

  cases: [
    {
      $when: new AndExpressions([
        new BinaryExpression(new ColumnExpression('shipment', 'divisionCode'), '=', 'AE'),
        new BinaryExpression(new ColumnExpression('shipment', 'isDirect'), '=', 0)
      ]),
      $then: new Value('AC')
    },
    {
      $when: new AndExpressions([
        new BinaryExpression(new ColumnExpression('shipment', 'divisionCode'), '=', 'AE'),
        new BinaryExpression(new ColumnExpression('shipment', 'isDirect'), '=', 1)
      ]),
      $then: new Value('AD')
    }

  ],

  $else: new CaseExpression({

    cases: [
      {
        $when: new AndExpressions([
          new BinaryExpression(new ColumnExpression('shipment', 'moduleTypeCode'), '=', 'AIR'),
          new BinaryExpression(new ColumnExpression('shipment', 'boundTypeCode'), '=', 'O'),
          new BinaryExpression(new ColumnExpression('shipment', 'isDirect'), '=', 0)
        ]),
        $then: new Value('AC')
      },
      {
        $when: new AndExpressions([
          new BinaryExpression(new ColumnExpression('shipment', 'moduleTypeCode'), '=', 'AIR'),
          new BinaryExpression(new ColumnExpression('shipment', 'boundTypeCode'), '=', 'O'),
          new BinaryExpression(new ColumnExpression('shipment', 'isDirect'), '=', 1)
        ]),
        $then: new Value('AD')
      },
      {
        $when: new AndExpressions([
          new BinaryExpression(new ColumnExpression('shipment', 'moduleTypeCode'), '=', 'AIR'),
          new BinaryExpression(new ColumnExpression('shipment', 'boundTypeCode'), '=', 'I'),
          new BinaryExpression(new ColumnExpression('shipment', 'isDirect'), '=', 0)
        ]),
        $then: new Value('AM')
      },

      {
        $when: new AndExpressions([
          new BinaryExpression(new ColumnExpression('shipment', 'moduleTypeCode'), '=', 'AIR'),
          new BinaryExpression(new ColumnExpression('shipment', 'boundTypeCode'), '=', 'I'),
          new BinaryExpression(new ColumnExpression('shipment', 'isDirect'), '=', 1)
        ]),
        $then: new Value('AN')
      },

      {
        $when: new AndExpressions([
          new BinaryExpression(new ColumnExpression('shipment', 'moduleTypeCode'), '=', 'AIR'),
          new BinaryExpression(new ColumnExpression('shipment', 'boundTypeCode'), '=', 'M')
        ]),
        $then: new Value('AZ')
      },

      {
        $when: new AndExpressions([
          new BinaryExpression(new ColumnExpression('shipment', 'moduleTypeCode'), '=', 'SEA'),
          new BinaryExpression(new ColumnExpression('shipment', 'boundTypeCode'), '=', 'O'),
          new BinaryExpression(new ColumnExpression('shipment', 'shipmentTypeCode'), '=', 'FCL')
        ]),
        $then: new Value('SA')
      },

      {
        $when: new AndExpressions([
          new BinaryExpression(new ColumnExpression('shipment', 'moduleTypeCode'), '=', 'SEA'),
          new BinaryExpression(new ColumnExpression('shipment', 'boundTypeCode'), '=', 'O'),
          new BinaryExpression(new ColumnExpression('shipment', 'shipmentTypeCode'), '=', 'LCL')
        ]),
        $then: new Value('SB')
      },

      {
        $when: new AndExpressions([
          new BinaryExpression(new ColumnExpression('shipment', 'moduleTypeCode'), '=', 'SEA'),
          new BinaryExpression(new ColumnExpression('shipment', 'boundTypeCode'), '=', 'O'),
          new BinaryExpression(new ColumnExpression('shipment', 'shipmentTypeCode'), '=', 'Consol')
        ]),
        $then: new Value('SC')
      },

      {
        $when: new AndExpressions([
          new BinaryExpression(new ColumnExpression('shipment', 'moduleTypeCode'), '=', 'SEA'),
          new BinaryExpression(new ColumnExpression('shipment', 'boundTypeCode'), '=', 'I'),
          new BinaryExpression(new ColumnExpression('shipment', 'shipmentTypeCode'), '=', 'FCL')
        ]),
        $then: new Value('SR')
      },

      {
        $when: new AndExpressions([
          new BinaryExpression(new ColumnExpression('shipment', 'moduleTypeCode'), '=', 'SEA'),
          new BinaryExpression(new ColumnExpression('shipment', 'boundTypeCode'), '=', 'I'),
          new BinaryExpression(new ColumnExpression('shipment', 'shipmentTypeCode'), '=', 'LCL')
        ]),
        $then: new Value('SS')
      },

      {
        $when: new AndExpressions([
          new BinaryExpression(new ColumnExpression('shipment', 'moduleTypeCode'), '=', 'SEA'),
          new BinaryExpression(new ColumnExpression('shipment', 'boundTypeCode'), '=', 'I'),
          new BinaryExpression(new ColumnExpression('shipment', 'shipmentTypeCode'), '=', 'Consol')
        ]),
        $then: new Value('ST')
      },

      {
        $when: new AndExpressions([
          new BinaryExpression(new ColumnExpression('shipment', 'moduleTypeCode'), '=', 'SEA'),
          new BinaryExpression(new ColumnExpression('shipment', 'boundTypeCode'), '=', 'M'),
        ]),
        $then: new Value('SZ')
      },

    ],

    $else: new Value(null)
  })

})

const alertTypeExpression = new ColumnExpression('alert', 'alertType')
const alertTableNameExpression = new ColumnExpression('alert', 'tableName')
const alertPrimaryKeyExpression = new ColumnExpression('alert', 'primaryKey')

const alertSeverityExpression = new ColumnExpression('alert', 'severity')
const alertTitleExpression = new FunctionExpression('CONCAT', new ColumnExpression('alert', 'alertType'), new Value('Title'))

const alertMessageExpression = new CaseExpression({
  cases: [
    {
      // retrieve custom message from flexData
      $when: new BinaryExpression(new ColumnExpression('alert', 'alertCategory'), '=', 'Message'),
      $then: new FunctionExpression(
        'JSON_UNQUOTE',
        new FunctionExpression('JSON_EXTRACT', new ColumnExpression('alert', 'flexData'), '$.customMessage')
      )
    }

  ],

  // shipmentEtaChanged => shipmentEtaChangedTitle, later will put in i18n
  $else: new FunctionExpression('CONCAT', new ColumnExpression('alert', 'alertType'), new Value('Message'))
})

const alertCategoryExpression = new ColumnExpression('alert', 'alertCategory')

const alertStatusExpression = new ColumnExpression('alert', 'status')

const alertCreatedAtExpression = new ColumnExpression('alert', 'createdAt')
const alertUpdatedAtExpression = new ColumnExpression('alert', 'updatedAt')

const alertContentExpression = new ColumnExpression('alert', 'flexData')

query.registerBoth('carrierName', carrierNameExpression)
query.registerBoth('carrierCode', carrierCodeExpression)

query.registerBoth('reportingGroup', reportingGroupExpression)

query.registerBoth('alertTableName', alertTableNameExpression)

query.registerBoth('alertPrimaryKey', alertPrimaryKeyExpression)

query.registerBoth('alertSeverity', alertSeverityExpression)

query.registerBoth('alertType', alertTypeExpression)

query.registerBoth('alertTitle', alertTitleExpression)

query.registerBoth('alertMessage', alertMessageExpression)

query.registerBoth('alertCategory', alertCategoryExpression)

query.registerBoth('alertCreatedAt', alertCreatedAtExpression)

query.registerBoth('alertUpdatedAt', alertUpdatedAtExpression)

query.registerBoth('alertContent', alertContentExpression)

query.registerBoth('alertStatus', alertStatusExpression)

// register join
query.registerQuery(
  'alertJoin', new Query({

    $from: new FromTable('booking', {

      operator: 'LEFT',
      table: 'alert',

      $on: [
        new BinaryExpression(new ColumnExpression('alert', 'tableName'), '=', 'booking'),
        new BinaryExpression(new ColumnExpression('alert', 'primaryKey'), '=', new ColumnExpression('booking', 'id'))
      ]

    })

  })
)

query.registerQuery(
  'workflowJoin', new Query({

    $from: new FromTable('booking', {
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
    })

  })
)

const firstTableExpression = new Query({
  $select: [
    new ResultColumn('bookingId', 'bookingId'),
    new ResultColumn('refDescription', 'trackingNo'),
    new ResultColumn(new Value(3), 'priority')
  ],

  $from: new FromTable('booking_reference'),

  $where : new OrExpressions([
    new BinaryExpression(new ColumnExpression('refName'), '=', 'MBL'),
    new BinaryExpression(new ColumnExpression('refName'), '=', 'MAWB')
  ]),

  $union: new Query({

    $select: [
      new ResultColumn(new ColumnExpression('bookingId'), 'bookingId'),
      new ResultColumn(new ColumnExpression('soNo'), 'trackingNo'),
      new ResultColumn(new Value(2), 'priority')
    ],

    $from: new FromTable({
      table: 'booking_container',
    }),
    $union: new Query({

      $select: [

        new ResultColumn(new ColumnExpression('bookingId'), 'bookingId'),
        new ResultColumn(new ColumnExpression('containerNo'), 'trackingNo'),
        new ResultColumn(new Value(1), 'priority')
      ],

      $from: new FromTable({
        table: 'booking_container',
      }),

      $union: new Query({

        $select: [

          new ResultColumn('id', 'bookingId'),
          new ResultColumn(new Value(null), 'trackingNo'),
          new ResultColumn(new Value(0), 'priority')
        ],

        $from: new FromTable({
          table: 'booking'
        })

      })

    })

  })

})

const bookingTrackingExpression = new Query({

  $select: [
    new ResultColumn(new ColumnExpression('booking', 'bookingId')),
    new ResultColumn(new ColumnExpression('booking', 'trackingNo')),
    new ResultColumn(new ColumnExpression('tracking', 'lastStatusCode')),
    new ResultColumn(new ColumnExpression('tracking', 'updatedAt')),
    new ResultColumn(new ColumnExpression('booking', 'priority'))

  ],

  $from: new FromTable({
    table: firstTableExpression,
    $as: 'booking',
    joinClauses: [
      {
        operator: 'LEFT',
        table: 'tracking',
        $on: new BinaryExpression(new ColumnExpression('tracking', 'trackingNo'), '=', new ColumnExpression('booking', 'trackingNo'))
      }
    ],
  }),

  $order: [
    new OrderBy(new ColumnExpression('booking', 'bookingId')),
    new OrderBy(new ColumnExpression('booking', 'priority')),
  ]

})

const maxTableExpression = new Query({

  // priority = 3
  $select: [
    new ResultColumn('bookingId', 'bookingId'),
    new ResultColumn('refDescription', 'trackingNo'),
    new ResultColumn(new FunctionExpression('IF', new IsNullExpression(new ColumnExpression('tracking', 'lastStatusCode'), false), new Value(0), new Value(3)), 'priority'),
    new ResultColumn(new ColumnExpression('tracking', 'updatedAt'))
  ],

  $from: new FromTable('booking_reference', {
    operator: 'LEFT',
    table: 'tracking',
    $on: new BinaryExpression(new ColumnExpression('tracking', 'trackingNo'), '=', new ColumnExpression('booking_reference', 'refDescription'))
  }),

  $where : new OrExpressions([
    new BinaryExpression(new ColumnExpression('refName'), '=', 'MBL'),
    new BinaryExpression(new ColumnExpression('refName'), '=', 'MAWB')
  ]),

  // priority = 2

  $union: new Query({

    $select: [
      new ResultColumn(new ColumnExpression('bookingId'), 'bookingId'),
      new ResultColumn(new ColumnExpression('soNo'), 'trackingNo'),
      new ResultColumn(new FunctionExpression('IF', new IsNullExpression(new ColumnExpression('tracking', 'lastStatusCode'), false), new Value(0), new Value(2)), 'priority'),
      new ResultColumn(new ColumnExpression('tracking', 'updatedAt'))
    ],

    $from: new FromTable('booking_container', {
      operator: 'LEFT',
      table: 'tracking',
      $on: new BinaryExpression(new ColumnExpression('tracking', 'trackingNo'), '=', new ColumnExpression('booking_container', 'soNo'))
    }),

    // priority = 1
    $union: new Query({

      $select: [

        new ResultColumn(new ColumnExpression('bookingId'), 'bookingId'),
        new ResultColumn(new ColumnExpression('containerNo'), 'trackingNo'),
        new ResultColumn(new FunctionExpression('IF', new IsNullExpression(new ColumnExpression('tracking', 'lastStatusCode'), false), new Value(0), new Value(1)), 'priority'),
        new ResultColumn(new ColumnExpression('tracking', 'updatedAt'))
      ],

      $from: new FromTable('booking_container', {
        operator: 'LEFT',
        table: 'tracking',
        $on: new BinaryExpression(new ColumnExpression('tracking', 'trackingNo'), '=', new ColumnExpression('booking_container', 'containerNo'))
      }),

    })

  })

})

const bookingProrityTableExpression = new Query({
  $select: [
    new ResultColumn(new ColumnExpression('max_table', 'bookingId')),
    new ResultColumn(new FunctionExpression('MAX', new ColumnExpression('max_table', 'priority')), 'max_priority'),
    new ResultColumn(new FunctionExpression('MAX', new ColumnExpression('max_table', 'updatedAt')), 'max_updatedAt')
  ],

  $from: new FromTable({
    table: maxTableExpression,
    $as: 'max_table',
  }),
  $group: new GroupBy(new ColumnExpression('max_table', 'bookingId'))

})

const finalTableExpression = new Query({

  $select: [
    new ResultColumn(new ColumnExpression('booking_tracking', 'bookingId')),
    new ResultColumn(new ColumnExpression('booking_tracking', 'lastStatusCode'))
  ],

  $from: new FromTable({

    table: bookingTrackingExpression,
    $as: 'booking_tracking',

    joinClauses: [{

      operator: 'LEFT',
      table: new FromTable({
        table: bookingProrityTableExpression,
        $as: 'booking_priority'
      }),
      $on: [
        new BinaryExpression(new ColumnExpression('booking_tracking', 'bookingId'), '=', new ColumnExpression('booking_priority', 'bookingId'))

      ]
    }]
  }),

  $where: [
    new BinaryExpression(new ColumnExpression('booking_priority', 'max_priority'), '=', new ColumnExpression('booking_tracking', 'priority')),
    new OrExpressions([
      new BinaryExpression(new ColumnExpression('booking_priority', 'max_updatedAt'), '=', new ColumnExpression('booking_tracking', 'updatedAt')),
      new IsNullExpression(new ColumnExpression('booking_tracking', 'updatedAt'), false)

    ])

  ]

})

query.registerQuery(
  'lastStatusJoin', new Query({

    $from: new FromTable('booking', {

      operator: 'LEFT',
      table: new FromTable({

        table: finalTableExpression,
        $as: 'booking_tracking',
      }),
      $on: new BinaryExpression(new ColumnExpression('booking_tracking', 'bookingId'), '=', new ColumnExpression('booking', 'id'))

    })

  })
)

// ===================================

// register fields
query.register('id', {
  expression: new ColumnExpression('booking', 'id'),
  $as: 'id',
})

  // warning !!! will not contain all if the list is too large
  query.registerResultColumn('primaryKeyListString',
    new ResultColumn(new FunctionExpression('GROUP_CONCAT', new ParameterExpression('DISTINCT', new ColumnExpression('booking', 'id'))), 'primaryKeyListString')
  )

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
      prefix: 'DISTINCT',
      expression: new ColumnExpression('booking', 'id'),
    }),
  }),
  $as: 'totalBooking',
})

const lastStatusCodeExpression = new ColumnExpression('booking_tracking', 'lastStatusCode')

function lastStatusExpressionFunction() {

  const lastStatusCodeMap = {

    // left side is called laststatus
    // right side is called lastStatusCode

    notInTrack: [null, 'NEW', 'CANF', 'ERR'],
    processing: ['BKCF', 'EPRL', 'STSP', 'BKD'],
    cargoReady: ['GITM', 'LOBD', 'RCS', 'MNF', 'MAN'],
    departure: ['DLPT', 'DEP'],
    inTransit: ['TSLB', 'TSDC', 'TAP', 'TDE'],
    arrival: ['BDAR', 'DSCH', 'DECL', 'PASS', 'TMPS', 'ARR', 'RWB', 'RCF', 'CUS', 'NFD'],
    delivered: ['STCS', 'RCVE', 'END', 'DLV']

  }

  const cases = []

  for (const lastStatus in lastStatusCodeMap) {
    if (lastStatusCodeMap.hasOwnProperty(lastStatus)) {

      const lastStatusCodeList = lastStatusCodeMap[lastStatus] as any[]

      let condition = new InExpression(lastStatusCodeExpression, false, lastStatusCodeList) as IConditionalExpression

      if (lastStatusCodeList.includes(null)) {

        condition = new OrExpressions([
          new IsNullExpression(lastStatusCodeExpression, false),
          condition
        ])

      }

      cases.push({
        $when: condition,
        $then: new Value(lastStatus)
      } as ICase)

    }
  }

  return new CaseExpression({
    cases,
    $else: lastStatusCodeExpression
  })

}

const lastStatusExpression = lastStatusExpressionFunction()

query.registerBoth('lastStatusCode', lastStatusCodeExpression)

query.registerBoth('lastStatus', lastStatusExpression)

//  register date field
const jobDateExpression = new ColumnExpression('booking', 'createdAt')

const jobYearExpression = new FunctionExpression('LPAD', new FunctionExpression('YEAR', jobDateExpression), 4, '0')

const jobMonthExpression = new FunctionExpression('CONCAT', new FunctionExpression('YEAR', jobDateExpression),
  '-',
  new FunctionExpression('LPAD', new FunctionExpression('MONTH', jobDateExpression), 2, '0'))

const jobWeekExpression = new FunctionExpression('LPAD', new FunctionExpression('WEEK', jobDateExpression), 2, '0')

query.registerBoth('jobDate', jobDateExpression)

query.registerBoth('jobMonth', jobMonthExpression)

query.registerBoth('jobWeek', jobWeekExpression)

query.registerBoth('jobYear', jobYearExpression)

query.register(
  'count',
  new ResultColumn(new FunctionExpression('COUNT', new ParameterExpression('DISTINCT', new ColumnExpression('booking', 'id'))), 'count')
)

query
.register(
  'alertCount',
  new ResultColumn(new FunctionExpression('COUNT', new ParameterExpression('DISTINCT', new ColumnExpression('alert', 'id'))), 'alertCount')
)

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

// used createdAt as jobMonth
query.register('jobMonth', {
  expression: new FunctionExpression({
    name: 'DATE_FORMAT',
    parameters: [new ColumnExpression('booking', 'createdAt'), '%y-%m'],
  }),
  $as: 'jobMonth',
})

//  register summary field
const nestedSummaryList = [] as {
  name: string,
  cases: {
    typeCode: string,
    condition: IConditionalExpression
  }[]
}[]

const summaryFieldList = [
  'totalBooking',
  {
    name: 'quantity',
    expression: new ColumnExpression('booking_popacking', 'quantity')
  },
  {
    name: 'weight',
    expression: new ColumnExpression('booking_popacking', 'weight')
  }
]

function summaryFieldExpression(summaryField: string | { name: string, expression: IExpression }, condition?: IConditionalExpression) {

  const expression = typeof summaryField === 'string' ? new ColumnExpression('booking', summaryField) : summaryField.expression

  if (condition) {
    const countIfExpression = new FunctionExpression('COUNT', new ParameterExpression('DISTINCT', new FunctionExpression('IF', condition, new ColumnExpression('booking', 'id'), new Value(null))))
    const sumIfExpression = new FunctionExpression('SUM', new FunctionExpression('IF', condition, new FunctionExpression('IFNULL', expression, 0), 0))
    return summaryField === 'totalBooking' ? countIfExpression : sumIfExpression
  }

  return (summaryField === 'totalBooking') ?
    new FunctionExpression('COUNT', new ParameterExpression('DISTINCT', new ColumnExpression('booking', 'id'))) :
    new FunctionExpression('SUM', new FunctionExpression('IFNULL', expression, 0))

}

summaryFieldList.map((summaryField: string | { name: string, expression: IExpression }) => {

  const summaryFieldName = typeof summaryField === 'string' ? summaryField : summaryField.name

  //  cmbMonth case
  const resultColumnList = [] as ResultColumn[]

  const nestedSummaryResultColumnList = {} as { [name: string]: ResultColumn[] }

  nestedSummaryList.map(x => {
    nestedSummaryResultColumnList[x.name] = [] as ResultColumn[]
  })

  months.forEach((month, index) => {

    const monthCondition = new BinaryExpression(new FunctionExpression('Month', jobDateExpression), '=', index + 1)

    const monthSumExpression = summaryFieldExpression(summaryField, monthCondition)
    resultColumnList.push(new ResultColumn(monthSumExpression, `${month}_${summaryFieldName}`))

    // ====frc===================

    nestedSummaryList.map(x => {

      // January_T_cbm
      nestedSummaryResultColumnList[x.name].push(new ResultColumn(monthSumExpression, `${month}_T_${summaryFieldName}`))

      x.cases.map(y => {
        const condition = new AndExpressions([
          monthCondition,
          y.condition
        ])

        // January_F_cbm
        const frcMonthSumExpression = summaryFieldExpression(summaryField, condition)
        nestedSummaryResultColumnList[x.name].push(new ResultColumn(frcMonthSumExpression, `${month}_${y.typeCode}_${summaryFieldName}`))

      })

    })

  })

  const totalValueExpression = summaryFieldExpression(summaryField)

  resultColumnList.push(new ResultColumn(totalValueExpression, `total_${summaryFieldName}`))

  nestedSummaryList.map(x => {

    x.cases.map(y => {

      // total_F_cbm
      const typeTotalExpression = summaryFieldExpression(summaryField, y.condition)
      nestedSummaryResultColumnList[x.name].push(new ResultColumn(typeTotalExpression, `total_${y.typeCode}_${summaryFieldName}`))

    })

    nestedSummaryResultColumnList[x.name].push(new ResultColumn(totalValueExpression, `total_T_${summaryFieldName}`))

    query.registerResultColumn(`${x.name}_${summaryFieldName}Month`, (params) => nestedSummaryResultColumnList[x.name])

  })

  // cbmMonth
  query.registerResultColumn(`${summaryFieldName}Month`, (params) => resultColumnList)

  // cbm/chargeableWeight
  query.register(summaryFieldName, new ResultColumn(totalValueExpression, summaryFieldName))

  // cbmLastCurrent

  const lastCurrentFn = (param) => {

    const lastCondition = new BetweenExpression(jobDateExpression, false, new Value(param.subqueries.date.lastFrom), new Value(param.subqueries.date.lastTo))
    const lastSummaryField = summaryFieldExpression(summaryField, lastCondition)

    const currentCondition = new BetweenExpression(jobDateExpression, false, new Value(param.subqueries.date.currentFrom), new Value(param.subqueries.date.currentTo))
    const currentSummaryField = summaryFieldExpression(summaryField, currentCondition)

    return [
      new ResultColumn(lastSummaryField, `${summaryFieldName}Last`),
      new ResultColumn(currentSummaryField, `${summaryFieldName}Current`)
    ]

  }

  query.registerResultColumn(`${summaryFieldName}LastCurrent`, lastCurrentFn)

})

// ------------- register filter

const shipmentTableFilterFieldList = [
  'id',
  'moduleTypeCode',
  'boundTypeCode',
  'nominatedTypeCode',
  'shipmentTypeCode',
  'portOfLoadingCode',
  'divisionCode',
  'isDirect',
  'isCoload',
  'houseNo',
  {
    name: 'carrierCode',
    expression: carrierCodeExpression
  },
  {
    name: 'carrierName',
    expression: carrierNameExpression
  },

  {
    name: 'alertType',
    expression: alertTypeExpression
  },
  {
    name: 'alertSeverity',
    expression: alertSeverityExpression
  },
  {
    name: 'alertCategory',
    expression: alertCategoryExpression
  },
  {
    name: 'alertStatus',
    expression: alertStatusExpression
  },
  {
    name: 'alertContent',
    expression: alertContentExpression
  },
  {
    name: 'lastStatusCode',
    expression: lastStatusCodeExpression
  },
  {
    name: 'lastStatus',
    expression: lastStatusExpression
  },
]

shipmentTableFilterFieldList.map(filterField => {

  const expression = (typeof filterField === 'string') ? new ColumnExpression('booking', filterField) : filterField.expression
  const name = (typeof filterField === 'string') ? filterField : filterField.name

  // normal value IN list filter
  query.register(name,
    new Query({
      $where: new InExpression(expression, false),
    })
  ).register('value', 0)

  // Is not Null filter
  query.register(`${name}IsNotNull`,
    new Query({
      $where: new IsNullExpression(expression, true),
    })
  )

})

query
  .register(
    'carrierIsNotNull',
    new Query({
      $where: new IsNullExpression(carrierCodeExpression, true),
    })
  )

// booking party Filter================================
partyList.map(party => {

  query
    .register(
      `${party}PartyId`,
      new Query({
        $where: new InExpression(new ColumnExpression('booking_party', `${party}PartyId`), false),
      })
    )
    .register('value', 0)

  query
    .register(
      `${party}IsNotNull`,
      new Query({
        $where: new IsNullExpression(new ColumnExpression('booking_party', `${party}PartyId`), true),
      })
    )
})

// Location Filter=================

locationList.map(location => {

  const columnName = `${location}Code`
  // Port of Loading
  query
    .register(
      columnName,
      new Query({
        $where: new InExpression(new ColumnExpression('booking', columnName), false),
      })
    )
    .register('value', 0)
})

// regiter date filter
const dateList = [
  'departureDateEstimated',
  'departureDateAcutal',
  'arrivalDateEstimated',
  'arrivalDateActual',

  'oceanBillDateEstimated',
  'oceanBillDateAcutal',
  'cargoReadyDateEstimated',
  'cargoReadyDateActual',

  'cyCutOffDateEstimated',
  'cyCutOffDateAcutal',
  'pickupDateEstimated',
  'pickupDateActual',

  'cargoReceiptDateEstimated',
  'cargoReceiptDateAcutal',
  'finalDoorDeliveryDateEstimated',
  'finalDoorDeliveryDateActual',

  {
    name: 'alertCreatedAt',
    expression: alertCreatedAtExpression

  },

  {
    name: 'alertUpdatedAt',
    expression: alertUpdatedAtExpression

  }

]

// Date Filter=================

query
  .register(
    'date',
    new Query({

      $where: new AndExpressions([

        // normal date case

        new OrExpressions([
          new OrExpressions([
            new IsNullExpression(new Unknown(), false),
            new IsNullExpression(new Unknown(), false),
          ]),
          new BetweenExpression(new ColumnExpression('booking', 'createdAt'), false, new Unknown(), new Unknown()),
        ]),

        // last current date case
        new OrExpressions([

          // only if all 4 dates is Null, else still check lastFromTo and CurrentFromTo
          new OrExpressions([
            new IsNullExpression(new Unknown(), false),
            new IsNullExpression(new Unknown(), false),
            new IsNullExpression(new Unknown(), false),
            new IsNullExpression(new Unknown(), false),
          ]),

          new BetweenExpression(new ColumnExpression('booking', 'createdAt'), false, new Unknown(), new Unknown()),
          new BetweenExpression(new ColumnExpression('booking', 'createdAt'), false, new Unknown(), new Unknown())
        ]),

      ])

    })
  )
  .register('from', 0)
  .register('to', 1)

  .register('from', 2)
  .register('to', 3)

  .register('lastFrom', 4)
  .register('lastTo', 5)
  .register('currentFrom', 6)
  .register('currentTo', 7)

  .register('lastFrom', 8)
  .register('lastTo', 9)
  .register('currentFrom', 10)
  .register('currentTo', 11)

dateList.map(date => {

  const dateColumnName = typeof date === 'string' ? date : date.name
  const dateColumnExpression = typeof date === 'string' ? new ColumnExpression('booking_date', date) : date.expression

  query
    .register(
      dateColumnName,
      new Query({
        $where: new BetweenExpression(dateColumnExpression, false, new Unknown(), new Unknown()),
      })
    )
    .register('from', 0)
    .register('to', 1)

})

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
          new RegexpExpression(new ColumnExpression('booking_party', 'agentPartyCode'), false),
          new RegexpExpression(new ColumnExpression('booking_party', 'agentPartyName'), false),
          new RegexpExpression(new ColumnExpression('booking_party', 'consigneePartyCode'), false),
          new RegexpExpression(new ColumnExpression('booking_party', 'consigneePartyName'), false),
          new RegexpExpression(new ColumnExpression('booking_party', 'notifyPartyPartyCode'), false),
          new RegexpExpression(new ColumnExpression('booking_party', 'notifyPartyPartyName'), false),
          new RegexpExpression(new ColumnExpression('booking_party', 'controllingCustomerPartyCode'), false),
          new RegexpExpression(new ColumnExpression('booking_party', 'controllingCustomerPartyName'), false),
          new RegexpExpression(new ColumnExpression('booking_party', 'linerAgentPartyCode'), false),
          new RegexpExpression(new ColumnExpression('booking_party', 'linerAgentPartyName'), false),
          new RegexpExpression(new ColumnExpression('booking_party', 'forwarderPartyCode'), false),
          new RegexpExpression(new ColumnExpression('booking_party', 'forwarderPartyName'), false),
          new RegexpExpression(new ColumnExpression('booking_party', 'roAgentPartyName'), false),
          new RegexpExpression(new ColumnExpression('booking_party', 'roAgentPartyCode'), false),
          new RegexpExpression(new ColumnExpression('booking_party', 'shipperPartyCode'), false),
          new RegexpExpression(new ColumnExpression('booking_party', 'shipperPartyName'), false),
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
  .register('value', 26)
  .register('value', 27)
  .register('value', 28)
  .register('value', 29)
  .register('value', 30)
  .register('value', 31)
  .register('value', 32)
  // .register('value', 33)

const isActiveConditionExpression = new AndExpressions([
  new IsNullExpression(new ColumnExpression('booking', 'deletedAt'), false),
  new IsNullExpression(new ColumnExpression('booking', 'deletedBy'), false)
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

}))
.register('value', 0)
.register('value', 1)

export default query
