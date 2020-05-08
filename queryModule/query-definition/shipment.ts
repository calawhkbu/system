import { QueryDef, ResultColumnArg, SubqueryArg } from 'classes/query/QueryDef'
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
  IConditionalExpression,
  MathExpression,
  ColumnsExpression,
  IQuery
} from 'node-jql'
import { IQueryParams } from 'classes/query'
import { now } from '../../../../swivel-backend-new/node_modules/moment/moment'
import { IQueryResult } from 'node-jql-core'

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

const percentageChangeFunction = (oldExpression: IExpression, newExpression: IExpression) => {

  const conditionExpression = new CaseExpression({
    cases: [
      {
        $when: new OrExpressions([
          new BinaryExpression(oldExpression, '=', 0),
          new BinaryExpression(newExpression, '=', 0)
        ]),
        $then: new MathExpression(newExpression, '-', oldExpression)
      } as ICase
    ],

    $else: new MathExpression(new MathExpression(newExpression, '-', oldExpression), '/', oldExpression)

  })

  return conditionExpression

}

const shipmentIsActiveExpression = (shipmentTableName) => {

  return new AndExpressions([

    new IsNullExpression(new ColumnExpression(shipmentTableName, 'deletedAt'), false),
    new IsNullExpression(new ColumnExpression(shipmentTableName, 'deletedBy'), false),
    new IsNullExpression(new ColumnExpression(shipmentTableName, 'billStatus'), false),
  ])

}

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
    partyNameExpression: {
      expression : agentPartyNameExpression,
      companion : 'table:shipment_party'
    },
    partyIdExpression: {
      expression : agentPartyIdExpression,
      companion : 'table:shipment_party'
    },
    partyCodeExpression: {
      expression : agentPartyCodeExpression,
      companion : 'table:shipment_party'
    }
  }
] as {

  name: string,
  partyNameExpression?: {
    companion: string[],
    expression: IExpression
  },
  partyIdExpression?: {
    companion: string[],
    expression: IExpression
  },
  partyCodeExpression?: {
    companion: string[],
    expression: IExpression
  },
  partyNameInReportExpression?: {
    companion: string[],
    expression: IExpression
  }
  partyShortNameInReportExpression?: {
    companion: string[],
    expression: IExpression
  }

}[]
const locationList = ['portOfLoading', 'portOfDischarge', 'placeOfDelivery', 'placeOfReceipt', 'finalDestination']

const query = new QueryDef((params: IQueryParams) => {

  const baseQuery =   new Query({
    // $distinct: true,
    $select: [
      new ResultColumn(new ColumnExpression('shipment', '*')),
      new ResultColumn(new ColumnExpression('shipment', 'id'), 'shipmentId'),
      new ResultColumn(new ColumnExpression('shipment', 'id'), 'shipmentPartyId'),
    ],
    $from: new FromTable(

      {
        table : 'shipment',
      }

    ),
  })

  const specialName = 'isMinCreatedAt'

  const { fields, conditions, subqueries } = params

  if (subqueries[specialName]) {

    const { [specialName] : dumb, ...newSubqueries } = params.subqueries

    const newParams = {
      fields: [
        new ResultColumn(new ColumnExpression('shipment', 'id'), 'shipmentId'),
        new ResultColumn(new BinaryExpression(new ColumnExpression('shipment', 'createdAt'), '=', new FunctionExpression('MIN', new ColumnExpression('shipment', 'createdAt'))),
        'isMinCreatedAt',
        new ColumnExpression('shipment', 'houseNo'),
        new ColumnExpression('shipment', 'partyGroupCode')),
      ],
      subqueries: newSubqueries,
      conditions
    } as IQueryParams

    console.log(`newSubqueries`)
    console.log(newSubqueries)

    baseQuery.$from[0].joinClauses.push(
      new JoinClause({
        operator :  'LEFT',
        table : new FromTable(query.apply(newParams), 'shipment_isMinCreatedAt'),
        $on : new BinaryExpression(new ColumnExpression('shipment', 'id'), '=', new ColumnExpression('shipment_isMinCreatedAt', 'shipmentId'))
      })
    )
  }

  return baseQuery
})

query.registerQuery('isMinCreatedAt', new Query({

  $where : new BinaryExpression(new ColumnExpression('shipment_isMinCreatedAt', 'isMinCreatedAt'), '=', true)

}))

const queryOld = new QueryDef(
  new Query({
    // $distinct: true,
    $select: [
      new ResultColumn(new ColumnExpression('shipment', '*')),
      new ResultColumn(new ColumnExpression('shipment_isMinCreatedAt', 'isMinCreatedAt'), 'isMinCreatedAt'),
      new ResultColumn(new ColumnExpression('shipment', 'id'), 'shipmentId'),
      new ResultColumn(new ColumnExpression('shipment', 'id'), 'shipmentPartyId'),
    ],
    $from: new FromTable(

      {
        table : 'shipment',
        // LEFT JOIN shipment_date

         joinClauses : [{
          operator: 'LEFT',
          table: new FromTable({
            table: new Query({
              $select: [
                new ResultColumn(new ColumnExpression('shipment_dumb', 'id'), 'shipmentId'),

                new ResultColumn(
                  new BinaryExpression(
                    new ColumnExpression('shipment_dumb', 'createdAt'), '=', new FunctionExpression('MIN', new ColumnExpression('shipment_dumb', 'createdAt'))),
                    'isMinCreatedAt', new ColumnExpression('shipment_dumb', 'houseNo'), new ColumnExpression('shipment_dumb', 'partyGroupCode')),

              ],
              $from: new FromTable('shipment', 'shipment_dumb'),

              $where : shipmentIsActiveExpression('shipment_dumb')

            }),
            $as: 'shipment_isMinCreatedAt'
          }),
          $on: new BinaryExpression(new ColumnExpression('shipment', 'id'), '=', new ColumnExpression('shipment_isMinCreatedAt', 'shipmentId'))
        }],

      }

    ),
  })
)

// all shipment join
query.table('shipment_date', new Query({

  $from : new FromTable({

    table : 'shipment',
    joinClauses : [
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
      }
    ]
  })

}))

query.table('shipment_party', new Query({

  $from : new FromTable({

    table : 'shipment',
    joinClauses : [
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
    ]
  })

}))

// party join : table:office, table:shipper etc
partyList.map(party => {

  const partyTableName = party.name

  const companion = (party.partyIdExpression && party.partyIdExpression.companion) ? party.partyIdExpression.companion : [`table:shipment_party`]
  const partyIdExpression = (party.partyIdExpression && party.partyIdExpression.expression) ? party.partyIdExpression.expression :  new ColumnExpression('shipment_party', `${partyTableName}PartyId`)

  query.table(partyTableName, new Query({

    $from : new FromTable({

      table : 'shipment',
      joinClauses : [
        {
          operator: 'LEFT',
          table: new FromTable('party', partyTableName),
          $on: [
            new BinaryExpression(
              partyIdExpression,
              '=',
              new ColumnExpression(partyTableName, 'id')
            ),
          ],
        }
      ]
    })

  }), ...companion)

})

// used for statusJoin
const shipmentTrackingLastStatusCodeTableExpression = new Query({

  $select: [
    new ResultColumn(new ColumnExpression('tracking', 'trackingNo')),
    new ResultColumn(new ColumnExpression('tracking', 'lastStatusCode')),
    new ResultColumn(new ColumnExpression('tracking', 'lastStatusDate')),
    new ResultColumn(new ColumnExpression('tracking', 'lastEstimatedUpdateDate')),
    new ResultColumn(new ColumnExpression('tracking', 'lastActualUpdateDate'))
  ],

  $from : 'tracking'

})

const shipmentTrackingStatusCodeTableExpression = new Query({

  $select: [
    new ResultColumn(new ColumnExpression('tracking', 'trackingNo')),
    new ResultColumn(new ColumnExpression('tracking', 'lastStatusCode')),
    new ResultColumn(new ColumnExpression('tracking', 'lastStatusDate')),
    new ResultColumn(new ColumnExpression('tracking', 'lastEstimatedUpdateDate')),
    new ResultColumn(new ColumnExpression('tracking', 'lastActualUpdateDate')),

    new ResultColumn(new ColumnExpression('tracking_status', 'trackingId')),
    new ResultColumn(new ColumnExpression('tracking_status', 'statusCode')),
    new ResultColumn(new ColumnExpression('tracking_status', 'statusDate')),
  ],

  $from : new FromTable({
    table : 'tracking',
    joinClauses : [

      {
        operator : 'LEFT',
        $on : new BinaryExpression(new ColumnExpression('tracking_status', 'trackingId'), '=', new ColumnExpression('tracking', 'id')),
        table : new FromTable('tracking_status')
      }
    ]
  })

})

// statusJoin : table:statusJoin
query.table('statusJoin', new Query(
  {
    $from: new FromTable('shipment', {

      operator: 'LEFT',
      table: new FromTable({

        table: shipmentTrackingStatusCodeTableExpression,
        $as: 'shipmentTrackingStatusCodeTable',

      }),

      $on: new BinaryExpression(new ColumnExpression('shipmentTrackingStatusCodeTable', 'trackingNo'), '=', new ColumnExpression('shipment', 'currentTrackingNo'))

    })

  }))

// lastStatusJoin : table:lastStatusJoin
query.table('lastStatusJoin', new Query({

  $from: new FromTable('shipment', {

    operator: 'LEFT',
    table: new FromTable({

      table: shipmentTrackingLastStatusCodeTableExpression,
      $as: 'shipmentTrackingLastStatusCodeTable',

    }),
    $on: new BinaryExpression(new ColumnExpression('shipmentTrackingLastStatusCodeTable', 'trackingNo'), '=', new ColumnExpression('shipment', 'currentTrackingNo'))

  })

}))

//  alert Join
// warning !!! this join will create duplicate record of shipment
// plz use wisely, mainly use together with group by

// alertJoin : table:alertJoin
query.table('alertJoin', new Query({

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

// location table :  table:portOfLoading, table:portOfDischarge
locationList.map(location => {

  const joinTableName = `${location}Join`
  const locationCode = `${location}Code`

  // location join (e.g. portOfLoadingJoin)
  query.table(joinTableName, new Query({

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

// shipment_amount table :  table:shipment_amount
query.table('shipment_amount', new Query({

  $from : new FromTable({

    table : 'shipment',
    joinClauses : [

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
      }

    ]

  })
}))

// shipment_cargo table :  table:shipment_cargo
query.table('shipment_cargo', new Query({

  $from : new FromTable({

    table : 'shipment',
    joinClauses : [

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

    ]

  })
}))

// shipment_container table :  table:shipment_container
query.table('shipment_container', new Query({

  $from : new FromTable({
    table : 'shipment',
    joinClauses : [
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
    ]
  })
}))

// shipment_po table :  table:shipment_po
query.table('shipment_po', new Query({

  $from : new FromTable({
    table : 'shipment',
    joinClauses : [
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
    ]
  })
}))

// shipment_reference table :  table:shipment_reference
query.table('shipment_reference', new Query({

  $from : new FromTable({
    table : 'shipment',
    joinClauses : [
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
    ]
  })
}))

// shipment_transport table :  table:shipment_transport
query.table('shipment_transport', new Query({

  $from : new FromTable({
    table : 'shipment',
    joinClauses : [

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

// =======================================

//  register field =======================

// shipment table field

const idExpression = new ColumnExpression('shipment', 'id')
const shipIdExpression = new QueryExpression(new Query({
  $select : [
    new ResultColumn(new ColumnExpression('shipment_reference', 'refDescription'))
  ],

  $from : 'shipment_reference',

  $where : [
    new BinaryExpression(new ColumnExpression('shipment_reference', 'refName'), '=', 'Shipment Reference ID'),
    new BinaryExpression(new ColumnExpression('shipment_reference', 'shipmentId'), '=', idExpression)
  ],
  $limit : 1

}))

const primaryKeyListStringExpression = new FunctionExpression('GROUP_CONCAT', new ParameterExpression('DISTINCT', new ColumnExpression('shipment', 'id')))

const partyGroupCodeExpression = new ColumnExpression('shipment', 'partyGroupCode')

const currentTrackingNoExpression = new ColumnExpression('shipment', 'currentTrackingNo')
const batchNumberExpression = new ColumnExpression('shipment', 'batchNumber')

const haveCurrentTrackingNoExpression = new FunctionExpression('IF', new IsNullExpression(currentTrackingNoExpression, false), '', '.')

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
            new BinaryExpression(new ColumnExpression('cm1', 'code'), '=', new FunctionExpression('LEFT', new ColumnExpression('shipment', 'masterNo'), 3))
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
            new BinaryExpression(new ColumnExpression('cm1', 'code'), '=', new FunctionExpression('LEFT', new ColumnExpression('shipment', 'masterNo'), 3))
          ]

        }))
      }],

      $else: new ColumnExpression('shipment', 'carrierName')

    }),
    new ColumnExpression('shipment', 'carrierName')
  ),
  carrierCodeExpression
)

const rSalesmanCodeExpression = new ColumnExpression('shipment', 'rSalesmanPersonCode')
const cSalesmanCodeExpression = new ColumnExpression('shipment', 'cSalesmanPersonCode')
const sSalesmanCodeExpression = new ColumnExpression('shipment', 'sSalesmanPersonCode')

const salesmanCodeExpression = new CaseExpression({
  cases: [
    {
      $when: new IsNullExpression(
        rSalesmanCodeExpression, true
      ),
      $then: rSalesmanCodeExpression
    },
    {
      $when: new BinaryExpression(
        new ColumnExpression('shipment', 'boundTypeCode'),
        '=',
        'O'
      ),
      $then: sSalesmanCodeExpression
    },
    {
      $when: new BinaryExpression(
        new ColumnExpression('shipment', 'boundTypeCode'),
        '=',
        'I'
      ),
      $then: cSalesmanCodeExpression
    }
  ],
  $else: null
})

// AIR export non direct = AC
// AIR export direct = AD
// AIR import non direct = AM
// AIR import direct = AN
// AIR misc = AZ

// SEA export FCL = SA
// SEA export LCL = SB
// SEA export Consol = SC
// SEA import FCL = SR
// SEA import LCL = ST
// SEA import Consol = SS
// Sea boundType M  = SZ

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
// WHEN office.thirdPartyCode.old360  = 7351496 AND b.division = 'TAE' THEN 'AU'
// WHEN office.thirdPartyCode.old360 = 7351496 AND b.division = 'TAI' THEN 'AV'
// WHEN b.division = 'MM' THEN 'AX'
// WHEN b.division = 'AM' THEN 'AZ'
// WHEN b.division = 'SE' AND b.shipmentType = 'FCL' THEN 'SA'
// WHEN b.division = 'SE' AND b.shipmentType = 'LCL' THEN 'SB'
// WHEN b.division = 'SE' AND b.shipmentType = 'Consol' THEN 'SC'
// WHEN b.division = 'SI' AND b.shipmentType = 'FCL' THEN 'SR'
// WHEN b.division = 'SI' AND b.shipmentType = 'LCL' THEN 'SS'
// WHEN b.division = 'SI' AND b.shipmentType = 'Consol' THEN 'ST'
// WHEN office.thirdPartyCode.old360 = 7351496 AND b.division = 'TSE' THEN 'SU'
// WHEN office.thirdPartyCode.old360 = 7351496 AND b.division = 'TSI' THEN 'SV'
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

const lastStatusCodeExpression = new ColumnExpression('shipmentTrackingLastStatusCodeTable', 'lastStatusCode')
const statusCodeExpression = new ColumnExpression('shipmentTrackingStatusCodeTable', 'statusCode')

function statusExpressionMapFunction(originalExpression: IExpression) {

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

      let condition = new InExpression(originalExpression, false, lastStatusCodeList) as IConditionalExpression

      if (lastStatusCodeList.includes(null)) {

        condition = new OrExpressions([
          new IsNullExpression(originalExpression, false),
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
    $else: originalExpression
  })

}

const extraDateExpression = new FunctionExpression('IF', new BinaryExpression(new ColumnExpression('shipment', 'moduleTypeCode'), '=', 'AIR'), new Value(0.5), new Value(2))

const dateStatusExpressionWithParams = (params: IQueryParams) => {

  const subqueryParam = params.subqueries.dateStatus

  if (!subqueryParam)
  {
    throw new Error(`missing dateStatus in subqueries`)
  }
  return dateStatusExpression(subqueryParam)
}

const dateStatusExpression = (subqueryParam) => {

  const rawATAExpression = new ColumnExpression('shipment_date', 'arrivalDateActual')
  const rawETAExpression = new ColumnExpression('shipment_date', 'arrivalDateEstimated')

  const rawATDExpression = new ColumnExpression('shipment_date', 'departureDateActual')
  const rawETDExpression = new ColumnExpression('shipment_date', 'departureDateEstimated')

  const addDateExpression = (expression: IExpression, mode: 'add' | 'sub', value, unit: 'DAY' | 'HOUR' | 'MINUTE') => {

    const extraDateExpression = new ParameterExpression({
      prefix: 'INTERVAL',
      expression: value,
      suffix: unit
    })

    return new FunctionExpression(mode === 'add' ? 'DATE_ADD' : 'DATE_SUB', expression, extraDateExpression)

  }

  const moduleTypeCodeCondition = (moduleTypeCode) => {
    return  new BinaryExpression(new ColumnExpression('shipment', 'moduleTypeCode'), '=', moduleTypeCode)
  }

  const AIRDateStatusExpression = (subqueryParam) =>
  {

    // convert a date to 23:59 of that day
    const convertToEndOfDate = (dateExpression) => addDateExpression(addDateExpression(new FunctionExpression('DATE', dateExpression), 'add', 1, 'DAY'), 'sub', 1, 'MINUTE')

    // convert a date to 00:01 of that day
    const convertToStartOfDate = (dateExpression) => addDateExpression(new FunctionExpression('DATE', dateExpression), 'sub', 1, 'MINUTE')

    // const todayExpression = new FunctionExpression('NOW')
    const todayExpression = new Value(subqueryParam.today)
    const currentTimeExpression = new Value(subqueryParam.currentTime)

    const calculatedATAExpression = new CaseExpression({
      cases : [
        {
          $when : new IsNullExpression(rawETAExpression, true),
          $then : convertToEndOfDate(rawETAExpression)
        },
        {
          $when : new IsNullExpression(rawETDExpression, true),
          $then : convertToEndOfDate(addDateExpression(rawETDExpression, 'add', 2, 'DAY'))
        }

      ],

      $else : new Value(null)

    })

    const calculatedATDExpression = convertToStartOfDate(addDateExpression(rawETDExpression, 'add', 1, 'DAY'))
    const finalATAExpression = new FunctionExpression('IFNULL', rawATAExpression, calculatedATAExpression)
    const finalATDExpression = new FunctionExpression('IFNULL', rawATDExpression, calculatedATDExpression)

    const finalATAInPast = new BinaryExpression(finalATAExpression, '<=', currentTimeExpression)
    const finalATDInPast = new BinaryExpression(new FunctionExpression('DATE', finalATDExpression), '<=', todayExpression)

    return new CaseExpression({

      cases : [

        {
          $when : finalATAInPast,
          $then : new CaseExpression({

            cases : [
              {
                $when : new BinaryExpression(convertToEndOfDate(addDateExpression(finalATAExpression, 'add', 1, 'DAY')), '<=', currentTimeExpression),
                $then : new Value('inDelivery')
              },
            ],

            $else : new Value('arrival')
          })
        },

        {

          $when : finalATDInPast,
          $then : new CaseExpression({

            cases : [
              {
                $when : new BinaryExpression(new FunctionExpression('DATE', finalATDExpression), '=', todayExpression),
                $then : new Value('departure')
              },

            ],

            $else : new Value('inTransit')
          })
        }

      ],
      $else : new Value('upcoming')
    })

  }

  const SEADateStatusExpression = (subqueryParam) => {

  const todayExpression = new Value(subqueryParam.today)
  const currentTimeExpression = new Value(subqueryParam.currentTime)

    const calculatedATAExpression = addDateExpression(rawETAExpression, 'add', 2, 'DAY')
    const calculatedATDExpression = addDateExpression(rawETDExpression, 'add', 1, 'DAY')
    const finalATAExpression = new FunctionExpression('IFNULL', rawATAExpression, calculatedATAExpression)
    const finalATDExpression = new FunctionExpression('IFNULL', rawATDExpression, calculatedATDExpression)

    const finalATAInPast = new BinaryExpression(finalATAExpression, '<=', todayExpression)
    const finalATDInPast = new BinaryExpression(finalATDExpression, '<=', todayExpression)

    return new CaseExpression({

      cases : [

        {
          $when : finalATAInPast,
          $then : new CaseExpression({
            cases : [
              {
                $when : new BinaryExpression(addDateExpression(finalATAExpression, 'add', 3, 'DAY'), '<=', todayExpression),
                $then : new Value('inDelivery')
              } as ICase,
            ],

            $else : new Value('arrival')
          }
          )
        },

        {
          $when : finalATDInPast,
          $then : new CaseExpression({
            cases : [
              {
                $when : new AndExpressions([
                  new BinaryExpression(addDateExpression(finalATDExpression, 'add', 3, 'DAY'), '<=', todayExpression)
                ]),
                $then : new Value('inTransit')
              } as ICase,
            ],

            $else : new Value('departure')
          }
          )
        },

        // {
        //   $when : new AndExpressions([
        //     new IsNullExpression(finalATAExpression, false),
        //     new BinaryExpression(addDateExpression(finalATDExpression, 'add', 3, 'DAY'), '<=', todayExpression)
        //   ]),
        //   $then : new Value('inTransit')
        // } as ICase,
        // {
        //   $when : new AndExpressions([

        //     new IsNullExpression(finalATAExpression, false),
        //     new BetweenExpression(finalATDExpression, false, todayExpression, addDateExpression(todayExpression, 'add', 3, 'DAY'))

        //   ]),
        //   $then : new Value('departure')
        // } as ICase,

        // {
        //   $when : new AndExpressions([
        //     new IsNullExpression(finalATAExpression, false),
        //     new BinaryExpression(finalATDExpression, '<', todayExpression)
        //   ]),
        //   $then : new Value('upcoming')
        // } as ICase,

      ],

      $else : new Value('upcoming')
    })
  }

  const result = new CaseExpression({

    cases : [
      {
        $when : new BinaryExpression(new ColumnExpression('shipment', 'moduleTypeCode'), '=', 'AIR'),
        $then : AIRDateStatusExpression(subqueryParam)
      },
      {
        $when : new BinaryExpression(new ColumnExpression('shipment', 'moduleTypeCode'), '=', 'SEA'),
        $then : SEADateStatusExpression(subqueryParam)
      }

    ],
    $else : new Value(null)
  })

  return result

}

const statusExpression = statusExpressionMapFunction(statusCodeExpression)
const lastStatusExpression = statusExpressionMapFunction(lastStatusCodeExpression)

//  alert related field

const alertIdExpression = new ColumnExpression('alert', 'id')

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

const expressionList = [

  {
    name : 'id',
    expression : idExpression,
  }

]

query.registerBoth('id', idExpression)
query.registerBoth('primaryKeyListString', primaryKeyListStringExpression)
query.registerBoth('partyGroupCode', partyGroupCodeExpression)
query.registerBoth('currentTrackingNo', currentTrackingNoExpression)
query.registerBoth('haveCurrentTrackingNo', haveCurrentTrackingNoExpression)

query.registerBoth('agentGroup', agentGroupExpression, 'table:consignee', 'table:agent')

query.registerBoth('carrierCode', carrierCodeExpression)

query.registerBoth('carrierName', carrierNameExpression)

query.registerBoth('salesmanCode', salesmanCodeExpression)

query.registerBoth('reportingGroup', reportingGroupExpression, 'table:office')

query.registerBoth('shipId', shipIdExpression)

// tracking lastStatus
query.registerBoth('lastStatusCode', lastStatusCodeExpression, 'table:lastStatusJoin')
query.registerBoth('lastStatus', lastStatusExpression, 'table:lastStatusJoin')

// tracking status
query.registerBoth('statusCode', statusCodeExpression, 'table:lastStatusJoin')
query.registerBoth('status', statusExpression, 'table:lastStatusJoin')

// dateStatus
query.registerBoth('dateStatus', (params) => dateStatusExpressionWithParams(params), 'table:shipment_date')

query.registerBoth('alertId', alertIdExpression, 'table:alertJoin')

query.registerBoth('alertTableName', alertTableNameExpression, 'table:alertJoin')

query.registerBoth('alertPrimaryKey', alertPrimaryKeyExpression, 'table:alertJoin')

query.registerBoth('alertSeverity', alertSeverityExpression, 'table:alertJoin')

query.registerBoth('alertType', alertTypeExpression, 'table:alertJoin')

query.registerBoth('alertTitle', alertTitleExpression, 'table:alertJoin')

query.registerBoth('alertMessage', alertMessageExpression, 'table:alertJoin')

query.registerBoth('alertCategory', alertCategoryExpression, 'table:alertJoin')

query.registerBoth('alertContent', alertContentExpression, 'table:alertJoin')

query.registerBoth('alertStatus', alertStatusExpression, 'table:alertJoin')

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

  //  very special case , get back the value from the party join
  'PartyNameInReport',
  'PartyShortNameInReport',

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

  const partyIdExpression = party.partyIdExpression  || { expression : new ColumnExpression('shipment_party', `${partyTableName}PartyId`), companion : ['table:shipment_party']}
  const partyNameExpression = party.partyNameExpression ||  { expression :  new ColumnExpression('shipment_party', `${partyTableName}PartyName`), companion : ['table:shipment_party']}
  const partyCodeExpression = party.partyCodeExpression || { expression :  new ColumnExpression('shipment_party', `${partyTableName}PartyCode`), companion : ['table:shipment_party']}
  const partyNameInReportExpression = party.partyNameInReportExpression || { expression :  new ColumnExpression(party.name, `name`), companion : [`table:${party.name}`]}
  const partyShortNameInReportExpression = party.partyShortNameInReportExpression ||  { expression : new FunctionExpression('IFNULL', new ColumnExpression(party.name, `shortName`), partyNameInReportExpression.expression), companion : [`table:${party.name}`]}

  partyFieldList.map(partyField => {

    const fieldName = `${partyTableName}${partyField}`

    let finalExpressionInfo: { expression: IExpression, companion: string[] }

    switch (partyField) {

      case 'PartyCode':
        finalExpressionInfo = partyCodeExpression
        break

      case 'PartyName':
        finalExpressionInfo = partyNameExpression
        break

      case 'PartyId':
        finalExpressionInfo = partyIdExpression
        break

      // PartyReportName will get from party join instead of shipment_party direct;y
      case 'PartyNameInReport':
        finalExpressionInfo = partyNameInReportExpression
        break

      case 'PartyShortNameInReport':
        finalExpressionInfo = partyShortNameInReportExpression
        break

      default:
        finalExpressionInfo = { expression : new ColumnExpression('shipment_party', fieldName) as IExpression, companion : ['table:shipment_party'] }
        break
    }

    query.registerBoth(fieldName, finalExpressionInfo.expression, ...finalExpressionInfo.companion)

  })

  query
  .register(
    `${partyTableName}PartyId`,
    new Query({
      $where: new InExpression(partyIdExpression.expression, false),
    }),
    ...partyIdExpression.companion
  )
  .register('value', 0)

query
  .register(
    `${partyTableName}PartyCode`,
    new Query({
      $where: new InExpression(partyCodeExpression.expression, false),
    }),
    ...partyCodeExpression.companion
  )
  .register('value', 0)

query
  .register(
    `${partyTableName}PartyName`,
    new Query({
      $where: new RegexpExpression(partyNameExpression.expression, false),
    }),
    ...partyNameExpression.companion
  )
  .register('value', 0)

query
  .register(
    `${partyTableName}IsNotNull`,
    new Query({
      $where: new IsNullExpression(partyIdExpression.expression, true),
    }),
    ...partyIdExpression.companion
  )

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

query
  .register(
    'alertCount',
    new ResultColumn(new FunctionExpression('COUNT', new ParameterExpression('DISTINCT', new ColumnExpression('alert', 'id'))), 'alertCount')
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

interface SummaryField {
  name: string,
  expression: IExpression,
  inReportExpression?: IExpression

  summaryType: 'count' | 'sum',
  summaryExpression?: IExpression,
  summaryIfExpression?: (conditon) => IExpression
}

const summaryFieldList: SummaryField[] = [

  {
    name: 'totalShipment',
    summaryType: 'count',
    expression: new ColumnExpression('shipment', 'id')
  },
  {
    name: 'cbm',
    summaryType: 'sum',
    expression: new ColumnExpression('shipment', 'cbm'),
  },
  {
    name: 'chargeableWeight',
    summaryType: 'sum',
    expression: new ColumnExpression('shipment', 'chargeableWeight'),
  },
  {
    name: 'grossWeight',
    summaryType: 'sum',
    expression: new ColumnExpression('shipment', 'grossWeight'),
  },
  {
    name: 'teu',
    summaryType: 'sum',
    expression: new ColumnExpression('shipment', 'teu'),

    inReportExpression: new FunctionExpression('IF',
      new BinaryExpression(new ColumnExpression('shipment', 'shipmentTypeCode'), '=', 'FCL'),
      new ColumnExpression('shipment', 'teu'),
      new FunctionExpression('ROUND', new MathExpression(new ColumnExpression('shipment', 'cbm'), '/', new Value(25)), new Value(3))
    )

  },

  {
    name: 'quantity',
    summaryType: 'sum',
    expression: new ColumnExpression('shipment', 'quantity'),
  }
]

function summaryFieldExpression(summaryField: SummaryField, isInReport: boolean, condition?: IConditionalExpression) {

  const expression = isInReport && summaryField.inReportExpression ? summaryField.inReportExpression : summaryField.expression

  if (condition) {

    const countIfExpression = new FunctionExpression('COUNT', new ParameterExpression('DISTINCT', new FunctionExpression('IF', condition, new ColumnExpression('shipment', 'id'), new Value(null))))
    const sumIfExpression = new FunctionExpression('SUM', new FunctionExpression('IF', condition, new FunctionExpression('IFNULL', expression, 0), 0))

    return summaryField.summaryIfExpression ? summaryField.summaryIfExpression(condition) : summaryField.summaryType === 'count' ? countIfExpression : sumIfExpression
  }

  const sumExpression = new FunctionExpression('SUM', new FunctionExpression('IFNULL', expression, 0))
  const countExpression = new FunctionExpression('COUNT', new ParameterExpression('DISTINCT', expression))

  return summaryField.summaryType === 'count' ? countExpression : sumExpression

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

const isInReportList = [true, false]

isInReportList.map(isInReport => {

  summaryFieldList.map((summaryField) => {

    const summaryFieldName = isInReport ? `${summaryField.name}InReport` : summaryField.name

    // cbm/chargeableWeight
    const basicFn = (params) => {
      const totalValueExpression = summaryFieldExpression(summaryField, isInReport)
      return new ResultColumn(totalValueExpression, summaryFieldName)
    }

    query.registerResultColumn(summaryFieldName, basicFn)

    // cbmMonth case
    const monthFn: ResultColumnArg = (params) => {

      const resultColumnList = [] as ResultColumn[]

      months.forEach((month, index) => {
        const monthSumExpression = summaryFieldExpression(summaryField, isInReport, monthConditionExpression(month))
        resultColumnList.push(new ResultColumn(monthSumExpression, `${month}_${summaryFieldName}`))
      })

      const totalValueExpression = summaryFieldExpression(summaryField, isInReport)
      resultColumnList.push(new ResultColumn(totalValueExpression, `total_${summaryFieldName}`))

      return resultColumnList
    }

    query.registerResultColumn(`${summaryFieldName}Month`, monthFn)

    // ==================================

    // cbmLastCurrent
    const lastCurrentFn = (params) => {

      console.log(`debug_params`)
      console.log(params)

      const lastSummaryField = summaryFieldExpression(summaryField, isInReport, lastTimeCondition(params))
      const currentSummaryField = summaryFieldExpression(summaryField, isInReport, currentTimeCondition(params))

      const PercentageChangeExpression = percentageChangeFunction(lastSummaryField, currentSummaryField)

      return [
        new ResultColumn(lastSummaryField, `${summaryFieldName}Last`),
        new ResultColumn(currentSummaryField, `${summaryFieldName}Current`),
        new ResultColumn(PercentageChangeExpression, `${summaryFieldName}PercentageChange`)
      ]

    }

    query.registerResultColumn(`${summaryFieldName}LastCurrent`, lastCurrentFn)

    // cbmMonthLastCurrent
    const monthLastCurrentFn = (params) => {
      const resultColumnList = [] as ResultColumn[]

      months.forEach((month, index) => {

        const monthLastCondition = new AndExpressions([
          monthConditionExpression(month),
          lastTimeCondition(params)
        ])

        const monthCurrentCondition = new AndExpressions([
          monthConditionExpression(month),
          currentTimeCondition(params)
        ])

        const monthLastSumExpression = summaryFieldExpression(summaryField, isInReport, monthLastCondition)
        const monthCurrentSumExpression = summaryFieldExpression(summaryField, isInReport, monthCurrentCondition)

        const monthPercentageChangeExpression = percentageChangeFunction(monthLastSumExpression, monthCurrentSumExpression)

        resultColumnList.push(new ResultColumn(monthLastSumExpression, `${month}_${summaryFieldName}Last`))
        resultColumnList.push(new ResultColumn(monthCurrentSumExpression, `${month}_${summaryFieldName}Current`))
        resultColumnList.push(new ResultColumn(monthPercentageChangeExpression, `${month}_${summaryFieldName}PercentageChange`))

      })

      const totalLastSumExpression = summaryFieldExpression(summaryField, isInReport, lastTimeCondition(params))
      const totalCurrentSumExpression = summaryFieldExpression(summaryField, isInReport, currentTimeCondition(params))
      const totalPercentageChangeExpression = percentageChangeFunction(totalLastSumExpression, totalCurrentSumExpression)

      resultColumnList.push(new ResultColumn(totalLastSumExpression, `total_${summaryFieldName}Last`))
      resultColumnList.push(new ResultColumn(totalCurrentSumExpression, `total_${summaryFieldName}Current`))
      resultColumnList.push(new ResultColumn(totalPercentageChangeExpression, `total_${summaryFieldName}PercentageChange`))

      return resultColumnList
    }

    query.registerResultColumn(`${summaryFieldName}MonthLastCurrent`, monthLastCurrentFn)

    // ======================================

    nestedSummaryList.map(x => {

      const nestedMonthFn = (params) => {

        const resultColumnList = [] as ResultColumn[]

        months.forEach((month, index) => {
          const monthCondition = monthConditionExpression(month)
          const monthSumExpression = summaryFieldExpression(summaryField, isInReport, monthCondition)

          // January_T_cbm
          resultColumnList.push(new ResultColumn(monthSumExpression, `${month}_T_${summaryFieldName}`))

          x.cases.map(y => {
            const condition = new AndExpressions([
              monthCondition,
              y.condition
            ])

            // January_F_cbm
            const frcMonthSumExpression = summaryFieldExpression(summaryField, isInReport, condition)
            resultColumnList.push(new ResultColumn(frcMonthSumExpression, `${month}_${y.typeCode}_${summaryFieldName}`))

          })

        })

        x.cases.map(y => {
          // total_F_cbm
          const typeTotalExpression = summaryFieldExpression(summaryField, isInReport, y.condition)
          resultColumnList.push(new ResultColumn(typeTotalExpression, `total_${y.typeCode}_${summaryFieldName}`))

        })

        // total_T_cbm
        const totalValueExpression = summaryFieldExpression(summaryField, isInReport)
        resultColumnList.push(new ResultColumn(totalValueExpression, `total_T_${summaryFieldName}`))

        return resultColumnList
      }
      // frc_cbmMonth
      query.registerResultColumn(`${x.name}_${summaryFieldName}Month`, nestedMonthFn)

      // frc_cbmLastCurrent
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
              summaryFieldExpression(summaryField, isInReport, new AndExpressions([lastCurrentCondition, y.condition])), `${y.typeCode}_${summaryFieldName}${lastOrCurrent.name}`
            ))

          })

          // T_cbmLast
          const totalValueExpression = summaryFieldExpression(summaryField, isInReport, lastCurrentCondition)
          resultColumnList.push(new ResultColumn(totalValueExpression, `T_${summaryFieldName}${lastOrCurrent.name}`))

        })

        return resultColumnList

      }

      query.registerResultColumn(`${x.name}_${summaryFieldName}LastCurrent`, nestedLastCurrentFn)

      // frc_cbmMonthLastCurrent
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
            const monthSumExpression = summaryFieldExpression(summaryField, isInReport, monthCondition)

            // January_T_cbmLast
            resultColumnList.push(new ResultColumn(monthSumExpression, `${month}_T_${summaryFieldName}${lastOrCurrent.name}`))

            x.cases.map(y => {
              const condition = new AndExpressions([
                monthCondition,
                y.condition
              ])

              // January_F_cbmLast
              const frcMonthSumExpression = summaryFieldExpression(summaryField, isInReport, condition)
              resultColumnList.push(new ResultColumn(frcMonthSumExpression, `${month}_${y.typeCode}_${summaryFieldName}${lastOrCurrent.name}`))

            })

          })

          x.cases.map(y => {

            const condition = new AndExpressions([y.condition, lastCurrentCondition])
            // total_F_cbm
            const typeTotalExpression = summaryFieldExpression(summaryField, isInReport, condition)
            resultColumnList.push(new ResultColumn(typeTotalExpression, `total_${y.typeCode}_${summaryFieldName}${lastOrCurrent.name}`))

          })

          // total_T_cbm
          const totalValueExpression = summaryFieldExpression(summaryField, isInReport, lastCurrentCondition)
          resultColumnList.push(new ResultColumn(totalValueExpression, `total_T_${summaryFieldName}${lastOrCurrent.name}`))

        })

        return resultColumnList
      }
      query.registerResultColumn(`${x.name}_${summaryFieldName}MonthLastCurrent`, nestedMonthLastCurrentFn)

    })

  })

})

// Shipment table filter ============================
const shipmentTableFilterFieldList = [

  // base field
  'id',
  'moduleTypeCode',
  'boundTypeCode',
  'nominatedTypeCode',
  'shipmentTypeCode',
  'divisionCode',
  'isDirect',
  'isCoload',
  'houseNo',
  'jobNo',

  {
    name : 'reportingGroup',
    expression : reportingGroupExpression,
    companion : ['table:office']
  },

  {
    name : 'shipId',
    expression : shipIdExpression
  },

  {
    name : 'currentTrackingNo',
    expression : currentTrackingNoExpression
  },

  {
    name: 'agentGroup',
    expression: agentGroupExpression,
    companion : ['table:consignee', 'table:agent']
  },
  {
    name: 'carrierCode',
    expression: carrierCodeExpression
  },
  {
    name: 'carrierName',
    expression: carrierNameExpression
  },

  // tracking last status
  {
    name: 'lastStatusCode',
    expression: lastStatusCodeExpression,
    companion : ['table:lastStatusJoin']
  },
  {
    name: 'lastStatus',
    expression: lastStatusExpression,
    companion : ['table:lastStatusJoin']
  },

  // tracking status
  {
    name: 'statusCode',
    expression: statusCodeExpression,
    companion : ['table:statusJoin']
  },
  {
    name: 'status',
    expression: statusExpression,
    companion : ['table:statusJoin']
  },
  {

    name: 'dateStatus',
    expression: dateStatusExpression
  },

  {
    name: 'alertType',
    expression: alertTypeExpression,
    companion : ['table:alert']
  },
  {
    name: 'alertSeverity',
    expression: alertSeverityExpression,
    companion : ['table:alert']
  },
  {
    name: 'alertCategory',
    expression: alertCategoryExpression,
    companion : ['table:alert']
  },
  {
    name: 'alertStatus',
    expression: alertStatusExpression,
    companion : ['table:alert']
  },
  {
    name: 'alertContent',
    expression: alertContentExpression,
    companion : ['table:alert']
  }
] as {
  name: string
  expression: IExpression |  ((subqueryParam) => IExpression),
  companion?: string[]
}[]

shipmentTableFilterFieldList.map(filterField => {

  const name = (typeof filterField === 'string') ? filterField : filterField.name

  const expressionFn = (subqueryParam) => {
    return (typeof filterField === 'string') ? new ColumnExpression('shipment', filterField) : typeof filterField.expression === 'function' ? filterField.expression(subqueryParam) : filterField.expression
  }

  const companion = (typeof filterField === 'string') ? [] : (filterField.companion && filterField.companion.length) ? filterField.companion : []

  const inFilterQueryFn = ((subqueryParam) => {

    const valueList = subqueryParam['value']

    return new Query({
      $where: new InExpression(expressionFn(subqueryParam), false, valueList),
    })
  }) as SubqueryArg

  const IsNotNullQueryFn = ((subqueryParam) => {
    return new Query({
      $where: new IsNullExpression(expressionFn(subqueryParam), true),
    })
  }) as SubqueryArg

  const IsNullQueryFn = ((subqueryParam) => {
    return new Query({
      $where: new IsNullExpression(expressionFn(subqueryParam), false),
    })
  }) as SubqueryArg

  query.subquery(`${name}`, inFilterQueryFn, ...companion)
  query.subquery(`${name}In`, inFilterQueryFn, ...companion)
  query.subquery(`${name}IsNotNull`, IsNotNullQueryFn, ...companion)
  query.subquery(`${name}IsNull`, IsNullQueryFn, ...companion)

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

                    shipmentIsActiveExpression('b2')
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

// used for exist/ not exist statusCode
const withoutStatusCodeCondition = (withoutStatusCodeParam) => {

  console.log(`debug_withoutStatusCodeParam`)
  console.log(withoutStatusCodeParam)

  if (!(withoutStatusCodeParam && withoutStatusCodeParam.value)) {
    throw new Error('params.subqueries.withoutStatusCodeParam missing')
  }

  const { statusCode, isEstimated, statusDate } = withoutStatusCodeParam.value as { statusCode: string[], isEstimated: boolean, statusDate: { from: 'string' | IExpression, to: 'string' | IExpression } }

  const conditionExpression = new ExistsExpression({

    query: new Query({

      $from: 'tracking_status',
      $where: [

        new BinaryExpression(new ColumnExpression('tracking_status', 'trackingId'), '=', new ColumnExpression('shipmentTrackingLastStatusCodeTable', 'trackingId')),

        new BinaryExpression(new ColumnExpression('tracking_status', 'isEstimated'), '=', isEstimated),
        new BetweenExpression(new ColumnExpression('tracking_status', 'statusCode'), false, statusDate.from, statusDate.to),
        new InExpression(new ColumnExpression('tracking_status', 'statusCode'), false, statusCode)
      ]

    }),

    $not: true

  })

  return conditionExpression
}

const withoutStatusCodeFn = (params) => {

  return new Query({

    $where: withoutStatusCodeCondition(params)

  })

}

query.registerQuery('withoutStatusCode', withoutStatusCodeFn)

// salesman filter =============================
const singleEqualFieldList = [

  {
    name: 'salesmanCode',
    expression: salesmanCodeExpression,
  },

  {
    name: 'rSalesmanCode',
    expression: rSalesmanCodeExpression,
  },

  {
    name: 'sSalesmanCode',
    expression: sSalesmanCodeExpression,
  },

  {
    name: 'cSalesmanCode',
    expression: cSalesmanCodeExpression,
  },

  {
    name : 'batchNumber',
    expression : batchNumberExpression
  },
]

singleEqualFieldList.map(singleEqualField => {

  const expression = (typeof singleEqualField === 'string') ? new ColumnExpression('shipment', singleEqualField) : singleEqualField.expression
  const name = (typeof singleEqualField === 'string') ? singleEqualField : singleEqualField.name

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

// // shipment party Filter================================
// partyList.map(party => {

//   const partyTableName = party.name
//   const partyIdExpression = party.partyIdExpression || new ColumnExpression('shipment_party', `${partyTableName}PartyId`)
//   const partyNameExpression = party.partyNameExpression || new ColumnExpression('shipment_party', `${partyTableName}PartyName`)
//   const partyCodeExpression = party.partyCodeExpression || new ColumnExpression('shipment_party', `${partyTableName}PartyCode`)

//   query
//     .register(
//       `${partyTableName}PartyId`,
//       new Query({
//         $where: new InExpression(partyIdExpression, false),
//       })
//     )
//     .register('value', 0)

//   query
//     .register(
//       `${partyTableName}PartyCode`,
//       new Query({
//         $where: new InExpression(partyCodeExpression, false),
//       })
//     )
//     .register('value', 0)

//   query
//     .register(
//       `${partyTableName}PartyName`,
//       new Query({
//         $where: new RegexpExpression(partyNameExpression, false),
//       })
//     )
//     .register('value', 0)

//   query
//     .register(
//       `${partyTableName}IsNotNull`,
//       new Query({
//         $where: new IsNullExpression(partyIdExpression, true),
//       })
//     )

// })

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
    expression: alertCreatedAtExpression,
    companion : ['table:alert']
  },

  {
    name: 'alertUpdatedAt',
    expression: alertUpdatedAtExpression,
    companion : ['table:alert']

  }

] as (string | {
  name: string,
  expression: IExpression,
  companion: string[]
}) []

dateList.map(date => {

  const dateColumnName = typeof date === 'string' ? date : date.name
  const dateColumnExpression = typeof date === 'string' ? new ColumnExpression('shipment_date', date) : date.expression
  const companion = typeof date === 'string' ? ['table:shipment_date'] : date.companion

  query.registerBoth(dateColumnName, dateColumnExpression, ...companion)

  query
    .register(
      dateColumnName,
      new Query({
        $where: new BetweenExpression(dateColumnExpression, false, new Unknown(), new Unknown()),
      }),
      ...companion
    )
    .register('from', 0)
    .register('to', 1)

})

// Search
query
  .register(
    'q',
    new Query({
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
          new InExpression(
            new ColumnExpression('shipment', 'id'),
            false,
            new Query({
              $select: [
                new ResultColumn('shipmentId')
              ],
              $from: new FromTable('shipment_container'),
              $where: new OrExpressions({
                expressions: [
                  new RegexpExpression(new ColumnExpression('shipment_container', 'contractNo'), false),
                  new RegexpExpression(new ColumnExpression('shipment_container', 'containerNo'), false),
                  new RegexpExpression(new ColumnExpression('shipment_container', 'sealNo'), false),
                  new RegexpExpression(new ColumnExpression('shipment_container', 'sealNo2'), false),
                  new RegexpExpression(new ColumnExpression('shipment_container', 'carrierBookingNo'), false),
                ]
              })
            })
          ),
          new InExpression(
            new ColumnExpression('shipment', 'id'),
            false,
            new Query({
              $select: [
                new ResultColumn('shipmentId')
              ],
              $from: new FromTable('shipment_po'),
              $where: new RegexpExpression(new ColumnExpression('shipment_po', 'poNo'), false)
            })
          ),
          new InExpression(
            new ColumnExpression('shipment', 'id'),
            false,
            new Query({
              $select: [
                new ResultColumn('shipmentId')
              ],
              $from: new FromTable('shipment_reference'),
              $where: new AndExpressions({
                expressions: [
                  new BinaryExpression(new ColumnExpression('shipment_reference', 'refName'), '=', 'Shipment Reference ID'),
                  new RegexpExpression(new ColumnExpression('shipment_reference', 'refDescription'), false),
                ]
              })
            })
          )
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

query
  .register(
    'widgetQ',
    new Query({
      $where: new OrExpressions({
        expressions: [
          new RegexpExpression(new ColumnExpression('shipment', 'houseNo'), false),
          new RegexpExpression(new ColumnExpression('shipment', 'jobNo'), false),
          new RegexpExpression(new ColumnExpression('shipment', 'masterNo'), false),
          new RegexpExpression(new ColumnExpression('shipment', 'containerNos'), false),
          new RegexpExpression(new ColumnExpression('shipment', 'carrierBookingNos'), false),
        ],
      }),
    })
  )
  .register('value', 0)
  .register('value', 1)
  .register('value', 2)
  .register('value', 3)
  .register('value', 4)

// isActive field
query.registerBoth('isActive', shipmentIsActiveExpression('shipment'))

// isActive filter
query.register('isActive', new Query({

  $where: new OrExpressions([

    new AndExpressions([

      new BinaryExpression(new Value('active'), '=', new Unknown('string')),
      // active case
      shipmentIsActiveExpression('shipment')
    ]),

    new AndExpressions([
      new BinaryExpression(new Value('deleted'), '=', new Unknown('string')),
      // deleted case
      new BinaryExpression(shipmentIsActiveExpression('shipment'), '=', false)
    ])

  ])

}))
  .register('value', 0)
  .register('value', 1)

export default query
