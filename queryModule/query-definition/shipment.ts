import { QueryDef, SubqueryArg } from 'classes/query/QueryDef'
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
  IExpression,
  IConditionalExpression,
  MathExpression,
  Expression
} from 'node-jql'
import { IQueryParams } from 'classes/query'
import { ExpressionHelperInterface, registerAll, SummaryField, registerSummaryField, NestedSummaryCondition, registerAllDateField, addDateExpression, convertToEndOfDate, convertToStartOfDate, registerQueryCondition, registerCheckboxField, registerNestedSummaryFilter, IfExpression, IfNullExpression, RegisterInterface } from 'utils/jql-subqueries'
import { hasSubTaskQuery, generalIsDoneExpression, generalIsClosedExpression } from 'utils/sop-task'
import sopQuery from './sop_task'

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

const jobDateExpression = new ColumnExpression('shipment', 'jobDate')

const jobYearExpression = new FunctionExpression('LPAD', new FunctionExpression('YEAR', jobDateExpression), 4, '0')

const jobMonthExpression = new FunctionExpression('CONCAT', new FunctionExpression('YEAR', jobDateExpression),
  '-',
  new FunctionExpression('LPAD', new FunctionExpression('MONTH', jobDateExpression), 2, '0'))

const jobWeekExpression = new FunctionExpression('LPAD', new FunctionExpression('WEEK', jobDateExpression), 2, '0')

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

const coloaderPartyIdExpression = new CaseExpression({
  cases: [
    {
      $when: new AndExpressions([
        new BinaryExpression(new ColumnExpression('shipment', 'billTypeCode'), '=', 'M'),
        new BinaryExpression(new ColumnExpression('shipment', 'moduleTypeCode'), '=', 'AIR'),
      ]),
      $then: new ColumnExpression('shipment_party', `linerAgentPartyId`)
    }
  ],
  $else: new Value(null)
})


const coloaderPartyCodeExpression = new CaseExpression({
  cases: [
    {
      $when: new AndExpressions([
        new BinaryExpression(new ColumnExpression('shipment', 'billTypeCode'), '=', 'M'),
        new BinaryExpression(new ColumnExpression('shipment', 'moduleTypeCode'), '=', 'AIR'),
      ]),
      $then: new ColumnExpression('shipment_party', `linerAgentPartyCode`)
    }
  ],
  $else: new Value(null)
})


const coloaderPartyNameExpression = new CaseExpression({
  cases: [
    {
      $when: new AndExpressions([
        new BinaryExpression(new ColumnExpression('shipment', 'billTypeCode'), '=', 'M'),
        new BinaryExpression(new ColumnExpression('shipment', 'moduleTypeCode'), '=', 'AIR'),
      ]),
      $then: new ColumnExpression('shipment_party', `linerAgentPartyName`)
    }
  ],
  $else: new Value(null)
})

const coloaderPartyShortNameInReportExpression = new CaseExpression({
  cases: [
    {
      $when: new AndExpressions([
        new BinaryExpression(new ColumnExpression('shipment', 'billTypeCode'), '=', 'M'),
        new BinaryExpression(new ColumnExpression('shipment', 'moduleTypeCode'), '=', 'AIR'),
      ]),
      $then: new ColumnExpression('linerAgent', `shortName`)
    }
  ],
  $else: new Value(null)
})

const coloaderPartyNameInReportExpression = new CaseExpression({
  cases: [
    {
      $when: new AndExpressions([
        new BinaryExpression(new ColumnExpression('shipment', 'billTypeCode'), '=', 'M'),
        new BinaryExpression(new ColumnExpression('shipment', 'moduleTypeCode'), '=', 'AIR'),
      ]),
      $then: new ColumnExpression('linerAgent', `name`)
    }
  ],
  $else: new Value(null)
})


const flexDataPartyList = [
  'notifyParty2'
]

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
    partyIdExpression: {
      expression: agentPartyIdExpression,
      companion: ['table:shipment_party']
    },
    partyCodeExpression: {
      expression: agentPartyCodeExpression,
      companion: ['table:shipment_party']
    },
    partyNameExpression: {
      expression: agentPartyNameExpression,
      companion: ['table:shipment_party']
    }
  },
  {
    name: 'coloader',
    partyIdExpression: {
      expression: coloaderPartyIdExpression,
      companion: ['table:shipment_party']
    },
    partyCodeExpression: {
      expression: coloaderPartyCodeExpression,
      companion: ['table:shipment_party']
    },
    partyNameExpression: {
      expression: coloaderPartyNameExpression,
      companion: ['table:shipment_party']
    },
    partyNameInReportExpression: {
      expression: coloaderPartyNameInReportExpression,
      companion: ['table:linerAgent']
    },
    partyShortNameInReportExpression: {
      expression: coloaderPartyShortNameInReportExpression,
      companion: ['table:linerAgent']

    }
  },
  ...flexDataPartyList.map(flexDataParty => {

    const defaultCompanion = ['table:shipment_party']

    const flexDataExpression = new ColumnExpression('shipment_party', 'flexData')

    const partyNameExpression = new MathExpression(flexDataExpression, '->>', `$.${flexDataParty}PartyName`)
    const partyCodeExpression = new MathExpression(flexDataExpression, '->>', `$.${flexDataParty}PartyCode`)
    const partyIdExpression = new MathExpression(flexDataExpression, '->>', `$.${flexDataParty}PartyId`)

    const partyNameInReportExpression = partyNameExpression
    const partyCodeInReportExpression = partyNameExpression

    return {
      name: flexDataParty,

      partyNameExpression: {
        expression: partyNameExpression,
        companion: defaultCompanion
      },

      partyIdExpression: {
        expression: partyIdExpression,
        companion: defaultCompanion
      },

      partyCodeExpression: {
        expression: partyCodeExpression,
        companion: defaultCompanion
      },
      partyNameInReportExpression: {
        expression: partyNameInReportExpression,
        companion: defaultCompanion
      },
      partyCodeInReportExpression: {
        expression: partyCodeInReportExpression,
        companion: defaultCompanion
      }

    }

  })

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

const query = new QueryDef(new Query({

  $select: [
    new ResultColumn(new ColumnExpression('shipment', '*')),
    new ResultColumn(new ColumnExpression('shipment', 'id'), 'shipmentId'),
    new ResultColumn(new ColumnExpression('shipment', 'id'), 'shipmentPartyId'),
  ],
  $from: new FromTable(

    {
      table: 'shipment',
    }

  )
}))

query.registerQuery('isMinCreatedAt', new Query({

  $where: new OrExpressions([
    new BinaryExpression(new ColumnExpression('shipment', 'isMinCreatedAt'), '=', true),
    new IsNullExpression(new ColumnExpression('shipment', 'isMinCreatedAt'), false),
  ])

}))

// all shipment join
query.table('shipment_date', new Query({

  $from: new FromTable({

    table: 'shipment',
    joinClauses: [
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

query.table('shipment_date_utc', new Query({

  $from: new FromTable({

    table: 'shipment',
    joinClauses: [
      {
        operator: 'LEFT',
        table: new FromTable({
          table: new Query({
            $select: [
              new ResultColumn(new ColumnExpression('shipment_date_utc', '*')),
            ],
            $from: new FromTable('shipment_date_utc', 'shipment_date_utc'),
            $where: new AndExpressions({
              expressions: [
                new IsNullExpression(new ColumnExpression('shipment_date_utc', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('shipment_date_utc', 'deletedBy'), false),
              ]
            }),
          }),
          $as: 'shipment_date_utc'
        }),
        $on: new BinaryExpression(new ColumnExpression('shipment', 'id'), '=', new ColumnExpression('shipment_date_utc', 'shipmentId'))
      }
    ]
  })

}))

query.table('shipment_party', new Query({

  $from: new FromTable({

    table: 'shipment',
    joinClauses: [
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
  const partyIdExpression = (party.partyIdExpression && party.partyIdExpression.expression) ? party.partyIdExpression.expression : new ColumnExpression('shipment_party', `${partyTableName}PartyId`)

  query.table(partyTableName, new Query({

    $from: new FromTable({

      table: 'shipment',
      joinClauses: [
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

// location table :  table:portOfLoading, table:portOfDischarge
locationList.map(location => {

  const joinTableName = `${location}`
  const locationCode = `${location}Code`

  // location join (e.g. portOfLoadingJoin)
  query.table(joinTableName, new Query({

    $from: new FromTable({

      table: 'shipment',

      joinClauses: [{

        operator: 'LEFT',
        table: new FromTable({
          table: 'location',
          $as: `${location}`
        }),
        $on: [
          new BinaryExpression(new ColumnExpression(`${location}`, 'portCode'), '=', new ColumnExpression('shipment', locationCode)),
        ]
      }]
    }),

    $where: new IsNullExpression(new ColumnExpression('shipment', locationCode), true)

  })
  )

})

// used for statusJoin
const shipmentTrackingLastStatusCodeTableExpression = new Query({

  $select: [
    new ResultColumn(new ColumnExpression('tracking', 'trackingNo')),
    new ResultColumn(new ColumnExpression('tracking', 'lastStatusCode')),
    new ResultColumn(new ColumnExpression('tracking', 'lastStatusDescription')),
    new ResultColumn(new ColumnExpression('tracking', 'lastStatusDate')),
    new ResultColumn(new ColumnExpression('tracking', 'lastEstimatedUpdateDate')),
    new ResultColumn(new ColumnExpression('tracking', 'lastActualUpdateDate'))
  ],

  $from: 'tracking'

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

  $from: new FromTable({
    table: 'tracking',
    joinClauses: [

      {
        operator: 'LEFT',
        $on: new BinaryExpression(new ColumnExpression('tracking_status', 'trackingId'), '=', new ColumnExpression('tracking', 'id')),
        table: new FromTable('tracking_status')
      }
    ]
  })

})

// statusJoin : table:status
query.table('status', new Query(
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

// lastStatusJoin : table:lastStatus
query.table('lastStatus', new Query({

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

// alertJoin : table:alert
query.table('alert', new Query({

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

// sop task join
query.table('sop-task', new Query({
  $from: new FromTable('shipment', {
    operator: 'LEFT',
    table: 'sop-task',
    $on: [
      new BinaryExpression(new ColumnExpression('sop-task', 'tableName'), '=', 'shipment'),
      new BinaryExpression(new ColumnExpression('sop-task', 'primaryKey'), '=', new ColumnExpression('shipment', 'id')),
    ]
  }),
  $where: new IsNullExpression(new ColumnExpression('sop-task', 'id'), true)
}))

// shipment_amount table :  table:shipment_amount
query.table('shipment_amount', new Query({

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
      }

    ]

  })
}))

// shipment_cargo table :  table:shipment_cargo
query.table('shipment_cargo', new Query({

  $from: new FromTable({

    table: 'shipment',
    joinClauses: [

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
              // decvalue in flexData
              new ResultColumn(
                new FunctionExpression(
                  'SUM',
                  new FunctionExpression(
                    'CAST',
                    new ParameterExpression(
                      null,
                      new MathExpression(
                        new ColumnExpression('shipment_cargo', 'flexData'),
                        '->>',
                        '$.decvalue'
                      ),
                      'AS DECIMAL'
                    )
                  )
                ),
                'cargo_value'
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

  $from: new FromTable({
    table: 'shipment',
    joinClauses: [
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
              new ResultColumn(
                new FunctionExpression(
                  'COUNT',
                  new ColumnExpression('shipment_container', 'id')
                ),
                'container_count'
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

  $from: new FromTable({
    table: 'shipment',
    joinClauses: [
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

  $from: new FromTable({
    table: 'shipment',
    joinClauses: [
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

  $from: new FromTable({
    table: 'shipment',
    joinClauses: [

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
  $select: [
    new ResultColumn(new ColumnExpression('shipment_reference', 'refDescription'))
  ],

  $from: 'shipment_reference',

  $where: [
    new BinaryExpression(new ColumnExpression('shipment_reference', 'refName'), '=', 'Shipment Reference ID'),
    new BinaryExpression(new ColumnExpression('shipment_reference', 'shipmentId'), '=', idExpression)
  ],
  $limit: 1

}))


const officeErpSiteExpression = new MathExpression(
  new ColumnExpression('office', 'thirdPartyCode'),
  '->>',
  '$.erpSite'
)

const officeErpCodeExpression = new MathExpression(
  new ColumnExpression('office', 'thirdPartyCode'),
  '->>',
  '$.erp'
)

const controllingCustomerErpCodeExpression = new MathExpression(
  new ColumnExpression('controllingCustomer', 'thirdPartyCode'),
  '->>',
  '$.erp'
)



const primaryKeyListStringExpression = new FunctionExpression('GROUP_CONCAT', new ParameterExpression('DISTINCT', new ColumnExpression('shipment', 'id')))

const partyGroupCodeExpression = new ColumnExpression('shipment', 'partyGroupCode')

const currentTrackingNoExpression = new ColumnExpression('shipment', 'currentTrackingNo')
const batchNumberExpression = new ColumnExpression('shipment', 'batchNumber')

const haveCurrentTrackingNoExpression = new FunctionExpression('IF', new IsNullExpression(currentTrackingNoExpression, false), '', '_')

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
// WHEN office.thirdPartyCode.erp  = G0017 AND b.division = 'TAE' THEN 'AU'
// WHEN office.thirdPartyCode.erp = G0017 AND b.division = 'TAI' THEN 'AV'
// WHEN b.division = 'MM' THEN 'AX'
// WHEN b.division = 'AM' THEN 'AZ'
// WHEN b.division = 'SE' AND b.shipmentType = 'FCL' THEN 'SA'
// WHEN b.division = 'SE' AND b.shipmentType = 'LCL' THEN 'SB'
// WHEN b.division = 'SE' AND b.shipmentType = 'Consol' THEN 'SC'
// WHEN b.division = 'SI' AND b.shipmentType = 'FCL' THEN 'SR'
// WHEN b.division = 'SI' AND b.shipmentType = 'LCL' THEN 'SS'
// WHEN b.division = 'SI' AND b.shipmentType = 'Consol' THEN 'ST'
// WHEN office.thirdPartyCode.erp = G0017 AND b.division = 'TSE' THEN 'SU'
// WHEN office.thirdPartyCode.erp = G0017 AND b.division = 'TSI' THEN 'SV'
// WHEN b.division = 'TS' THEN 'SW'
// WHEN b.division = 'SM' THEN 'SZ'
// WHEN b.division = 'LOG' THEN 'ZL'
// ELSE LEFT(b.division, 2)
// END

const gglTaiwanOfficeErpCode = 'G0017'

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

        new BinaryExpression(officeErpCodeExpression, '=', gglTaiwanOfficeErpCode),

        new BinaryExpression(new ColumnExpression('shipment', 'divisionCode'), '=', 'TAE')
      ]),
      $then: new Value('AU')
    },

    {
      $when: new AndExpressions([

        new BinaryExpression(officeErpCodeExpression, '=', gglTaiwanOfficeErpCode),

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

        new BinaryExpression(officeErpCodeExpression, '=', gglTaiwanOfficeErpCode),

        new BinaryExpression(new ColumnExpression('shipment', 'divisionCode'), '=', 'TSE')
      ]),
      $then: new Value('SU')
    },

    {
      $when: new AndExpressions([

        new BinaryExpression(officeErpCodeExpression, '=', gglTaiwanOfficeErpCode),

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
const lastStatusDateExpression = new ColumnExpression('shipmentTrackingLastStatusCodeTable', 'lastStatusDate')

const lastStatusCodeOrDescriptionExpression = new FunctionExpression('IFNULL', new ColumnExpression('shipmentTrackingLastStatusCodeTable', 'lastStatusCode'), new ColumnExpression('shipmentTrackingLastStatusCodeTable', 'lastStatusDescription'))
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


/**
 *
 * AIR case :
 * ATA = ATA || ETA || ETD + 2 day
 * ATD = ATD || ETD + 1 day
 *
 *  today > ATA + 1 day => inDelivery
 *   ATA + 1 day > today > ATA => arrival
 *
 *  ATA > today and ATD = today => departure
 *  today > ATD  => inTransit
 *  else upcoming
 *
 *
 * sea case
 * ATA = ATA || ETA + 2 day
 * ATD = ATD || ETD + 1 day
 *
 * today > ATA + 3 day then inDelivery
 * ATA + 3 > today > ATA then arrival
 *
 * ATA > today > ATD + 3 day then inTransit
 * ATD + 3 day > today > ATD then departure
 * else upcoming
 */

const dateStatusExpression = (queryParam: IQueryParams) => {

  const subqueryParam = queryParam.subqueries.dateStatus as any as { today: any, currentTime: any }

  if (!subqueryParam) {
    throw new Error(`missing dateStatus in subqueries`)
  }

  const rawATAExpression = new ColumnExpression('shipment_date', 'arrivalDateActual')
  const rawETAExpression = new ColumnExpression('shipment_date', 'arrivalDateEstimated')

  const rawATDExpression = new ColumnExpression('shipment_date', 'departureDateActual')
  const rawETDExpression = new ColumnExpression('shipment_date', 'departureDateEstimated')

  const AIRDateStatusExpression = (subqueryParam) => {

    // const todayExpression = new FunctionExpression('NOW')
    const todayExpression = new Value(subqueryParam.today)
    const currentTimeExpression = new Value(subqueryParam.currentTime)

    const calculatedATAExpression = new CaseExpression({
      cases: [
        {
          $when: new IsNullExpression(rawETAExpression, true),
          $then: convertToEndOfDate(rawETAExpression)
        },
        {
          $when: new IsNullExpression(rawETDExpression, true),
          $then: convertToEndOfDate(addDateExpression(rawETDExpression, 2, 'DAY'))
        }

      ],

      $else: new Value(null)

    })

    const calculatedATDExpression = convertToStartOfDate(addDateExpression(rawETDExpression, 1, 'DAY'))
    const finalATAExpression = new FunctionExpression('IFNULL', rawATAExpression, calculatedATAExpression)
    const finalATDExpression = new FunctionExpression('IFNULL', rawATDExpression, calculatedATDExpression)

    const finalATAInPast = new BinaryExpression(finalATAExpression, '<=', currentTimeExpression)
    const finalATDInPast = new BinaryExpression(new FunctionExpression('DATE', finalATDExpression), '<=', todayExpression)

    return new CaseExpression({

      cases: [

        {
          $when: finalATAInPast,
          $then: new CaseExpression({

            cases: [
              {
                $when: new BinaryExpression(convertToEndOfDate(addDateExpression(finalATAExpression, 1, 'DAY')), '<=', currentTimeExpression),
                $then: new Value('inDelivery')
              },
            ],

            $else: new Value('arrival')
          })
        },

        {

          $when: finalATDInPast,
          $then: new CaseExpression({

            cases: [
              {
                $when: new BinaryExpression(new FunctionExpression('DATE', finalATDExpression), '=', todayExpression),
                $then: new Value('departure')
              },

            ],

            $else: new Value('inTransit')
          })
        }

      ],
      $else: new Value('upcoming')
    })

  }

  const SEADateStatusExpression = (subqueryParam) => {

    const todayExpression = new Value(subqueryParam.today)
    const currentTimeExpression = new Value(subqueryParam.currentTime)

    const calculatedATAExpression = addDateExpression(rawETAExpression, 2, 'DAY')
    const calculatedATDExpression = addDateExpression(rawETDExpression, 1, 'DAY')
    const finalATAExpression = new FunctionExpression('IFNULL', rawATAExpression, calculatedATAExpression)
    const finalATDExpression = new FunctionExpression('IFNULL', rawATDExpression, calculatedATDExpression)

    const finalATAInPast = new BinaryExpression(finalATAExpression, '<=', todayExpression)
    const finalATDInPast = new BinaryExpression(finalATDExpression, '<=', todayExpression)

    return new CaseExpression({

      cases: [

        {
          $when: finalATAInPast,
          $then: new CaseExpression({
            cases: [
              {
                $when: new BinaryExpression(addDateExpression(finalATAExpression, 3, 'DAY'), '<=', todayExpression),
                $then: new Value('inDelivery')
              } as ICase,
            ],

            $else: new Value('arrival')
          }
          )
        },

        {
          $when: finalATDInPast,
          $then: new CaseExpression({
            cases: [
              {
                $when: new AndExpressions([
                  new BinaryExpression(addDateExpression(finalATDExpression, 3, 'DAY'), '<=', todayExpression)
                ]),
                $then: new Value('inTransit')
              } as ICase,
            ],

            $else: new Value('departure')
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

      $else: new Value('upcoming')
    })
  }

  const result = new CaseExpression({

    cases: [
      {
        $when: new BinaryExpression(new ColumnExpression('shipment', 'moduleTypeCode'), '=', 'AIR'),
        $then: AIRDateStatusExpression(subqueryParam)
      },
      {
        $when: new BinaryExpression(new ColumnExpression('shipment', 'moduleTypeCode'), '=', 'SEA'),
        $then: SEADateStatusExpression(subqueryParam)
      }

    ],
    $else: new Value(null)
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

const alertMessageExpression = new FunctionExpression('CONCAT', new ColumnExpression('alert', 'alertType'), new Value('Message'))

const alertCategoryExpression = new ColumnExpression('alert', 'alertCategory')

const alertStatusExpression = new ColumnExpression('alert', 'status')

const alertCreatedAtExpression = new ColumnExpression('alert', 'createdAt')
const alertUpdatedAtExpression = new ColumnExpression('alert', 'updatedAt')
const alertClosedAtExpression = new ColumnExpression('alert', 'closedAt')


const alertDeadlineExpression = new ColumnExpression('alert', 'deadline')


const alertContentExpression = new QueryExpression(new Query({

  $select: [
    new ResultColumn(new ColumnExpression('alert2', 'flexData'), 'flexData')
  ],
  $from: new FromTable({
    table: 'alert',
    $as: 'alert2'
  }),
  $where: new BinaryExpression(alertIdExpression, '=', new ColumnExpression('alert2', 'id')),
  $limit: 1
}))

// sopTask-related fields
const sopTaskIdExpression = new ColumnExpression('sopTask', 'id')
const sopTaskTableNameExpression = new ColumnExpression('sopTask', 'tableName')
const sopTaskPrimaryKeyExpression = new ColumnExpression('sopTask', 'primaryKey')
const sopTaskCategoryExpression = new ColumnExpression('sopTask', 'category')
const sopTaskNameExpression = new ColumnExpression('sopTask', 'name')
const sopTaskRemarkExpression = new ColumnExpression('sopTask', 'remark')

const activeStatusExpression = new CaseExpression({
  cases: [
    {
      $when: new BinaryExpression(shipmentIsActiveExpression('shipment'), '=', false),
      $then: new Value('deleted')
    }
  ],
  $else: new Value('active')
})




// all field related to party
const partyExpressionList = partyList.reduce((accumulator: ExpressionHelperInterface[], party) => {

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

  const partyTableName = party.name

  // these 3 will get from shipment_party table
  const partyIdExpression = party.partyIdExpression || { expression: new ColumnExpression('shipment_party', `${partyTableName}PartyId`), companion: ['table:shipment_party'] }

  const partyCodeExpression = party.partyCodeExpression || { expression: new ColumnExpression('shipment_party', `${partyTableName}PartyCode`), companion: ['table:shipment_party'] }
  const partyNameExpression = party.partyNameExpression || { expression: new FunctionExpression('IFNULL', new ColumnExpression('shipment_party', `${partyTableName}PartyName`), partyCodeExpression.expression), companion: ['table:shipment_party'] }


  // this 2, will try to get from the party table directly
  const partyNameInReportExpression = party.partyNameInReportExpression || { expression: new FunctionExpression('IFNULL', new ColumnExpression(party.name, `name`), partyNameExpression.expression), companion: [`table:${party.name}`, `table:shipment_party`] }
  const partyShortNameInReportExpression = party.partyShortNameInReportExpression || { expression: new FunctionExpression('IFNULL', new ColumnExpression(party.name, `shortName`), partyNameInReportExpression.expression), companion: [`table:${party.name}`, `table:shipment_party`] }

  const resultExpressionList = partyFieldList.map(partyField => {

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

      // PartyReportName will get from party join instead of shipment_party direct;
      case 'PartyNameInReport':
        finalExpressionInfo = partyNameInReportExpression
        break

      case 'PartyShortNameInReport':
        finalExpressionInfo = partyShortNameInReportExpression
        break

      default:
        finalExpressionInfo = { expression: new ColumnExpression('shipment_party', fieldName) as IExpression, companion: ['table:shipment_party'] }
        break
    }

    return {
      name: fieldName,
      ...finalExpressionInfo
    } as ExpressionHelperInterface
  })

  return accumulator.concat(resultExpressionList)
}, [])

const locationExpressionList = locationList.reduce((accumulator: ExpressionHelperInterface[], location) => {

  const locationCodeExpressionInfo = {
    name: `${location}Code`,
    expression: new ColumnExpression('shipment', `${location}Code`),
  } as ExpressionHelperInterface

  const locationLatitudeExpressionInfo = {
    name: `${location}Latitude`,
    expression: new ColumnExpression(`${location}`, `latitude`),
    companion: [`table:${location}`]
  } as ExpressionHelperInterface

  const locationLongitudeExpressionInfo = {
    name: `${location}Longitude`,
    expression: new ColumnExpression(`${location}`, `longitude`),
    companion: [`table:${location}`]
  } as ExpressionHelperInterface

  accumulator.push(locationCodeExpressionInfo)
  accumulator.push(locationLatitudeExpressionInfo)
  accumulator.push(locationLongitudeExpressionInfo)

  return accumulator

}, [])




// this list must match document config fileName
const documentFileNameList = [
  'Freight Invoice',
  'MBL',
  'HBL Original',
  'HBL Telex released',
  'Commercial Invoice',
  'Packing List',
]

const haveDocumentExpressionList = documentFileNameList.map(documentFileName => {

  const haveDocumentExpression = new InExpression(idExpression, false,
    new QueryExpression(
      new Query({

        $select: [
          new ResultColumn(new ColumnExpression('document', 'id'))
        ],
        $from: 'document',
        $where: [
          new BinaryExpression(new ColumnExpression('document', 'fileName'), '=', documentFileName),
          new BinaryExpression(new ColumnExpression('document', 'tableName'), '=', 'shipment'),

          new IsNullExpression(new ColumnExpression('document', 'deletedAt'),true),
          new IsNullExpression(new ColumnExpression('document', 'deletedBy'),true)

        ]

      })
    )
  )

  return {
    name : `haveDocument_${documentFileName}`,
    expression : haveDocumentExpression

  } as RegisterInterface


})

const baseTableName = 'shipment'
const fieldList = [

  {
    name: 'id',
    expression: idExpression
  },
  ...partyExpressionList,
  ...locationExpressionList,
  ...haveDocumentExpressionList,

  {
    name: 'officeErpSite',
    expression: officeErpSiteExpression,
    companion: ['table:office']
  },

  {
    name: 'controllingCustomerErpCode',
    expression: controllingCustomerErpCodeExpression,
    companion: ['table:controllingCustomer']
  },

  {
    name: 'officeErpCode',
    expression: officeErpCodeExpression,
    companion: ['table:office']
  },

  {
    name: 'jobMonth',
    expression: jobMonthExpression
  },

  {
    name: 'jobWeek',
    expression: jobWeekExpression
  },

  {
    name: 'jobYear',
    expression: jobYearExpression
  },


  'erpCode',
  'moduleTypeCode',
  'boundTypeCode',
  'nominatedTypeCode',
  'shipmentTypeCode',
  'divisionCode',
  'isDirect',
  'isCoload',
  'houseNo',
  'jobNo',
  'masterNo',
  'containerNos',
  {
    name: 'primaryKeyListString',
    expression: primaryKeyListStringExpression
  },
  {
    name: 'partyGroupCode',
    expression: partyGroupCodeExpression
  },

  {
    name: 'currentTrackingNo',
    expression: currentTrackingNoExpression
  },

  {
    name: 'haveCurrentTrackingNo',
    expression: haveCurrentTrackingNoExpression
  },

  {
    name: 'agentGroup',
    expression: agentGroupExpression,
    companion: ['table:consignee', 'table:agent']
  },
  {
    name: 'carrierCode',
    expression: carrierCodeExpression,
  },
  {
    name: 'carrierName',
    expression: carrierNameExpression,
  },
  {
    name: 'salesmanCode',
    expression: salesmanCodeExpression
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
    name: 'batchNumber',
    expression: batchNumberExpression
  },

  {
    name: 'reportingGroup',
    expression: reportingGroupExpression,
    companion: ['table:office']
  },
  {
    name: 'shipId',
    expression: shipIdExpression
  },

  {
    name: 'lastStatusCode',
    expression: lastStatusCodeExpression,
    companion: ['table:lastStatus']
  },
  {
    name: 'lastStatus',
    expression: lastStatusExpression,
    companion: ['table:lastStatus']
  },
  {
    name: 'lastStatusDate',
    expression: lastStatusDateExpression,
    companion: ['table:lastStatus']
  },
  {
    name: 'lastStatusCodeOrDescription',
    expression: lastStatusCodeOrDescriptionExpression,
    companion: ['table:lastStatus']
  },

  {
    name: 'statusCode',
    expression: statusCodeExpression,
    companion: ['table:status']
  },

  {
    name: 'status',
    expression: statusExpression,
    companion: ['table:status']
  },

  {
    name: 'dateStatus',
    expression: dateStatusExpression,
    companion: ['table:shipment_date']
  },

  {
    name: 'alertId',
    expression: alertIdExpression,
    companion: ['table:alert']
  },

  {
    name: 'alertTableName',
    expression: alertTableNameExpression,
    companion: ['table:alert']
  },

  {
    name: 'alertPrimaryKey',
    expression: alertPrimaryKeyExpression,
    companion: ['table:alert']
  },

  {
    name: 'alertSeverity',
    expression: alertSeverityExpression,
    companion: ['table:alert']
  },

  {
    name: 'alertType',
    expression: alertTypeExpression,
    companion: ['table:alert']
  },

  {
    name: 'alertTitle',
    expression: alertTitleExpression,
    companion: ['table:alert']
  },

  {
    name: 'alertMessage',
    expression: alertMessageExpression,
    companion: ['table:alert']
  },

  {
    name: 'alertCategory',
    expression: alertCategoryExpression,
    companion: ['table:alert']
  },

  {
    name: 'alertContent',
    expression: alertContentExpression,
    companion: ['table:alert']
  },

  {
    name: 'alertStatus',
    expression: alertStatusExpression,
    companion: ['table:alert']
  },
  {
    name: 'activeStatus',
    expression: activeStatusExpression
  },
  {
    name: 'count',
    expression: new FunctionExpression('COUNT', new ParameterExpression('DISTINCT', new ColumnExpression('shipment', 'id')))
  },
  {
    name: 'alertCount',
    expression: new FunctionExpression('COUNT', new ParameterExpression('DISTINCT', new ColumnExpression('alert', 'id'))),
    companion: ['table:alert']
  },

  {
    name: 'sopTaskId',
    expression: sopTaskIdExpression,
    companion: ['table:sop-task']
  },
  {
    name: 'sopTaskTableName',
    expression: sopTaskTableNameExpression,
    companion: ['table:sop-task']
  },
  {
    name: 'sopTaskPrimaryKey',
    expression: sopTaskPrimaryKeyExpression,
    companion: ['table:sop-task']
  },
  {
    name: 'sopTaskCategory',
    expression: sopTaskCategoryExpression,
    companion: ['table:sop-task']
  },
  {
    name: 'sopTaskName',
    expression: sopTaskNameExpression,
    companion: ['table:sop-task']
  },
  {
    name: 'sopTaskRemark',
    expression: sopTaskRemarkExpression,
    companion: ['table:sop-task']
  },
  {
    name: 'sopTaskCount',
    expression: new FunctionExpression('COUNT', new ParameterExpression('DISTINCT', sopTaskIdExpression)),
    companion: ['table:sop-task']
  },

] as ExpressionHelperInterface[]

registerAll(query, baseTableName, fieldList)


// summary fields  =================

const nestedSummaryList = [

  {
    name: 'frc',
    companion: ['table:shipment_party'],
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
    companion: [],
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

] as NestedSummaryCondition[]


registerNestedSummaryFilter(query, nestedSummaryList)




const containerTypeList = [
  '20',
  '40',
  'HQ'
]


const reportContainerTypeList = [
  '20',
  '40',
  'HQ'
]

// field that store in report json
const reportingSummaryFieldNameList = [
  ...reportContainerTypeList.map(containerType => `${containerType}_ContainerTypeCount`),
  'containerCount'
]


const summaryFieldList: SummaryField[] = [


  ...containerTypeList.map(containerType => {

    const name = `container${containerType}`

    return {
      name,
      summaryType: 'sum',
      expression: new ColumnExpression('shipment', name)
    } as SummaryField

  }),

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
  },
  {
    name: 'cargoValue',
    summaryType: 'sum',
    expression: new ColumnExpression('shipment_cargo', 'cargo_value'),
    companion: ['table:shipment_cargo']
  },

  ...reportingSummaryFieldNameList.map(reportingSummaryFieldName => {
    return {
      name: reportingSummaryFieldName,
      summaryType: 'sum',
      expression: new MathExpression(
        new ColumnExpression('shipment', 'report'),
        '->>',
        `$.${reportingSummaryFieldName}`
      )
    } as SummaryField
  })

]

registerSummaryField(query, baseTableName, summaryFieldList, nestedSummaryList, jobDateExpression)


registerCheckboxField(query)



query.subquery(false,'haveDocument',((value: any, params?: IQueryParams) => {


  const fileNameList = (value && value.value) ?  (Array.isArray(value.value) ? value.value : [value.value]) : []

  if (!fileNameList.length)
  {
    throw new Error('fileNameList empty')
  }

  const existExpressionList = fileNameList.map(fileName => {

    return new ExistsExpression(new Query({
      $select : [
        new ResultColumn(new ColumnExpression('document','tableName'))
      ],
      $from: 'document',
      $where : [
        new BinaryExpression(new ColumnExpression('document','tableName'),'=','shipment'),
        new BinaryExpression(new ColumnExpression('document','primaryKey'),'=',idExpression),
        new BinaryExpression(new ColumnExpression('document','fileName'),'=',fileName),

        new IsNullExpression(new ColumnExpression('document', 'deletedAt'),true),
        new IsNullExpression(new ColumnExpression('document', 'deletedBy'),true)
      ]
    }),false)

  })


  return new Query({
    $where : new AndExpressions(existExpressionList)
  })
}))

query.subquery(false,'missingDocument',((value: any, params?: IQueryParams) => {


  const fileNameList = (value && value.value) ?  (Array.isArray(value.value) ? value.value : [value.value]) : []

  if (!fileNameList.length)
  {
    throw new Error('fileNameList empty')
  }

  const existExpressionList = fileNameList.map(fileName => {

    return new ExistsExpression(new Query({
      $select : [
        new ResultColumn(new ColumnExpression('document','tableName'))
      ],
      $from: 'document',
      $where : [
        new BinaryExpression(new ColumnExpression('document','tableName'),'=','shipment'),
        new BinaryExpression(new ColumnExpression('document','primaryKey'),'=',idExpression),
        new BinaryExpression(new ColumnExpression('document','fileName'),'=',fileName),

        new IsNullExpression(new ColumnExpression('document', 'deletedAt'),true),
        new IsNullExpression(new ColumnExpression('document', 'deletedBy'),true)
      ]
    }),true)

  })


  return new Query({
    $where : new AndExpressions(existExpressionList)
  })
}))



// search all party in partyList
query.subquery(false, 'anyPartyId', ((value: any, params?: IQueryParams) => {

  const partyIdList = value.value

  const inExpressionList = partyList.reduce((acc, party) => {

    const defaultPartyIdExpression = new ColumnExpression('shipment_party', `${party.name}PartyId`)
    const partyIdExpression = party.partyIdExpression ? party.partyIdExpression.expression : defaultPartyIdExpression

    const inPartyInExpression = new InExpression(partyIdExpression, false, partyIdList)

    acc.push(inPartyInExpression)
    return acc

  }, [])

  return new Query({
    $where: new OrExpressions(inExpressionList)
  })
}), 'table:shipment_party')


// Bill Type
query.subquery(
  true,
  'billTypeCode',
  new Query({
    $where: new CaseExpression({

      cases: [
        {
          $when: new BinaryExpression(new Value('default'), '=', new Unknown()),
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
          $when: new BinaryExpression(new Value('skip'), '=', new Unknown()),
          $then: new Value(true)
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
  .register('value', 3)

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


const isColoaderExpression = (queryParams: IQueryParams) => {

  const partyTypeList = ['forwarder']
  const subqueryParam = queryParams.subqueries.isColoader as { value: boolean }

  if (!subqueryParam) {
    throw new Error('missing subqueryParam for isColoader')
  }

  const { value } = subqueryParam

  if (value) {
    return controllingCustomerIncludeRoleExpression(false, partyTypeList)
  }
  else {
    controllingCustomerIncludeRoleExpression(true, partyTypeList)
  }

}

query.subquery(
  'controllingCustomerIncludeRole',
  new Query({
    $where: controllingCustomerIncludeRoleExpression(false),
  })
)
  .register('value', 0)

query.subquery(
  'controllingCustomerExcludeRole',
  new Query({

    $where: controllingCustomerIncludeRoleExpression(true),
  })
)
  .register('value', 0)

query.subquery('isColoader', ((value: any, param?: IQueryParams) => {

  return new Query({
    $where: isColoaderExpression(param),
  })

}) as SubqueryArg

).register('value', 0)


function viaHKGExpression() {
  const erpCode = 'G0001'
  return new BinaryExpression(officeErpCodeExpression, '=', erpCode)
}

query.subquery('viaHKG',

  new Query({
    $where: viaHKGExpression(),
  }),
  'table:office'
)



const vgmQuery = new Query({

  $select: [
    new ResultColumn(new ColumnExpression('shipment_container', 'shipmentId'))
  ],
  $from: 'shipment_container',
  $where: new BinaryExpression(new ColumnExpression('shipment_container', 'vgmWeight'), '>', 0)

})

registerQueryCondition(query, 'vgmNonZero', idExpression, vgmQuery)

// query.subquery('missingVGM', new Query({
//   $where: new InExpression(idExpression, false,
//     new QueryExpression(
//       new Query({

//         $select: [
//           new ResultColumn(new ColumnExpression('shipment_container', 'shipmentId'))
//         ],
//         $from: 'shipment_container',
//         $where: new BinaryExpression(new ColumnExpression('shipment_container', 'vgmWeight'), '>', 0)

//       })
//     )
//   )
// }))

const documentQuery = (subQueryValue, param: IQueryParams) => {

  const fileName = subQueryValue.value

  return new Query({
    $where: new InExpression(idExpression, false,
      new QueryExpression(
        new Query({

          $select: [
            new ResultColumn(new ColumnExpression('document', 'primaryKey'))
          ],
          $from: 'document',
          $where: [
            new BinaryExpression(new ColumnExpression('document', 'fileName'), '=', fileName),
            new BinaryExpression(new ColumnExpression('document', 'tableName'), '=', 'shipment')
          ]

        })
      )
    )
  })

}

registerQueryCondition(query, 'haveDocument', idExpression, documentQuery)


// query.subquery('missingDocument', (subQueryValue, param) => {

//   const fileName = subQueryValue.value

//   return new Query({
//     $where: new InExpression(idExpression, false,
//       new QueryExpression(
//         new Query({

//           $select: [
//             new ResultColumn(new ColumnExpression('document', 'primaryKey'))
//           ],
//           $from: 'document',
//           $where: [
//             new BinaryExpression(new ColumnExpression('document', 'fileName'), '=', fileName),
//             new BinaryExpression(new ColumnExpression('document', 'tableName'), '=', 'shipment')
//           ]

//         })
//       )
//     )
//   })
// })

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



const dateNameList = [
  'departure',
  'arrival',
  'oceanBill',
  'cargoReady',
  'scheduleAssigned',
  'scheduleApproaved',
  'spaceConfirmation',
  'bookingSubmit',
  'cyCutOff',
  'documentCutOff',
  'pickup',
  'shipperLoad',
  'returnLoad',
  'cargoReceipt',
  'shipperDocumentSubmit',
  'shipperInstructionSubmit',
  'houseBillDraftSubmit',
  'houseBillConfirmation',
  'masterBillReleased',
  'preAlertSend',
  'ediSend',
  'cargoRolloverStatus',
  'inboundTransfer',
  'onRail',
  'arrivalAtDepot',
  'availableForPickup',
  'pickupCargoBeforeDemurrage',
  'finalCargo',
  'cargoPickupWithDemurrage',
  'finalDoorDelivery',
  'returnEmptyContainer',
  'sentToShipper',
  'gateIn',
  'sentToConsignee',
  'loadOnboard'
]

const flexDataDateNameList = [
  'sendAMS'
]

const dateList = [

  // date in shipment_date / shipment_date_utc table
  ...dateNameList.reduce((accumulator, currentValue) => {
    return accumulator.concat([

      `${currentValue}DateEstimated`,
      `${currentValue}DateActual`,
      {
        name: `${currentValue}DateActualInUtc`,
        expression: new ColumnExpression('shipment_date_utc', `${currentValue}DateActual`),
        companion: ['table:shipment_date_utc']
      },
      {
        name: `${currentValue}DateEstimatedInUtc`,
        expression: new ColumnExpression('shipment_date_utc', `${currentValue}DateEstimated`),
        companion: ['table:shipment_date_utc']
      },
    ])
  }, []),



  // date in shipment_date_utc table
  ...flexDataDateNameList.reduce((accumulator, currentValue) => {

    const shipmentDateFlexDataExpression = new ColumnExpression('shipment_date','flexData')
    const shipmentDateUtcFlexDataExpression = new ColumnExpression('shipment_date_utc','flexData')

    const dateActualExpression =  new MathExpression(shipmentDateFlexDataExpression,'->>',`$.${currentValue}DateActual`)
    const dateEstimatedExpression =  new MathExpression(shipmentDateFlexDataExpression,'->>',`$.${currentValue}DateEstimated`)

    const dateActualExpression = new MathExpression(shipmentDateFlexDataExpression, '->>', `$.${currentValue}DateActual`)
    const dateEstimatedExpression = new MathExpression(shipmentDateFlexDataExpression, '->>', `$.${currentValue}DateEstimated`)

    const dateActualInUtcExpression = new MathExpression(shipmentDateUtcFlexDataExpression, '->>', `$.${currentValue}DateActual`)
    const dateEstimatedInUtcExpression = new MathExpression(shipmentDateUtcFlexDataExpression, '->>', `$.${currentValue}DateEstimated`)

    return accumulator.concat([
      {
        name: `${currentValue}DateActual`,
        expression: dateActualExpression,
        companion: ['table:shipment_date']
      },
      {
        name: `${currentValue}DateEstimated`,
        expression: dateEstimatedExpression,
        companion: ['table:shipment_date']
      },
      {
        name: `${currentValue}DateActualInUtc`,
        expression: dateActualInUtcExpression,
        companion: ['table:shipment_date_utc']
      },
      {
        name: `${currentValue}DateEstimatedInUtc`,
        expression: dateEstimatedInUtcExpression,
        companion: ['table:shipment_date_utc']
      },
    ])
  }, []),



  {
    name: 'jobDate',
    expression: jobDateExpression
  },
  {
    name: 'alertCreatedAt',
    expression: alertCreatedAtExpression,
    companion: ['table:alert']
  },
  {
    name: 'alertUpdatedAt',
    expression: alertUpdatedAtExpression,
    companion: ['table:alert']
  },
  {
    name: 'alertClosedAt',
    expression: alertClosedAtExpression,
    companion: ['table:alert']
  },
  {
    name: 'alertDeadline',
    expression: alertDeadlineExpression,
    companion: ['table:alert']
  },

] as ExpressionHelperInterface[]


registerAllDateField(query, 'shipment_date', dateList)


query.registerResultColumn(
  'lastStatusWidget',
  new ResultColumn(new Value(1)),
  'table:shipment_date',
  'field:houseNo',
  'field:masterNo',
  'field:containerNos',
  ...(dateNameList.reduce((companion: string[], dateString: string) => {
    companion.push(`field:${dateString}DateEstimated`)
    companion.push(`field:${dateString}DateActual`)
    return companion
  }, []))
)

// Search

query.subquery('containerNoLike', new Query({
  $where: new InExpression(
    new ColumnExpression('shipment', 'id'),
    false,
    new Query({
      $select: [
        new ResultColumn('shipmentId')
      ],
      $from: new FromTable('shipment_container'),
      $where: new RegexpExpression(new ColumnExpression('shipment_container', 'containerNo'), false),
    })
  )
})).register('value', 0)
query.subquery('contractNoLike', new Query({
  $where: new InExpression(
    new ColumnExpression('shipment', 'id'),
    false,
    new Query({
      $select: [
        new ResultColumn('shipmentId')
      ],
      $from: new FromTable('shipment_container'),
      $where: new RegexpExpression(new ColumnExpression('shipment_container', 'contractNo'), false),
    })
  )
})).register('value', 0)
query.subquery('sealNoLike', new Query({
  $where: new InExpression(
    new ColumnExpression('shipment', 'id'),
    false,
    new Query({
      $select: [
        new ResultColumn('shipmentId')
      ],
      $from: new FromTable('shipment_container'),
      $where: new OrExpressions({
        expressions: [
          new RegexpExpression(new ColumnExpression('shipment_container', 'sealNo'), false),
          new RegexpExpression(new ColumnExpression('shipment_container', 'sealNo2'), false),
        ]
      }),
    })
  )
})).register('value', 0).register('value', 1)
query.subquery('soNoLike', new Query({
  $where: new InExpression(
    new ColumnExpression('shipment', 'id'),
    false,
    new Query({
      $select: [
        new ResultColumn('shipmentId')
      ],
      $from: new FromTable('shipment_container'),
      $where: new RegexpExpression(new ColumnExpression('shipment_container', 'carrierBookingNo'), false),
    })
  )
})).register('value', 0)
query.subquery('poNoLike', new Query({
  $where: new InExpression(
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
})).register('value', 0)

query
  .subquery(
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
          new InExpression(
            new ColumnExpression('shipment', 'id'),
            false,
            new Query({
              $select: [
                new ResultColumn('shipmentId')
              ],
              $from: new FromTable('shipment_party'),
              $where: new OrExpressions({
                expressions: [
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

function addShipmentCheck(query: Query) {
  if (!query.$where) {
    query.$where = new AndExpressions([])
  }
  const expr = query.$where as AndExpressions
  expr.expressions.push(
    new BinaryExpression(new ColumnExpression('sop_task', 'tableName'), '=', new Value('shipment')),
    new BinaryExpression(new ColumnExpression('sop_task', 'primaryKey'), '=', new ColumnExpression('shipment', 'id'))
  )
}

// @field noOfTasks
// number of outstanding tasks
query.field('noOfTasks', params => {
  const noOfTasksQuery = sopQuery.apply({
    fields: ['noOfTasks'],
    subqueries: { notDeleted: true, notDone: true, notSubTask: true }
  })
  addShipmentCheck(noOfTasksQuery)
  return {
    $select: new ResultColumn(new QueryExpression(noOfTasksQuery), 'noOfTasks')
  }
})

// @field sopScore
// sop score field
query.field('sopScore', params => {
  const query = sopQuery.apply({
    fields: ['deduct'],
    subqueries: { notDeleted: true }
  })
  addShipmentCheck(query)
  return {
    $select: new ResultColumn(IfExpression(
      new IsNullExpression(new ColumnExpression('shipment', 'sopScore'), true), // TODO shipment status is closed
      new ColumnExpression('shipment', 'sopScore'),
      new MathExpression(new Value(100), '-', IfNullExpression(new QueryExpression(query), new Value(0)))
    ), 'sopScore')
  }
})

// @subquery hasDueTasks
// return shipments with due tasks
const dueTasksQuery = sopQuery.apply({
  fields: ['deduct'],
  subqueries: {
    notDeleted: true,
    notClosed: true,
    notDone: true,
    isDue: true
  }
})
addShipmentCheck(dueTasksQuery)
query.subquery('hasDueTasks', {
  $where: new ExistsExpression(dueTasksQuery, false)
})

// @subquery noDueTasks
// return shipments without due tasks
query.subquery('noDueTasks', {
  $where: new ExistsExpression(dueTasksQuery, true)
})

// @subquery hasDeadTasks
// return shipments with dead tasks
const deadTasksQuery = sopQuery.apply({
  fields: ['deduct'],
  subqueries: {
    notDeleted: true,
    notClosed: true,
    notDone: true,
    isDead: true
  }
})
addShipmentCheck(deadTasksQuery)
query.subquery('hasDeadTasks', {
  $where: new ExistsExpression(deadTasksQuery, false)
})

// @subquery noDeadTasks
// return shipments without dead tasks
query.subquery('noDeadTasks', {
  $where: new ExistsExpression(deadTasksQuery, true)
})

// @field noOfOutstandingTasks
query.field('noOfOutstandingTasks', params => {
  let subqueries: any = { tableName: { value: 'shipment' }, notSubTask: true }
  if (params.subqueries.sop_user) subqueries.user = params.subqueries.sop_user
  if (params.subqueries.sop_partyGroupCode) subqueries.partyGroupCode = params.subqueries.sop_partyGroupCode
  if (params.subqueries.sop_teams) subqueries.teams = params.subqueries.sop_teams
  if (params.subqueries.sop_today) subqueries.today = params.subqueries.sop_today
  if (params.subqueries.sop_date) subqueries.date = params.subqueries.sop_date
  if (params.subqueries.notDone) subqueries.notDone = params.subqueries.notDone
  if (params.subqueries.notClosed) subqueries.notClosed = params.subqueries.notClosed
  if (params.subqueries.notDeleted) subqueries.notDeleted = params.subqueries.notDeleted
  const query = sopQuery.apply({
    fields: ['count'],
    subqueries
  })
  addShipmentCheck(query)
  return {
    $select: new ResultColumn(new QueryExpression(query), 'noOfOutstandingTasks')
  }
})

// @subquery myTasksOnly
query.subquery('myTasksOnly', (value, params) => {
  let subqueries: any = {
    tableName: { value: 'shipment' },
    notSubTask: true,
    user: params.subqueries.sop_user,
    partyGroupCode: params.subqueries.sop_partyGroupCode,
    today: params.subqueries.sop_today,
    date: params.subqueries.sop_date
  }
  if (params.subqueries.sop_teams) subqueries.teams = params.subqueries.sop_teams
  if (params.subqueries.notDone) subqueries.notDone = params.subqueries.notDone
  if (params.subqueries.notClosed) subqueries.notClosed = params.subqueries.notClosed
  if (params.subqueries.notDeleted) subqueries.notDeleted = params.subqueries.notDeleted
  const query = sopQuery.apply({
    distinct: true,
    fields: ['id'],
    subqueries
  })
  addShipmentCheck(query)
  return {
    $where: new ExistsExpression(query, false)
  }
})

export default query
