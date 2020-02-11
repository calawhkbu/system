import { QueryDef, ResultColumnFn, GroupByFn } from 'classes/query/QueryDef'
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
  CaseExpression,
  ICase,
  Value,
  Unknown,
  ExistsExpression,
  LikeExpression,
  JoinClause,
  QueryExpression,
  IJoinClause,
  IColumnExpression,
  IExpression,
  IResultColumn,
  OrderBy,
  IConditionalExpression
} from 'node-jql'
import { IQueryParams } from 'classes/query'

// warning : this file should not be called since the shipment should be getting from outbound but not from internal

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

const agentPartyIdExpression = new CaseExpression({

  cases: [
    {
      $when: new AndExpressions([
        new BinaryExpression(new ColumnExpression('shipment', 'billTypeCode'), '=', 'M'),
        new BinaryExpression(new ColumnExpression('shipment', 'moduleTypeCode'), '=', 'AIR')
      ]),
      $then: new ColumnExpression('shipment_party', 'consigneePartyId')
    }
  ],
  $else: new ColumnExpression('shipment_party', 'agentPartyId')

})

const agentPartyNameExpression = new CaseExpression({
  cases: [
    {
      $when: new AndExpressions([
        new BinaryExpression(new ColumnExpression('shipment', 'billTypeCode'), '=', 'M'),
        new BinaryExpression(new ColumnExpression('shipment', 'moduleTypeCode'), '=', 'AIR'),
      ]),
      $then: new FunctionExpression('IFNULL', new ColumnExpression('shipment_party', `consigneePartyName`), new ColumnExpression('shipment_party', `consigneePartyCode`))
    }
  ],
  $else: new FunctionExpression('IFNULL', new ColumnExpression('shipment_party', `agentPartyName`), new ColumnExpression('shipment_party', `agentPartyCode`))
})

const agentPartyCodeExpression = new CaseExpression({
  cases: [
    {
      $when: new AndExpressions([
        new BinaryExpression(new ColumnExpression('shipment', 'billTypeCode'), '=', 'M'),
        new BinaryExpression(new ColumnExpression('shipment', 'moduleTypeCode'), '=', 'AIR'),
      ]),
      $then: new ColumnExpression('shipment_party', `consigneePartyCode`)
    }
  ],
  $else: new ColumnExpression('shipment_party', `agentPartyCode`)
})

const partyList = [

  {
    name: 'shipper',
  },
  {
    name: 'consignee',
  },
  {
    name: 'roAgent',
  },
  {
    name: 'linerAgent',
  },
  {
    name: 'office',
  },
  {
    name: 'controllingCustomer',
  },
  {
    name: 'agent',
    partyNameExpression: agentPartyNameExpression,
    partyIdExpression: agentPartyIdExpression,
    partyCodeExpression: agentPartyCodeExpression
  }
]
const locationList = ['portOfLoading', 'portOfDischarge', 'placeOfDelivery', 'placeOfReceipt', 'finalDestination']

const query = new QueryDef(
  new Query({
    // $distinct: true,
    $select: [
      new ResultColumn(new ColumnExpression('shipment', '*')),
      new ResultColumn(new ColumnExpression('shipment', 'id'), 'shipmentId'),
      new ResultColumn(new ColumnExpression('shipment', 'id'), 'shipmentPartyId'),
    ],
    $from: new FromTable(
      'shipment',

      // LEFT JOIN shipment_date
      {
        operator: 'LEFT',
        table: new FromTable({
          table: new Query({
            $select: [
              new ResultColumn(new ColumnExpression('shipment_date', '*')),
            ],
            $from: new FromTable('shipment_date', 'shipment_date'),
            $where: new AndExpressions({
              expressions: [
                new IsNullExpression(new ColumnExpression('shipment_date', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('shipment_date', 'deletedBy'), false),
              ]
            }),
          }),
          $as: 'shipment_date'
        }),
        $on: new BinaryExpression(new ColumnExpression('shipment', 'id'), '=', new ColumnExpression('shipment_date', 'shipmentId'))
      },

      // LEFT JOIN shipment_party
      {
        operator: 'LEFT',
        table: new FromTable({
          table: new Query({
            $select: [
              new ResultColumn(new ColumnExpression('shipment_party', '*')),
            ],
            $from: new FromTable('shipment_party', 'shipment_party'),
            $where: new AndExpressions({
              expressions: [
                new IsNullExpression(new ColumnExpression('shipment_party', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('shipment_party', 'deletedBy'), false),
              ]
            }),
          }),
          $as: 'shipment_party'
        }),
        $on: new BinaryExpression(new ColumnExpression('shipment', 'id'), '=', new ColumnExpression('shipment_party', 'shipmentId'))
      },

      //  loop all party, and perform LEFT JOIN
      ...partyList.map(party => {

        const partyTableName = party.name
        const partyIdExpression = party.partyIdExpression || new ColumnExpression('shipment_party', `${partyTableName}PartyId`)

        return ({
          operator: 'LEFT',
          table: new FromTable('party', partyTableName),
          $on: [
            new BinaryExpression(
              partyIdExpression,
              '=',
              new ColumnExpression(partyTableName, 'id')
            ),
          ],
        }) as IJoinClause
      }),

    ),
  })
)

// register join =====================

const firstTableExpression = new Query({
  $select: [
    new ResultColumn('id', 'shipmentId'),
    new ResultColumn('masterNo', 'trackingNo'),
    new ResultColumn(new Value(3), 'priority')
  ],

  $from: new FromTable('shipment'),

  $union: new Query({

    $select: [
      new ResultColumn(new ColumnExpression('shipmentId'), 'shipmentId'),
      new ResultColumn(new ColumnExpression('carrierBookingNo'), 'trackingNo'),
      new ResultColumn(new Value(2), 'priority')
    ],

    $from: new FromTable({
      table: 'shipment_container',
    }),
    $union: new Query({

      $select: [

        new ResultColumn(new ColumnExpression('shipmentId'), 'shipmentId'),
        new ResultColumn(new ColumnExpression('containerNo'), 'trackingNo'),
        new ResultColumn(new Value(1), 'priority')
      ],

      $from: new FromTable({
        table: 'shipment_container',
      }),

      $union: new Query({

        $select: [

          new ResultColumn('id', 'shipmentId'),
          new ResultColumn(new Value(null), 'trackingNo'),
          new ResultColumn(new Value(0), 'priority')
        ],

        $from: new FromTable({
          table: 'shipment'
        })

      })

    })

  })

})

const shipmentTrackingExpression = new Query({

  $select: [
    new ResultColumn(new ColumnExpression('shipment', 'shipmentId')),
    new ResultColumn(new ColumnExpression('shipment', 'trackingNo')),
    new ResultColumn(new ColumnExpression('tracking', 'lastStatusCode')),
    new ResultColumn(new ColumnExpression('tracking', 'updatedAt')),
    new ResultColumn(new ColumnExpression('shipment', 'priority'))

  ],

  $from: new FromTable({
    table: firstTableExpression,
    $as: 'shipment',
    joinClauses: [
      {
        operator: 'LEFT',
        table: 'tracking',
        $on: new BinaryExpression(new ColumnExpression('tracking', 'trackingNo'), '=', new ColumnExpression('shipment', 'trackingNo'))
      }
    ],
  }),

  $order: [
    new OrderBy(new ColumnExpression('shipment', 'shipmentId')),
    new OrderBy(new ColumnExpression('shipment', 'priority')),
  ]

})

const minTableExpression = new Query({
  $select: [
    new ResultColumn(new ColumnExpression('shipment', 'id'), 'shipmentId'),
    new ResultColumn('masterNo', 'trackingNo'),
    new ResultColumn(new FunctionExpression('IF', new IsNullExpression(new ColumnExpression('tracking', 'lastStatusCode'), false), new Value(0), new Value(3)), 'priority'),
    new ResultColumn(new ColumnExpression('tracking', 'updatedAt'))
  ],

  $from: new FromTable('shipment', {
    operator: 'LEFT',
    table: 'tracking',
    $on: new BinaryExpression(new ColumnExpression('tracking', 'trackingNo'), '=', new ColumnExpression('shipment', 'masterNo'))
  }),

  $union: new Query({

    $select: [
      new ResultColumn(new ColumnExpression('shipmentId'), 'shipmentId'),
      new ResultColumn(new ColumnExpression('carrierBookingNo'), 'trackingNo'),
      new ResultColumn(new FunctionExpression('IF', new IsNullExpression(new ColumnExpression('tracking', 'lastStatusCode'), false), new Value(0), new Value(2)), 'priority'),
      new ResultColumn(new ColumnExpression('tracking', 'updatedAt'))
    ],

    $from: new FromTable('shipment_container', {
      operator: 'LEFT',
      table: 'tracking',
      $on: new BinaryExpression(new ColumnExpression('tracking', 'trackingNo'), '=', new ColumnExpression('shipment_container', 'carrierBookingNo'))
    }),
    $union: new Query({

      $select: [

        new ResultColumn(new ColumnExpression('shipmentId'), 'shipmentId'),
        new ResultColumn(new ColumnExpression('containerNo'), 'trackingNo'),
        new ResultColumn(new FunctionExpression('IF', new IsNullExpression(new ColumnExpression('tracking', 'lastStatusCode'), false), new Value(0), new Value(1)), 'priority'),
        new ResultColumn(new ColumnExpression('tracking', 'updatedAt'))
      ],

      $from: new FromTable('shipment_container', {
        operator: 'LEFT',
        table: 'tracking',
        $on: new BinaryExpression(new ColumnExpression('tracking', 'trackingNo'), '=', new ColumnExpression('shipment_container', 'containerNo'))
      }),

    })

  })

})

const shipmentProrityTableExpression = new Query({
  $select: [
    new ResultColumn(new ColumnExpression('min_table', 'shipmentId')),
    new ResultColumn(new FunctionExpression('MAX', new ColumnExpression('min_table', 'priority')), 'max_priority'),
    new ResultColumn(new FunctionExpression('MAX', new ColumnExpression('min_table', 'updatedAt')), 'max_updatedAt')
  ],

  $from: new FromTable({
    table: minTableExpression,
    $as: 'min_table',
  }),
  $group: new GroupBy(new ColumnExpression('min_table', 'shipmentId'))

})

const finalTableExpression = new Query({

  $select: [
    new ResultColumn(new ColumnExpression('shipment_tracking', 'shipmentId')),
    new ResultColumn(new ColumnExpression('shipment_tracking', 'lastStatusCode'))
  ],

  $from: new FromTable({

    table: shipmentTrackingExpression,
    $as: 'shipment_tracking',

    joinClauses: [{

      operator: 'LEFT',
      table: new FromTable({
        table: shipmentProrityTableExpression,
        $as: 'shipment_priority'
      }),
      $on: [
        new BinaryExpression(new ColumnExpression('shipment_tracking', 'shipmentId'), '=', new ColumnExpression('shipment_priority', 'shipmentId'))

      ]
    }]
  }),

  $where: [
    new BinaryExpression(new ColumnExpression('shipment_priority', 'max_priority'), '=', new ColumnExpression('shipment_tracking', 'priority')),
    new OrExpressions([
      new BinaryExpression(new ColumnExpression('shipment_priority', 'max_updatedAt'), '=', new ColumnExpression('shipment_tracking', 'updatedAt')),
      new IsNullExpression(new ColumnExpression('shipment_tracking', 'updatedAt'), false)

    ])

  ]

})

query.registerQuery('lastStatusJoin', new Query({

  $from: new FromTable('shipment', {

    operator: 'LEFT',
    table: new FromTable({

      table: finalTableExpression,
      $as: 'shipment_tracking',

    }),
    $on: new BinaryExpression(new ColumnExpression('shipment_tracking', 'shipmentId'), '=', new ColumnExpression('shipment', 'id'))

  })

}))

//  alert Join
// warning !!! this join will create duplicate record of shipment
// plz use wisely, mainly use together with group by
query.registerQuery(
  'alertJoin', new Query({

    $from: new FromTable('shipment', {

      operator: 'LEFT',
      table: 'alert',

      $on: [
        new BinaryExpression(new ColumnExpression('alert', 'tableName'), '=', 'shipment'),
        new BinaryExpression(new ColumnExpression('alert', 'primaryKey'), '=', new ColumnExpression('shipment', 'id'))
      ]

    }),

    $where: new IsNullExpression(new ColumnExpression('alert', 'id'), true)

  })
)

locationList.map(location => {

  const subqueriesName = `${location}Join`
  const locationCode = `${location}Code`

  // location join (e.g. portOfLoadingJoin)
  query.registerQuery(
    subqueriesName, new Query({

      $from: new FromTable('shipment', {

        operator: 'LEFT',
        table: 'location',
        $on: [
          new BinaryExpression(new ColumnExpression('location', 'portCode'), '=', new ColumnExpression('shipment', locationCode)),
        ]
      }),

      $where: new IsNullExpression(new ColumnExpression('shipment', locationCode), true)

    })
  )

})

// =======================================

query.registerQuery('shipmentAll', new Query({

  $from: new FromTable({

    table: 'shipment',
    joinClauses: [

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
            $from: new FromTable('shipment_amount'),
            $where: new AndExpressions({
              expressions: [
                new IsNullExpression(new ColumnExpression('shipment_amount', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('shipment_amount', 'deletedBy'), false)
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
            $from: new FromTable('shipment_cargo'),
            $where: new AndExpressions({
              expressions: [
                new IsNullExpression(new ColumnExpression('shipment_cargo', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('shipment_cargo', 'deletedBy'), false)
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
            $from: new FromTable('shipment_container'),
            $where: new AndExpressions({
              expressions: [
                new IsNullExpression(new ColumnExpression('shipment_container', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('shipment_container', 'deletedBy'), false)
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
            $from: new FromTable('shipment_po'),
            $where: new AndExpressions({
              expressions: [
                new IsNullExpression(new ColumnExpression('shipment_po', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('shipment_po', 'deletedBy'), false)
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
            $from: new FromTable('shipment_reference'),
            $where: new AndExpressions({
              expressions: [
                new IsNullExpression(new ColumnExpression('shipment_reference', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('shipment_reference', 'deletedBy'), false),
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
            $from: new FromTable('shipment_transport'),
            $where: new AndExpressions({
              expressions: [
                new IsNullExpression(new ColumnExpression('shipment_transport', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('shipment_transport', 'deletedBy'), false)
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
      },

    ]
  })

}))

//  register field =======================

// shipment table field
query
  .registerResultColumn(
    'id',
    new ResultColumn(new ColumnExpression('shipment', 'id'))
  )

// query
//   .registerResultColumn(
//     'primaryKey',
//     new ResultColumn(new ColumnExpression('shipment', 'id'), 'primaryKey')
//   )

query
  .registerResultColumn(
    'partyGroupCode',
    new ResultColumn(new ColumnExpression('shipment', 'partyGroupCode'))
  )

// //  IFNULL(carrier.carrierCode, billTransport.carrierCode)

const agentGroupExpression = new CaseExpression({

  cases: [
    {
      $when: new AndExpressions([
        new BinaryExpression(new ColumnExpression('shipment', 'billTypeCode'), '=', 'M'),
        new BinaryExpression(new ColumnExpression('shipment', 'moduleTypeCode'), '=', 'AIR')
      ]),
      $then: new ColumnExpression('consignee', 'groupName')
    }
  ],
  $else: new ColumnExpression('agent', 'groupName')

})

const carrierCodeExpression = new FunctionExpression('IFNULL',
  new CaseExpression({

    cases: [
      {
        $when: new BinaryExpression(new ColumnExpression('shipment', 'moduleTypeCode'), '=', 'AIR'),
        $then: new QueryExpression(new Query({

          $select: [
            new ResultColumn(new ColumnExpression('cm1', 'name'))
          ],
          $from: new FromTable({

            table: 'code_master',
            $as: 'cm1'
          }),
          $where: [
            new BinaryExpression(new ColumnExpression('cm1', 'codeType'), '=', 'CARRIER_SWIVEL_TO_YD'),
            new BinaryExpression(new ColumnExpression('cm1', 'code'), '=', new FunctionExpression('LEFT', new ColumnExpression('shipment', 'houseNo'), 3))
          ]

        }))
      }
    ],

    $else: new ColumnExpression('shipment', 'carrierCode')

  }),
  new ColumnExpression('shipment', 'carrierCode')
)

const carrierNameExpression = new FunctionExpression('IFNULL',
  new FunctionExpression('IFNULL',
    new CaseExpression({

      cases: [{

        $when: new BinaryExpression(new ColumnExpression('shipment', 'moduleTypeCode'), '=', 'AIR'),
        $then: new QueryExpression(new Query({

          $select: [
            new ResultColumn(new ColumnExpression('cm2', 'name'))
          ],
          $from: new FromTable({
            table: 'code_master',
            $as: 'cm1',
            joinClauses: [
              new JoinClause({

                table: new FromTable({
                  table: 'code_master',
                  $as: 'cm2'
                }),

                $on: [
                  new BinaryExpression(new ColumnExpression('cm1', 'name'), '=', new ColumnExpression('cm2', 'code')),
                  new BinaryExpression(new ColumnExpression('cm2', 'codeType'), '=', 'CARRIER')
                ]

              })
            ]
          }),
          $where: [
            new BinaryExpression(new ColumnExpression('cm1', 'codeType'), '=', 'CARRIER_SWIVEL_TO_YD'),
            new BinaryExpression(new ColumnExpression('cm1', 'code'), '=', new FunctionExpression('LEFT', new ColumnExpression('shipment', 'houseNo'), 3))
          ]

        }))
      }],

      $else: new ColumnExpression('shipment', 'carrierName')

    }),
    new ColumnExpression('shipment', 'carrierName')
  ),
  carrierCodeExpression
)

const salesmanPersonCodeExpression = new CaseExpression({
  cases: [
    {
      $when: new IsNullExpression(
        new ColumnExpression('shipment', 'rSalesmanPersonCode'), true
      ),
      $then: new ColumnExpression('shipment', 'rSalesmanPersonCode')
    },
    {
      $when: new BinaryExpression(
        new ColumnExpression('shipment', 'boundTypeCode'),
        '=',
        'O'
      ),
      $then: new ColumnExpression('shipment', 'sSalesmanPersonCode')
    },
    {
      $when: new BinaryExpression(
        new ColumnExpression('shipment', 'boundTypeCode'),
        '=',
        'I'
      ),
      $then: new ColumnExpression('shipment', 'cSalesmanPersonCode')
    }
  ],
  $else: null
})

const defaultReportingGroupExpression = new CaseExpression({

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

// CASE
// WHEN b.division = 'AE' AND b.isDirect = 0 THEN 'AC'
// WHEN b.division = 'AE' AND b.isDirect = 1 THEN 'AD'
// WHEN b.division = 'AI' AND b.isDirect = 0 THEN 'AM'
// WHEN b.division = 'AI' AND b.isDirect = 1 THEN 'AN'
// WHEN b.division = 'TA' THEN 'AW'
// WHEN office.partyId = 7351496 AND b.division = 'TAE' THEN 'AU'
// WHEN office.partyId = 7351496 AND b.division = 'TAI' THEN 'AV'
// WHEN b.division = 'MM' THEN 'AX'
// WHEN b.division = 'AM' THEN 'AZ'
// WHEN b.division = 'SE' AND b.shipmentType = 'FCL' THEN 'SA'
// WHEN b.division = 'SE' AND b.shipmentType = 'LCL' THEN 'SB'
// WHEN b.division = 'SE' AND b.shipmentType = 'Consol' THEN 'SC'
// WHEN b.division = 'SI' AND b.shipmentType = 'FCL' THEN 'SR'
// WHEN b.division = 'SI' AND b.shipmentType = 'LCL' THEN 'SS'
// WHEN b.division = 'SI' AND b.shipmentType = 'Consol' THEN 'ST'
// WHEN office.partyId = 7351496 AND b.division = 'TSE' THEN 'SU'
// WHEN office.partyId = 7351496 AND b.division = 'TSI' THEN 'SV'
// WHEN b.division = 'TS' THEN 'SW'
// WHEN b.division = 'SM' THEN 'SZ'
// WHEN b.division = 'LOG' THEN 'ZL'
// ELSE LEFT(b.division, 2)
// END

const gglTaiwanOfficeOld360Id = 7351496
const gglreportingGroupExpression = new CaseExpression({

  cases: [
    {
      $when: new AndExpressions([
        new BinaryExpression(new ColumnExpression('shipment', 'divisionCode'), '=', 'AE'),
        new BinaryExpression(new ColumnExpression('shipment', 'isDirect'), '=', 0),
      ]),
      $then: new Value('AC')
    },
    {
      $when: new AndExpressions([
        new BinaryExpression(new ColumnExpression('shipment', 'divisionCode'), '=', 'AE'),
        new BinaryExpression(new ColumnExpression('shipment', 'isDirect'), '=', 1),
      ]),
      $then: new Value('AD')
    },
    {
      $when: new AndExpressions([
        new BinaryExpression(new ColumnExpression('shipment', 'divisionCode'), '=', 'AI'),
        new BinaryExpression(new ColumnExpression('shipment', 'isDirect'), '=', 0),
      ]),
      $then: new Value('AM')
    },
    {
      $when: new AndExpressions([
        new BinaryExpression(new ColumnExpression('shipment', 'divisionCode'), '=', 'AI'),
        new BinaryExpression(new ColumnExpression('shipment', 'isDirect'), '=', 1),
      ]),
      $then: new Value('AN')
    },

    {
      $when: new AndExpressions([
        new BinaryExpression(new ColumnExpression('shipment', 'divisionCode'), '=', 'TA'),
      ]),
      $then: new Value('AW')
    },

    // -------------------------

    {
      $when: new AndExpressions([

        new BinaryExpression(new FunctionExpression(
          'JSON_UNQUOTE',
          new FunctionExpression('JSON_EXTRACT', new ColumnExpression('office', 'thirdPartyCode'), '$.old360')
        ), '=', gglTaiwanOfficeOld360Id),

        new BinaryExpression(new ColumnExpression('shipment', 'divisionCode'), '=', 'TAE')
      ]),
      $then: new Value('AU')
    },

    {
      $when: new AndExpressions([

        new BinaryExpression(new FunctionExpression(
          'JSON_UNQUOTE',
          new FunctionExpression('JSON_EXTRACT', new ColumnExpression('office', 'thirdPartyCode'), '$.old360')
        ), '=', gglTaiwanOfficeOld360Id),

        new BinaryExpression(new ColumnExpression('shipment', 'divisionCode'), '=', 'TAE')
      ]),
      $then: new Value('AU')
    },

    {
      $when: new AndExpressions([
        new BinaryExpression(new ColumnExpression('shipment', 'divisionCode'), '=', 'MM'),
      ]),
      $then: new Value('AX')
    },

    {
      $when: new AndExpressions([
        new BinaryExpression(new ColumnExpression('shipment', 'divisionCode'), '=', 'AM'),
      ]),
      $then: new Value('AZ')
    },

    // SEA case =================================

    {
      $when: new AndExpressions([
        new BinaryExpression(new ColumnExpression('shipment', 'divisionCode'), '=', 'SE'),
        new BinaryExpression(new ColumnExpression('shipment', 'shipmentTypeCode'), '=', 'FCL'),
      ]),
      $then: new Value('SA')
    },
    {
      $when: new AndExpressions([
        new BinaryExpression(new ColumnExpression('shipment', 'divisionCode'), '=', 'SE'),
        new BinaryExpression(new ColumnExpression('shipment', 'shipmentTypeCode'), '=', 'LCL'),
      ]),
      $then: new Value('SB')
    },
    {
      $when: new AndExpressions([
        new BinaryExpression(new ColumnExpression('shipment', 'divisionCode'), '=', 'SE'),
        new BinaryExpression(new ColumnExpression('shipment', 'shipmentTypeCode'), '=', 'Consol'),
      ]),
      $then: new Value('SC')
    },

    {
      $when: new AndExpressions([
        new BinaryExpression(new ColumnExpression('shipment', 'divisionCode'), '=', 'SI'),
        new BinaryExpression(new ColumnExpression('shipment', 'shipmentTypeCode'), '=', 'FCL'),
      ]),
      $then: new Value('SR')
    },
    {
      $when: new AndExpressions([
        new BinaryExpression(new ColumnExpression('shipment', 'divisionCode'), '=', 'SI'),
        new BinaryExpression(new ColumnExpression('shipment', 'shipmentTypeCode'), '=', 'LCL'),
      ]),
      $then: new Value('SS')
    },
    {
      $when: new AndExpressions([
        new BinaryExpression(new ColumnExpression('shipment', 'divisionCode'), '=', 'SI'),
        new BinaryExpression(new ColumnExpression('shipment', 'shipmentTypeCode'), '=', 'Consol'),
      ]),
      $then: new Value('ST')
    },

    // -------------------------

    {
      $when: new AndExpressions([

        new BinaryExpression(new FunctionExpression(
          'JSON_UNQUOTE',
          new FunctionExpression('JSON_EXTRACT', new ColumnExpression('office', 'thirdPartyCode'), '$.old360')
        ), '=', gglTaiwanOfficeOld360Id),

        new BinaryExpression(new ColumnExpression('shipment', 'divisionCode'), '=', 'TSE')
      ]),
      $then: new Value('SU')
    },

    {
      $when: new AndExpressions([

        new BinaryExpression(new FunctionExpression(
          'JSON_UNQUOTE',
          new FunctionExpression('JSON_EXTRACT', new ColumnExpression('office', 'thirdPartyCode'), '$.old360')
        ), '=', gglTaiwanOfficeOld360Id),

        new BinaryExpression(new ColumnExpression('shipment', 'divisionCode'), '=', 'TSI')
      ]),
      $then: new Value('SV')
    },

    {
      $when: new AndExpressions([
        new BinaryExpression(new ColumnExpression('shipment', 'divisionCode'), '=', 'TS'),
      ]),
      $then: new Value('SW')
    },

    {
      $when: new AndExpressions([
        new BinaryExpression(new ColumnExpression('shipment', 'divisionCode'), '=', 'SM'),
      ]),
      $then: new Value('SZ')
    },

    {
      $when: new AndExpressions([
        new BinaryExpression(new ColumnExpression('shipment', 'divisionCode'), '=', 'LOG'),
      ]),
      $then: new Value('ZL')
    },

  ],

  $else: new FunctionExpression('LEFT', new ColumnExpression('shipment', 'divisionCode'), 2)
})

const reportingGroupExpression = new CaseExpression({

  cases: [
    {
      $when: new BinaryExpression(new ColumnExpression('shipment', 'partyGroupCode'), '=', 'GGL'),
      $then: gglreportingGroupExpression
    }

  ],

  $else: defaultReportingGroupExpression

})

const lastStatusCodeExpression = new ColumnExpression('shipment_tracking', 'lastStatusCode')

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

const alertTypeExpression = new ColumnExpression('alert', 'alertType')

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

query.registerBoth('agentGroup', agentGroupExpression)

query.registerBoth('carrierCode', carrierCodeExpression)

query.registerBoth('carrierName', carrierNameExpression)

query.registerBoth('salesmanPersonCode', salesmanPersonCodeExpression)

query.registerBoth('reportingGroup', reportingGroupExpression)

query.registerBoth('lastStatusCode', lastStatusCodeExpression)

query.registerBoth('lastStatus', lastStatusExpression)

query.registerBoth('alertType', alertTypeExpression)

query.registerBoth('alertTitle', alertTitleExpression)

query.registerBoth('alertMessage', alertMessageExpression)

query.registerBoth('alertCategory', alertCategoryExpression)

query.registerBoth('alertCreatedAt', alertCreatedAtExpression)

query.registerBoth('alertUpdatedAt', alertUpdatedAtExpression)

query.registerBoth('alertContent', alertContentExpression)

query.registerBoth('alertStatus', alertStatusExpression)

// ===========================

// shipment_party table
// { shipper, consignee, office, linerAgent, roAgent, agent, controllingCustomer }
// {x}PartyContactPersonId
// {x}PartyContactName
// {x}PartyContactEmail
// {x}PartyContactPhone
// {x}PartyContactIdentity
// {x}PartyContacts
// {x}PartyIdentity
// {x}PartyAddress

// Agent special case :
// CASE WHEN shipment.billType = 'M' AND shipment.moduleTypeCode = 'AIR'
// THEN consignee.name
// ELSE agent.name
// END

// party field ======================
const partyFieldList = [
  'PartyId',
  'PartyName',
  'PartyCode',
  'PartyContactPersonId',
  'PartyContactName',
  'PartyContactEmail',
  'PartyContactPhone',
  'PartyContactIdentity',
  'PartyContacts',
  'PartyIdentity',
  'PartyAddress'
]

partyList.map(party => {

  const partyTableName = party.name
  const partyIdExpression = party.partyIdExpression || new ColumnExpression('shipment_party', `${partyTableName}PartyId`)
  const partyNameExpression = party.partyNameExpression || new ColumnExpression('shipment_party', `${partyTableName}PartyName`)
  const partyCodeExpression = party.partyCodeExpression || new ColumnExpression('shipment_party', `${partyTableName}PartyCode`)

  partyFieldList.map(partyField => {

    const fieldName = `${partyTableName}${partyField}`

    let expression: IExpression

    switch (partyField) {

      case 'PartyCode':
        expression = partyCodeExpression
        break

      case 'PartyName':
        expression = partyNameExpression
        break

      case 'PartyId':
        expression = partyIdExpression
        break

      default:
        expression = new ColumnExpression('shipment_party', fieldName) as IExpression
        break
    }

    query.registerBoth(fieldName, expression)
  })

})

// ===========================

// shipment_date table
// { oceanBill, cargoReady, cYCutOff, pickup, cargoReceipt, depature, arrival,finalDoorDelivery }
// {x}DateEstimated
// {x}DateActual
// {x}DateRemark

// ====================================

// calculation field

// calculation ==============================

query
  .register(
    'count',
    new ResultColumn(new FunctionExpression('COUNT', new ParameterExpression('DISTINCT', new ColumnExpression('shipment', 'id'))), 'count')
  )

const jobDateExpression = new ColumnExpression('shipment', 'jobDate')

const jobYearExpression = new FunctionExpression('LPAD', new FunctionExpression('YEAR', jobDateExpression), 4, '0')

const jobMonthExpression = new FunctionExpression('CONCAT', new FunctionExpression('YEAR', jobDateExpression),
  '-',
  new FunctionExpression('LPAD', new FunctionExpression('MONTH', jobDateExpression), 2, '0'))

const jobWeekExpression = new FunctionExpression('LPAD', new FunctionExpression('WEEK', jobDateExpression), 2, '0')

query.registerBoth('jobDate', jobDateExpression)

query.registerBoth('jobMonth', jobMonthExpression)

query.registerBoth('jobWeek', jobWeekExpression)

query.registerBoth('jobYear', jobYearExpression)

// summary fields  =================

const nestedSummaryList = [

  {
    name: 'frc',
    cases: [
      {
        typeCode: 'F',
        condition: new AndExpressions([
          new BinaryExpression(new ColumnExpression('shipment', 'nominatedTypeCode'), '=', 'F'),
          new ExistsExpression(new Query({

            $from: 'party_type',
            $where: [
              new BinaryExpression(new ColumnExpression('party_type', 'partyId'), '=', new ColumnExpression('shipment_party', 'controllingCustomerPartyId')),
              new BinaryExpression(new ColumnExpression('party_type', 'type'), '=', 'forwarder')
            ]

          }), true)
        ])

      },
      {
        typeCode: 'R',
        condition: new AndExpressions([
          new BinaryExpression(new ColumnExpression('shipment', 'nominatedTypeCode'), '=', 'R'),
          new ExistsExpression(new Query({

            $from: 'party_type',
            $where: [
              new BinaryExpression(new ColumnExpression('party_type', 'partyId'), '=', new ColumnExpression('shipment_party', 'controllingCustomerPartyId')),
              new BinaryExpression(new ColumnExpression('party_type', 'type'), '=', 'forwarder')
            ]

          }), true)
        ])
      },
      {
        typeCode: 'C',
        condition: new AndExpressions([
          new ExistsExpression(new Query({

            $from: 'party_type',
            $where: [
              new BinaryExpression(new ColumnExpression('party_type', 'partyId'), '=', new ColumnExpression('shipment_party', 'controllingCustomerPartyId')),
              new BinaryExpression(new ColumnExpression('party_type', 'type'), '=', 'forwarder')
            ]

          }), false)
        ])
      }
    ]
  },

  {

    name: 'fr',
    cases: [
      {
        typeCode: 'F',
        condition: new BinaryExpression(new ColumnExpression('shipment', 'nominatedTypeCode'), '=', 'F')
      },
      {
        typeCode: 'R',
        condition: new BinaryExpression(new ColumnExpression('shipment', 'nominatedTypeCode'), '=', 'R')
      },
    ]
  }

] as {
  name: string,
  cases: {
    typeCode: string,
    condition: IConditionalExpression
  }[]
}[]

const summaryFieldList: (string | { name: string, expression: IExpression })[] = ['totalShipment', 'cbm', 'chargeableWeight', 'grossWeight', 'teu']

function summaryFieldExpression(summaryField: string | { name: string, expression: IExpression }, condition?: IConditionalExpression) {

  const expression = typeof summaryField === 'string' ? new ColumnExpression('shipment', summaryField) : summaryField.expression

  if (condition) {
    const countIfExpression = new FunctionExpression('COUNT', new ParameterExpression('DISTINCT', new FunctionExpression('IF', condition, new ColumnExpression('shipment', 'id'), new Value(null))))
    const sumIfExpression = new FunctionExpression('SUM', new FunctionExpression('IF', condition, new FunctionExpression('IFNULL', expression, 0), 0))
    return summaryField === 'totalShipment' ? countIfExpression : sumIfExpression
  }

  return (summaryField === 'totalShipment') ?
    new FunctionExpression('COUNT', new ParameterExpression('DISTINCT', new ColumnExpression('shipment', 'id'))) :
    new FunctionExpression('SUM', new FunctionExpression('IFNULL', expression, 0))

}

const lastTimeCondition = (params) => {

  if (!params.subqueries.date.lastFrom) {
    throw new Error('params.subqueries missing date.lastFrom')
  }

  return new BetweenExpression(jobDateExpression, false, new Value(params.subqueries.date.lastFrom), new Value(params.subqueries.date.lastTo))
}
const currentTimeCondition = (params) => {

  if (!params.subqueries.date.currentFrom) {
    throw new Error('params.subqueries missing date.currentFrom')
  }

  return new BetweenExpression(jobDateExpression, false, new Value(params.subqueries.date.currentFrom), new Value(params.subqueries.date.currentTo))
}
const monthConditionExpression = (month) => {
  const index = months.findIndex(x => x === month)
  return new BinaryExpression(new FunctionExpression('Month', jobDateExpression), '=', index + 1)
}

summaryFieldList.map((summaryField: string | { name: string, expression: IExpression }) => {

  const summaryFieldName = typeof summaryField === 'string' ? summaryField : summaryField.name

  // cbm/chargeableWeight
  const basicFn = (params) => {
    const totalValueExpression = summaryFieldExpression(summaryField)
    return new ResultColumn(totalValueExpression, summaryFieldName)
  }

  query.registerResultColumn(summaryFieldName, basicFn)

  // cbmMonth case
  const monthFn: ResultColumnFn = (params) => {

    const resultColumnList = [] as ResultColumn[]

    months.forEach((month, index) => {
      const monthSumExpression = summaryFieldExpression(summaryField, monthConditionExpression(month))
      resultColumnList.push(new ResultColumn(monthSumExpression, `${month}_${summaryFieldName}`))
    })

    const totalValueExpression = summaryFieldExpression(summaryField)
    resultColumnList.push(new ResultColumn(totalValueExpression, `total_${summaryFieldName}`))

    return resultColumnList
  }

  query.registerResultColumn(`${summaryFieldName}Month`, monthFn)

  // ==================================

  // cbmLastCurrent
  const lastCurrentFn = (params) => {

    const lastSummaryField = summaryFieldExpression(summaryField, lastTimeCondition(params))
    const currentSummaryField = summaryFieldExpression(summaryField, currentTimeCondition(params))

    return [
      new ResultColumn(lastSummaryField, `${summaryFieldName}Last`),
      new ResultColumn(currentSummaryField, `${summaryFieldName}Current`)
    ]

  }

  query.registerResultColumn(`${summaryFieldName}LastCurrent`, lastCurrentFn)

  // cbmMonthLastCurrent
  const monthLastCurrentFn = (params) => {
    const resultColumnList = []

    months.forEach((month, index) => {

      const monthLastCondition = new AndExpressions([
        monthConditionExpression(month),
        lastTimeCondition(params)
      ])

      const monthCurrentCondition = new AndExpressions([
        monthConditionExpression(month),
        currentTimeCondition(params)
      ])

      const monthLastSumExpression = summaryFieldExpression(summaryField, monthLastCondition)
      const monthCurrentSumExpression = summaryFieldExpression(summaryField, monthLastCondition)

      resultColumnList.push(new ResultColumn(monthLastSumExpression, `${month}_${summaryFieldName}Last`))
      resultColumnList.push(new ResultColumn(monthCurrentSumExpression, `${month}_${summaryFieldName}Current`))
    })

    const totalLastSumExpression = summaryFieldExpression(summaryField, lastTimeCondition(params))
    const totalCurrentSumExpression = summaryFieldExpression(summaryField, currentTimeCondition(params))

    resultColumnList.push(new ResultColumn(totalLastSumExpression, `total_${summaryFieldName}Last`))
    resultColumnList.push(new ResultColumn(totalCurrentSumExpression, `total_${summaryFieldName}Current`))

    return resultColumnList
  }

  query.registerResultColumn(`${summaryField}MonthLastCurrent`, monthLastCurrentFn)

  // ======================================

  nestedSummaryList.map(x => {

    const nestedMonthFn = (params) => {

      const resultColumnList = [] as ResultColumn[]

      months.forEach((month, index) => {
        const monthCondition = monthConditionExpression(month)
        const monthSumExpression = summaryFieldExpression(summaryField, monthCondition)

        // January_T_cbm
        resultColumnList.push(new ResultColumn(monthSumExpression, `${month}_T_${summaryFieldName}`))

        x.cases.map(y => {
          const condition = new AndExpressions([
            monthCondition,
            y.condition
          ])

          // January_F_cbm
          const frcMonthSumExpression = summaryFieldExpression(summaryField, condition)
          resultColumnList.push(new ResultColumn(frcMonthSumExpression, `${month}_${y.typeCode}_${summaryFieldName}`))

        })

      })

      x.cases.map(y => {
        // total_F_cbm
        const typeTotalExpression = summaryFieldExpression(summaryField, y.condition)
        resultColumnList.push(new ResultColumn(typeTotalExpression, `total_${y.typeCode}_${summaryFieldName}`))

      })

      // total_T_cbm
      const totalValueExpression = summaryFieldExpression(summaryField)
      resultColumnList.push(new ResultColumn(totalValueExpression, `total_T_${summaryFieldName}`))

      return resultColumnList
    }
    // frc_cbmMonth
    query.registerResultColumn(`${x.name}_${summaryFieldName}Month`, nestedMonthFn)

    const nestedLastCurrentFn = (params) => {

      const resultColumnList = [] as ResultColumn[]

      // for easier looping
      const lastCurrentList = [
        {
          name: 'Last',
          condition: lastTimeCondition(params)
        },
        {
          name: 'Current',
          condition: currentTimeCondition(params)
        }

      ]
      lastCurrentList.forEach(lastOrCurrent => {

        const lastCurrentCondition = lastOrCurrent.condition
        // F_cbmLast
        x.cases.map(y => {
          resultColumnList.push(new ResultColumn(
            summaryFieldExpression(summaryField, new AndExpressions([lastCurrentCondition, y.condition])), `${y.typeCode}_${summaryField}${lastOrCurrent.name}`
          ))

        })

        // T_cbmLast
        const totalValueExpression = summaryFieldExpression(summaryField, lastCurrentCondition)
        resultColumnList.push(new ResultColumn(totalValueExpression, `T_${summaryFieldName}${lastOrCurrent.name}`))

      })

      return resultColumnList

    }

    query.registerResultColumn(`${x.name}_${summaryFieldName}LastCurrent`, nestedLastCurrentFn)

    const nestedMonthLastCurrentFn = (params) => {

      // for easier looping
      const lastCurrentList = [
        {
          name: 'Last',
          condition: lastTimeCondition(params)
        },
        {
          name: 'Current',
          condition: currentTimeCondition(params)
        }

      ]

      const resultColumnList = [] as ResultColumn[]

      lastCurrentList.forEach(lastOrCurrent => {

        const lastCurrentCondition = lastOrCurrent.condition

        months.forEach((month, index) => {

          // warning
          const monthCondition = new AndExpressions([monthConditionExpression(month), lastCurrentCondition])
          const monthSumExpression = summaryFieldExpression(summaryField, monthCondition)

          // January_T_cbmLast
          resultColumnList.push(new ResultColumn(monthSumExpression, `${month}_T_${summaryFieldName}${lastOrCurrent.name}`))

          x.cases.map(y => {
            const condition = new AndExpressions([
              monthCondition,
              y.condition
            ])

            // January_F_cbmLast
            const frcMonthSumExpression = summaryFieldExpression(summaryField, condition)
            resultColumnList.push(new ResultColumn(frcMonthSumExpression, `${month}_${y.typeCode}_${summaryFieldName}${lastOrCurrent.name}`))

          })

        })

        x.cases.map(y => {

          const condition = new AndExpressions([y.condition, lastCurrentCondition])
          // total_F_cbm
          const typeTotalExpression = summaryFieldExpression(summaryField, condition)
          resultColumnList.push(new ResultColumn(typeTotalExpression, `total_${y.typeCode}_${summaryFieldName}${lastOrCurrent.name}`))

        })

        // total_T_cbm
        const totalValueExpression = summaryFieldExpression(summaryField, lastCurrentCondition)
        resultColumnList.push(new ResultColumn(totalValueExpression, `total_T_${summaryFieldName}${lastOrCurrent.name}`))

      })

      return resultColumnList
    }
    // frc_cbmMonthLastCurrent
    query.registerResultColumn(`${x.name}_${summaryFieldName}MonthLastCurrent`, nestedMonthLastCurrentFn)

  })

})

// Shipment table filter ============================
const shipmentTableFilterFieldList = [
  'id',
  'moduleTypeCode',
  'boundTypeCode',
  'nominatedTypeCode',
  'shipmentTypeCode',
  'divisionCode',
  'isDirect',
  'isCoload',
  'houseNo',
  {

    name: 'agentGroup',
    expression: agentGroupExpression

  },
  {
    name: 'carrierCode',
    expression: carrierCodeExpression
  },
  {
    name: 'carrierName',
    expression: carrierNameExpression
  },
  {
    name: 'lastStatusCode',
    expression: lastStatusCodeExpression
  },
  {
    name: 'lastStatus',
    expression: lastStatusExpression
  },
  {
    name: 'alertType',
    expression: alertTypeExpression
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
  }
]

shipmentTableFilterFieldList.map(filterField => {

  const expression = (typeof filterField === 'string') ? new ColumnExpression('shipment', filterField) : filterField.expression
  const name = (typeof filterField === 'string') ? filterField : filterField.name

  // normal value IN list filter
  query.registerQuery(name,
    new Query({
      $where: new InExpression(expression, false),
    })
  ).register('value', 0)

  // Is not Null filter
  query.registerQuery(`${name}IsNotNull`,
    new Query({
      $where: new IsNullExpression(expression, true),
    })
  )

})

// warning!! previously only register carrierCodeIsNotNull and carrierNameIsNotNull, need to register carrierIsNotNull
query
  .registerQuery(
    'carrierIsNotNull',
    new Query({
      $where: new IsNullExpression(carrierCodeExpression, true),
    })
  )

// Bill Type
query
  .registerQuery(
    'billTypeCode',
    new Query({
      $where: new CaseExpression({

        cases: [
          {
            $when: new BinaryExpression(new Value(''), '=', new Unknown()),
            $then: new OrExpressions([

              new BinaryExpression(new ColumnExpression('shipment', 'billTypeCode'), '=', 'H'),
              new AndExpressions([
                new BinaryExpression(new ColumnExpression('shipment', 'billTypeCode'), '=', 'M'),
                new ExistsExpression(new Query({

                  $from: new FromTable('shipment', 'b2'),
                  $where: [
                    new BinaryExpression(new ColumnExpression('shipment', 'partyGroupCode'), '=', new ColumnExpression('b2', 'partyGroupCode')),
                    new BinaryExpression(new ColumnExpression('shipment', 'jobNo'), '=', new ColumnExpression('b2', 'jobNo')),
                    new BinaryExpression(new ColumnExpression('b2', 'billTypeCode'), '=', 'H'),
                    new IsNullExpression(new ColumnExpression('b2', 'deletedBy'), false),
                    new IsNullExpression(new ColumnExpression('b2', 'deletedAt'), false),
                  ]

                }), true)
              ])

            ])
          },
          {
            $when: new BinaryExpression('Direct', '=', new Unknown()),
            $then: new OrExpressions([
              new BinaryExpression(new ColumnExpression('shipment', 'billTypeCode'), '=', 'H'),
              new AndExpressions([
                new BinaryExpression(new ColumnExpression('shipment', 'billTypeCode'), '=', 'M'),
                new BinaryExpression(new ColumnExpression('shipment', 'isDirect'), '=', 1)
              ])

            ])
          }
        ],
        $else: new BinaryExpression(new ColumnExpression('shipment', 'billTypeCode'), '=', new Unknown())

      }),
    })
  )
  .register('value', 0)
  .register('value', 1)
  .register('value', 2)

query
  .registerQuery(
    'likeHouseNo',
    new Query({
      $where: new LikeExpression(new ColumnExpression('shipment', 'houseNo'), false),
    })
  )
  .register('value', 0)

query
  .registerQuery(
    'notLikeHouseNo',
    new Query({
      $where: new LikeExpression(new ColumnExpression('shipment', 'houseNo'), true),
    })
  )
  .register('value', 0)

query
  .registerQuery(
    'ignoreHouseNo_GZH_XMN',
    new Query({
      $where: new AndExpressions([
        new LikeExpression(new ColumnExpression('shipment', 'houseNo'), true, 'GZH%'),
        new LikeExpression(new ColumnExpression('shipment', 'houseNo'), true, 'XMN%')
      ]),
    })
  )

// salesman filter =============================
const salesmanFieldList = [
  'rSalesmanPersonCode',
  'sSalesmanPersonCode',
  'cSalesmanPersonCode',
  {
    name: 'salesmanPersonCode',
    expression: salesmanPersonCodeExpression,
  },
]

salesmanFieldList.map(salesmanField => {

  const expression = (typeof salesmanField === 'string') ? new ColumnExpression('shipment', salesmanField) : salesmanField.expression
  const name = (typeof salesmanField === 'string') ? salesmanField : salesmanField.name

  //  warning : a bit difference from normal filter
  // normal value = value filter
  query.registerQuery(name,
    new Query({
      $where: new BinaryExpression(expression, '=', new Unknown()),
    })
  ).register('value', 0)

  // Is not Null filter
  query.registerQuery(`${name}IsNotNull`,
    new Query({
      $where: new IsNullExpression(expression, true),
    })
  )

})

// shipment party Filter================================
partyList.map(party => {

  const partyTableName = party.name
  const partyIdExpression = party.partyIdExpression || new ColumnExpression('shipment_party', `${partyTableName}PartyId`)
  const partyNameExpression = party.partyNameExpression || new ColumnExpression('shipment_party', `${partyTableName}PartyName`)
  const partyCodeExpression = party.partyCodeExpression || new ColumnExpression('shipment_party', `${partyTableName}PartyCode`)

  query
    .register(
      `${partyTableName}PartyId`,
      new Query({
        $where: new InExpression(partyIdExpression, false),
      })
    )
    .register('value', 0)

  query
    .register(
      `${partyTableName}PartyCode`,
      new Query({
        $where: new InExpression(partyCodeExpression, false),
      })
    )
    .register('value', 0)

  query
    .register(
      `${partyTableName}PartyName`,
      new Query({
        $where: new RegexpExpression(partyNameExpression, false),
      })
    )
    .register('value', 0)

  query
    .register(
      `${partyTableName}IsNotNull`,
      new Query({
        $where: new IsNullExpression(partyIdExpression, true),
      })
    )

})

function controllingCustomerIncludeRoleExpression($not: boolean, partyTypeList?: string[]) {

  const inPartyTypeList = partyTypeList ? new Value(partyTypeList) : new Unknown()
  return new ExistsExpression(new Query({

    $from: new FromTable({
      table: 'party_type',
      $as: 'pt'
    }),
    $where: [
      new BinaryExpression(new ColumnExpression('pt', 'partyId'), '=', new ColumnExpression('shipment_party', 'controllingCustomerpartyId')),
      new InExpression(new ColumnExpression('pt', 'type'), false, inPartyTypeList)
    ]
  }), $not)

}

function isColoaderExpression() {

  const partyTypeList = ['forwarder']

  return new FunctionExpression(
    'IF',
    new Unknown(),
    controllingCustomerIncludeRoleExpression(true, partyTypeList),
    controllingCustomerIncludeRoleExpression(false, partyTypeList)
  )

}

query
  .registerQuery(
    'controllingCustomerIncludeRole',
    new Query({
      $where: controllingCustomerIncludeRoleExpression(false),
    })
  )
  .register('value', 0)

query
  .registerQuery(
    'controllingCustomerExcludeRole',
    new Query({

      $where: controllingCustomerIncludeRoleExpression(true),
    })
  )
  .register('value', 0)

query.registerQuery('isColoader',

  new Query({
    $where: isColoaderExpression(),
  })

).register('value', 0)

function viaHKGExpression() {

  const old360PartyIdList = [7351490]
  return new InExpression(new FunctionExpression(
    'JSON_UNQUOTE',
    new FunctionExpression('JSON_EXTRACT', new ColumnExpression('office', 'thirdPartyCode'), '$.old360')
  ), false, old360PartyIdList)
}

query.registerQuery('viaHKG',

  new Query({
    $where: viaHKGExpression(),
  })

)

// Location Filter=================

locationList.map(location => {

  const columnName = `${location}Code`
  // Port of Loading
  query
    .register(
      columnName,
      new Query({
        $where: new InExpression(new ColumnExpression('shipment', columnName), false),
      })
    )
    .register('value', 0)
})

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
          new BetweenExpression(jobDateExpression, false, new Unknown(), new Unknown()),
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

          new BetweenExpression(jobDateExpression, false, new Unknown(), new Unknown()),
          new BetweenExpression(jobDateExpression, false, new Unknown(), new Unknown())
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

dateList.map(date => {

  const dateColumnName = typeof date === 'string' ? date : date.name
  const dateColumnExpression = typeof date === 'string' ? new ColumnExpression('shipment_date', date) : date.expression

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

// Search
query
  .register(
    'q',
    new Query({
      $from: new FromTable('shipment', {
        operator: 'LEFT',
        table: new FromTable({
          table: new Query({
            $select: [
              new ResultColumn(new ColumnExpression('shipment_container', 'shipmentId'), 'shipment_container_shipmentId'),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({ expression: new ColumnExpression('shipment_container', 'contractNo'), suffix: 'SEPARATOR \', \'' })
                ),
                'contractNo'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({ expression: new ColumnExpression('shipment_container', 'containerNo'), suffix: 'SEPARATOR \', \'' })
                ),
                'containerNo'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({ expression: new ColumnExpression('shipment_container', 'sealNo'), suffix: 'SEPARATOR \', \'' })
                ),
                'sealNo'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({ expression: new ColumnExpression('shipment_container', 'sealNo2'), suffix: 'SEPARATOR \', \'' })
                ),
                'sealNo2'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({ expression: new ColumnExpression('shipment_container', 'carrierBookingNo'), suffix: 'SEPARATOR \', \'' })
                ),
                'carrierBookingNo'
              ),
            ],
            $from: new FromTable('shipment_container'),
            $where: new AndExpressions({
              expressions: [
                new IsNullExpression(new ColumnExpression('shipment_container', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('shipment_container', 'deletedBy'), false)
              ]
            }),
            $group: new GroupBy([
              new ColumnExpression('shipment_container', 'shipmentId')
            ]),
          }),
          $as: 'shipment_container'
        }),
        $on: [
          new BinaryExpression(new ColumnExpression('shipment_container', 'shipment_container_shipmentId'), '=', new ColumnExpression('shipment', 'id')),
        ]
      }, {
        operator: 'LEFT',
        table: new FromTable({
          table: new Query({
            $select: [
              new ResultColumn(new ColumnExpression('shipment_po', 'shipmentId'), 'shipment_po_shipmentId'),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({ expression: new ColumnExpression('shipment_po', 'poNo'), suffix: 'SEPARATOR \', \'' })
                ),
                'poNo'
              )
            ],
            $from: new FromTable('shipment_po'),
            $where: new AndExpressions({
              expressions: [
                new IsNullExpression(new ColumnExpression('shipment_po', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('shipment_po', 'deletedBy'), false)
              ]
            }),
            $group: new GroupBy([
              new ColumnExpression('shipment_po', 'shipmentId')
            ]),
          }),
          $as: 'shipment_po'
        }),
        $on: [
          new BinaryExpression(new ColumnExpression('shipment_po', 'shipment_po_shipmentId'), '=', new ColumnExpression('shipment', 'id')),
        ]
      }),
      $where: new OrExpressions({
        expressions: [
          new RegexpExpression(new ColumnExpression('shipment', 'bookingNo'), false),
          new RegexpExpression(new ColumnExpression('shipment', 'containerNos'), false),
          new RegexpExpression(new ColumnExpression('shipment', 'contractNos'), false),
          new RegexpExpression(new ColumnExpression('shipment', 'houseNo'), false),
          new RegexpExpression(new ColumnExpression('shipment', 'jobNo'), false),
          new RegexpExpression(new ColumnExpression('shipment', 'masterNo'), false),
          new RegexpExpression(new ColumnExpression('shipment', 'divisionCode'), false),
          new RegexpExpression(new ColumnExpression('shipment', 'carrierCode'), false),
          new RegexpExpression(new ColumnExpression('shipment', 'carrierName'), false),
          new RegexpExpression(new ColumnExpression('shipment', 'cSalesmanPersonCode'), false),
          new RegexpExpression(new ColumnExpression('shipment', 'sSalesmanPersonCode'), false),
          new RegexpExpression(new ColumnExpression('shipment', 'vessel'), false),
          new RegexpExpression(new ColumnExpression('shipment', 'voyageFlightNumber'), false),
          new RegexpExpression(new ColumnExpression('shipment', 'xrayStatus'), false),
          new RegexpExpression(new ColumnExpression('shipment', 'placeOfDeliveryCode'), false),
          new RegexpExpression(new ColumnExpression('shipment', 'placeOfDeliveryName'), false),
          new RegexpExpression(new ColumnExpression('shipment', 'placeOfReceiptCode'), false),
          new RegexpExpression(new ColumnExpression('shipment', 'placeOfReceiptName'), false),
          new RegexpExpression(new ColumnExpression('shipment', 'portOfDischargeCode'), false),
          new RegexpExpression(new ColumnExpression('shipment', 'portOfDischargeName'), false),
          new RegexpExpression(new ColumnExpression('shipment', 'portOfLoadingCode'), false),
          new RegexpExpression(new ColumnExpression('shipment', 'portOfLoadingName'), false),
          new RegexpExpression(new ColumnExpression('shipment', 'finalDestinationCode'), false),
          new RegexpExpression(new ColumnExpression('shipment', 'finalDestinationName'), false),
          new RegexpExpression(new ColumnExpression('shipment_party', 'agentPartyCode'), false),
          new RegexpExpression(new ColumnExpression('shipment_party', 'agentPartyName'), false),
          new RegexpExpression(new ColumnExpression('shipment_party', 'consigneePartyCode'), false),
          new RegexpExpression(new ColumnExpression('shipment_party', 'consigneePartyName'), false),
          new RegexpExpression(new ColumnExpression('shipment_party', 'notifyPartyPartyCode'), false),
          new RegexpExpression(new ColumnExpression('shipment_party', 'notifyPartyPartyName'), false),
          new RegexpExpression(new ColumnExpression('shipment_party', 'controllingCustomerPartyCode'), false),
          new RegexpExpression(new ColumnExpression('shipment_party', 'controllingCustomerPartyName'), false),
          new RegexpExpression(new ColumnExpression('shipment_party', 'linerAgentPartyCode'), false),
          new RegexpExpression(new ColumnExpression('shipment_party', 'linerAgentPartyName'), false),
          new RegexpExpression(new ColumnExpression('shipment_party', 'officePartyCode'), false),
          new RegexpExpression(new ColumnExpression('shipment_party', 'officePartyName'), false),
          new RegexpExpression(new ColumnExpression('shipment_party', 'roAgentPartyName'), false),
          new RegexpExpression(new ColumnExpression('shipment_party', 'roAgentPartyCode'), false),
          new RegexpExpression(new ColumnExpression('shipment_party', 'shipperPartyCode'), false),
          new RegexpExpression(new ColumnExpression('shipment_party', 'shipperPartyName'), false),
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
  .register('value', 44)
  .register('value', 45)
  .register('value', 46)

const isActiveExpression = new AndExpressions([
  new IsNullExpression(new ColumnExpression('shipment', 'deletedAt'), false),
  new IsNullExpression(new ColumnExpression('shipment', 'deletedBy'), false)
])

// isActive field
query.registerBoth('isActive', isActiveExpression)

// isActive filter
query.register('isActive', new Query({

  $where: new OrExpressions([

    new AndExpressions([

      new BinaryExpression(new Value('active'), '=', new Unknown('string')),
      // active case
      isActiveExpression
    ]),

    new AndExpressions([
      new BinaryExpression(new Value('deleted'), '=', new Unknown('string')),
      // deleted case
      new BinaryExpression(isActiveExpression, '=', false)
    ])

  ])

}))
  .register('value', 0)
  .register('value', 1)

export default query
