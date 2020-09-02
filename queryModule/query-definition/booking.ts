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
  IExpression,
  CaseExpression,
  Unknown,
  IConditionalExpression,
  ICase,
  MathExpression,
  QueryExpression,
  ExistsExpression,
} from 'node-jql'
import { passSubquery, ExpressionHelperInterface, registerAll, registerSummaryField, NestedSummaryCondition, SummaryField, registerAllDateField, registerCheckboxField, IfExpression, IfNullExpression } from 'utils/jql-subqueries'
import sopQuery from './sop_task'
import { IShortcut } from 'classes/query/Shortcut'

const partyList = [

  {
    name: 'shipper',
  },

  {
    name: 'consignee',
  },
  {
    name : 'agent'
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
    name: 'forwarder',
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


const query = new QueryDef(
  new Query({

    // $distinct: true,

    $select: [
      new ResultColumn(new ColumnExpression('booking', '*')),
      new ResultColumn(new ColumnExpression('booking', 'id'), 'bookingId'),
    ],
    $from: new FromTable(
      'booking'
    ),
  })
)

query.table('booking_date', new Query({
  $from : new FromTable({
    table : 'booking',
    joinClauses : [
      {
        operator: 'LEFT',
        table: new FromTable({
          table: new Query({
            $select: [
              new ResultColumn(new ColumnExpression('booking_date', '*')),
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
        $on: new BinaryExpression(new ColumnExpression('booking', 'id'), '=', new ColumnExpression('booking_date', 'bookingId'))
      }
    ]
  })

}))

query.table('booking_party', new Query({

  $from : new FromTable({

    table : 'booking',
    joinClauses : [
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
        $on: new BinaryExpression(new ColumnExpression('booking', 'id'), '=', new ColumnExpression('booking_party', 'bookingId'))
      },
    ]
  })

}))

query.table('booking_amount', new Query({

  $from : new FromTable({

    table : 'booking',
    joinClauses : [
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
    ]
  })

}))

query.table('booking_container', new Query({

  $from : new FromTable({

    table : 'booking',
    joinClauses : [
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
    ]

  })

}))

query.table('booking_popacking', new Query({

  $from : new FromTable({

    table : 'booking',
    joinClauses : [
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
    ]
  })

}))

query.table('booking_reference', new Query({

  $from : new FromTable({

    table : 'booking',
    joinClauses : [
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
    ]
  })
}))

query.table('carrier', new Query({

  $from : new FromTable({
    table : 'booking',

    joinClauses : [
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
    ]
  })
}))

query.table('moduleType', new Query({

  $from : new FromTable({
    table : 'booking',

    joinClauses : [
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
    ]
  })
}))

query.table('boundType', new Query({

  $from : new FromTable({
    table : 'booking',

    joinClauses : [
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
    ]
  })
}))

query.table('service', new Query({

  $from : new FromTable({
    table : 'booking',

    joinClauses : [
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
    ]
  })
}))

query.table('incoTerms', new Query({

  $from : new FromTable({
    table : 'booking',

    joinClauses : [
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
    ]
  })
}))

query.table('freightTerms', new Query({

  $from : new FromTable({
    table : 'booking',

    joinClauses : [
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
    ]
  })
}))

query.table('otherTerms', new Query({

  $from : new FromTable({
    table : 'booking',

    joinClauses : [
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
    ]
  })
}))

// party join : table:office, table:shipper etc
partyList.map(party => {

  const partyTableName = party.name

  const companion = (party.partyIdExpression && party.partyIdExpression.companion) ? party.partyIdExpression.companion : [`table:booking_party`]
  const partyIdExpression = (party.partyIdExpression && party.partyIdExpression.expression) ? party.partyIdExpression.expression :  new ColumnExpression('booking_party', `${partyTableName}PartyId`)

  query.table(partyTableName, new Query({

    $from : new FromTable({

      table : 'booking',
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

// location table :  table:portOfLoading, table:portOfDischarge
locationList.map(location => {

  const joinTableName = `${location}`
  const locationCode = `${location}Code`

  // location join (e.g. portOfLoadingJoin)
  query.table(joinTableName, new Query({

      $from: new FromTable({

        table : 'booking',

        joinClauses : [{

        operator: 'LEFT',
        table:  new FromTable({
          table : 'location',
          $as : `${location}`
        }),
        $on: [
          new BinaryExpression(new ColumnExpression(`${location}`, 'portCode'), '=', new ColumnExpression('booking', locationCode)),
        ]
      }]
    }),

      $where: new IsNullExpression(new ColumnExpression('booking', locationCode), true)

    })
  )

})

// used for statusJoin
const bookingTrackingLastStatusCodeTableExpression = new Query({

  $select: [
    new ResultColumn(new ColumnExpression('tracking', 'trackingNo')),
    new ResultColumn(new ColumnExpression('tracking', 'lastStatusCode')),
    new ResultColumn(new ColumnExpression('tracking', 'lastStatusDescription')),
    new ResultColumn(new ColumnExpression('tracking', 'lastStatusDate')),
    new ResultColumn(new ColumnExpression('tracking', 'lastEstimatedUpdateDate')),
    new ResultColumn(new ColumnExpression('tracking', 'lastActualUpdateDate'))
  ],

  $from : 'tracking'

})

const bookingTrackingStatusCodeTableExpression = new Query({

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

// statusJoin : table:status
query.table('status', new Query(
  {
    $from: new FromTable('booking', {

      operator: 'LEFT',
      table: new FromTable({

        table: bookingTrackingStatusCodeTableExpression,
        $as: 'bookingTrackingStatusCodeTable',

      }),

      $on: new BinaryExpression(new ColumnExpression('bookingTrackingStatusCodeTable', 'trackingNo'), '=', new ColumnExpression('booking', 'currentTrackingNo'))

    })

  }))

// lastStatusJoin : table:lastStatus
query.table('lastStatus', new Query({

  $from: new FromTable('booking', {

    operator: 'LEFT',
    table: new FromTable({

      table: bookingTrackingLastStatusCodeTableExpression,
      $as: 'bookingTrackingLastStatusCodeTable',

    }),
    $on: new BinaryExpression(new ColumnExpression('bookingTrackingLastStatusCodeTable', 'trackingNo'), '=', new ColumnExpression('booking', 'currentTrackingNo'))

  })

}))

//  alert Join
// warning !!! this join will create duplicate record of booking
// plz use wisely, mainly use together with group by

// alertJoin : table:alert
query.table('alert', new Query({

    $from: new FromTable('booking', {

      operator: 'LEFT',
      table: 'alert',

      $on: [
        new BinaryExpression(new ColumnExpression('alert', 'tableName'), '=', 'booking'),
        new BinaryExpression(new ColumnExpression('alert', 'primaryKey'), '=', new ColumnExpression('booking', 'id'))
      ]

    }),

    $where: new IsNullExpression(new ColumnExpression('alert', 'id'), true)

  })
)

//  register date field
const jobDateExpression = new ColumnExpression('booking', 'createdAt')

const jobYearExpression = new FunctionExpression('LPAD', new FunctionExpression('YEAR', jobDateExpression), 4, '0')

const jobMonthExpression = new FunctionExpression('CONCAT', new FunctionExpression('YEAR', jobDateExpression),
  '-',
  new FunctionExpression('LPAD', new FunctionExpression('MONTH', jobDateExpression), 2, '0'))

const jobWeekExpression = new FunctionExpression('LPAD', new FunctionExpression('WEEK', jobDateExpression), 2, '0')

// ============

const isActiveConditionExpression = new AndExpressions([
  new IsNullExpression(new ColumnExpression('booking', 'deletedAt'), false),
  new IsNullExpression(new ColumnExpression('booking', 'deletedBy'), false)
])

const activeStatusExpression = new CaseExpression({
  cases: [
    {
      $when: new BinaryExpression(isActiveConditionExpression, '=', false),
      $then: new Value('deleted')
    }
  ],
  $else: new Value('active')
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
      $then: new MathExpression(
        new ColumnExpression('alert', 'flexData'),
        '->>',
        '$.customMessage'
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

const poNoExpression = new MathExpression(
  new ColumnExpression('booking', 'flexData'),
  '->>',
  '$.poNo'
)

const serviceExpression = new FunctionExpression(
  'IFNULL',
  new ColumnExpression('service', 'name'),
  new ColumnExpression('booking', 'serviceCode')
)

const moduleTypeExpression = new FunctionExpression(
  'IFNULL',
  new ColumnExpression('moduleType', 'name'),
  new ColumnExpression('booking', 'moduleTypeCode')
)

const boundTypeExpression = new FunctionExpression(
  'IFNULL',
  new ColumnExpression('boundType', 'name'),
  new ColumnExpression('booking', 'boundTypeCode')
)

const incoTermsExpression = new FunctionExpression(
  'IFNULL',
  new ColumnExpression('incoTerms', 'name'),
  new ColumnExpression('booking', 'incoTermsCode')
)

const otherTermsExpression = new FunctionExpression(
  'IFNULL',
  new ColumnExpression('otherTerms', 'name'),
  new ColumnExpression('booking', 'incoTermsCode')
)

const freightTermsExpression = new FunctionExpression(
  'IFNULL',
  new ColumnExpression('freightTerms', 'name'),
  new ColumnExpression('booking', 'freightTermsCode')
)

const shipmentIdExpression = new QueryExpression(new Query({
  $select : [
    new ResultColumn(new ColumnExpression('shipment_booking','shipmentId'))
  ],
  $from: new FromTable('shipment_booking'),
  $where: [
    new BinaryExpression(new ColumnExpression('shipment_booking','bookingNo'),'=',new ColumnExpression('booking','bookingNo'))
  ]
}))

const bookingHouseNoExpression = new FunctionExpression(
  'IF',
  new BinaryExpression(
    new ColumnExpression('booking_reference', 'refName'),
    '=',
    new Value('HBL')
  ),
  new ColumnExpression('booking_reference', 'refDescription'),
  new Value(null)
)

const bookingMasterNoExpression = new FunctionExpression(
  'IF',
  new BinaryExpression(new ColumnExpression('booking_reference', 'refName'), '=', 'MBL'),
  new ColumnExpression('booking_reference', 'refDescription'),
  new Value(null)
)


const shipmentMasterNoExpression = new QueryExpression(new Query({
  $select : [
    new ResultColumn(new ColumnExpression('shipment','masterNo'))
  ],
  $from: new FromTable({
    table: 'shipment_booking',
    joinClauses : [{
      operator: 'LEFT',
      table: 'shipment',
      $on: [new BinaryExpression(new ColumnExpression('shipment_booking', 'shipmentId'), '=', new ColumnExpression('shipment', 'id'))]
    }]
  }),
  $where: [
    new BinaryExpression(new ColumnExpression('shipment_booking','bookingNo'),'=',new ColumnExpression('booking','bookingNo'))
  ]
}))

const shipmentHouseNoExpression = new QueryExpression(new Query({
  $select : [
    new ResultColumn(new ColumnExpression('shipment','houseNo'))
  ],
  $from: new FromTable({
    table: 'shipment_booking',
    joinClauses : [{
      operator: 'LEFT',
      table: 'shipment',
      $on: [new BinaryExpression(new ColumnExpression('shipment_booking', 'shipmentId'), '=', new ColumnExpression('shipment', 'id'))]
    }]
  }),
  $where: [
    new BinaryExpression(new ColumnExpression('shipment_booking','bookingNo'),'=',new ColumnExpression('booking','bookingNo'))
  ]
}))

const houseNoExpression = new FunctionExpression(
  'IF',
  new IsNullExpression(shipmentIdExpression, true),
  shipmentHouseNoExpression,
  bookingHouseNoExpression,
)

const masterNoExpression = new FunctionExpression(
  'IF',
  new IsNullExpression(shipmentIdExpression, true),
  shipmentMasterNoExpression,
  bookingMasterNoExpression,
)


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

  const partyIdExpression = party.partyIdExpression  || { expression : new ColumnExpression('booking_party', `${partyTableName}PartyId`), companion : ['table:booking_party']}
  const partyNameExpression = party.partyNameExpression ||  { expression :  new ColumnExpression('booking_party', `${partyTableName}PartyName`), companion : ['table:booking_party']}
  const partyCodeExpression = party.partyCodeExpression || { expression :  new ColumnExpression('booking_party', `${partyTableName}PartyCode`), companion : ['table:booking_party']}
  const partyNameInReportExpression = party.partyNameInReportExpression || { expression :  new ColumnExpression(party.name, `name`), companion : [`table:${party.name}`]}
  const partyShortNameInReportExpression = party.partyShortNameInReportExpression ||  { expression : new FunctionExpression('IFNULL', new ColumnExpression(party.name, `shortName`), partyNameInReportExpression.expression), companion : [`table:${party.name}`]}

  const resultExpressionList = partyFieldList.map(partyField => {

    const fieldName = `${partyTableName}${partyField}`

    let finalExpressionInfo: { expression: IExpression, companion: string[]}

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

      // PartyReportName will get from party join instead of booking_party direct;y
      case 'PartyNameInReport':
        finalExpressionInfo = partyNameInReportExpression
        break

      case 'PartyShortNameInReport':
        finalExpressionInfo = partyShortNameInReportExpression
        break

      default:
        finalExpressionInfo = { expression : new ColumnExpression('booking_party', fieldName) as IExpression, companion : ['table:booking_party'] }
        break
    }

    return {
      name : fieldName,
      ...finalExpressionInfo
    } as ExpressionHelperInterface
  })

  return accumulator.concat(resultExpressionList)
 }, [])

 const locationExpressionList = locationList.reduce((accumulator: ExpressionHelperInterface[], location) => {

  const locationCodeExpressionInfo = {
    name : `${location}Code`,
    expression : new ColumnExpression('booking', `${location}Code`),
  } as ExpressionHelperInterface

  const locationLatitudeExpressionInfo = {
    name : `${location}Latitude`,
    expression : new ColumnExpression(`${location}`, `latitude`),
    companion : [`table:${location}`]
  } as ExpressionHelperInterface

  const locationLongitudeExpressionInfo = {
    name : `${location}Longitude`,
    expression : new ColumnExpression(`${location}`, `longitude`),
    companion : [`table:${location}`]
  } as ExpressionHelperInterface

  accumulator.push(locationCodeExpressionInfo)
  accumulator.push(locationLatitudeExpressionInfo)
  accumulator.push(locationLongitudeExpressionInfo)

  return accumulator

 }, [])

const baseTableName = 'booking'

const fieldList = [
  'id',
  'partyGroupCode',
  'bookingNo',

  'moduleTypeCode',
  'boundTypeCode',
  'nominatedTypeCode',
  'shipmentTypeCode',
  'divisionCode',
  'isDirect',
  'isCoload',

  'createdAt',
  'updatedAt',

  ...partyExpressionList,
  ...locationExpressionList,

  {
    name: 'shipmentId',
    expression: shipmentIdExpression
  },
  {

    name : 'houseNo',
    expression : houseNoExpression,
    companion : ['table:booking_reference']
  },
  {

    name : 'masterNo',
    expression : masterNoExpression,
    companion : ['table:booking_reference']
  },

  {

    name : 'poNo',
    expression : poNoExpression
  },


  {
    name : 'service',
    expression : serviceExpression,
    companion : ['table:service']
  },

  {
    name : 'moduleType',
    expression : moduleTypeExpression,
    companion : ['table:moduleType']
  },

  {
    name : 'boundType',
    expression : boundTypeExpression,
    companion : ['table:boundType']
  },

  {
    name : 'incoTerms',
    expression : incoTermsExpression,
    companion : ['table:incoTerms']
  },
  {
    name : 'otherTerms',
    expression : otherTermsExpression,
    companion : ['table:otherTerms']
  },
  {
    name : 'freightTerms',
    expression : freightTermsExpression,
    companion : ['table:freightTerms']
  },

  {
    name : 'lastStatusCode',
    expression : lastStatusCodeExpression,
    companion : ['table:lastStatus']
  },

  {
    name : 'lastStatus',
    expression : lastStatusExpression,
    companion : ['table:lastStatus']
  },

  {
    name : 'jobDate',
    expression : jobDateExpression
  },

  {
    name : 'jobMonth',
    expression : jobMonthExpression
  },

  {
    name : 'jobWeek',
    expression : jobWeekExpression
  },

  {
    name : 'jobYear',
    expression : jobYearExpression
  },

  {
    name : 'carrierName',
    expression : carrierNameExpression,
    companion : ['table:carrier']
  },
  {
    name : 'carrierCode',
    expression : carrierCodeExpression
  },
  {
    name : 'alertTableName',
    expression : alertTableNameExpression,
    companion : ['table:alert']
  },
  {
    name : 'alertPrimaryKey',
    expression : alertPrimaryKeyExpression,
    companion : ['table:alert']
  },
  {
    name : 'alertSeverity',
    expression : alertSeverityExpression,
    companion : ['table:alert']
  },
  {
    name : 'alertType',
    expression : alertTypeExpression,
    companion : ['table:alert']
  },
  {
    name : 'alertTitle',
    expression : alertTitleExpression,
    companion : ['table:alert']
  },
  {
    name : 'alertMessage',
    expression : alertMessageExpression,
    companion : ['table:alert']
  },
  {
    name : 'alertCategory',
    expression : alertCategoryExpression,
    companion : ['table:alert']
  },
  {
    name : 'alertContent',
    expression : alertContentExpression,
    companion : ['table:alert']
  },
  {
    name : 'alertStatus',
    expression : alertStatusExpression,
    companion : ['table:alert']
  },
  {
    name : 'activeStatus',
    expression : activeStatusExpression
  }

] as ExpressionHelperInterface[]

registerAll(query, baseTableName, fieldList)

// ===================================

  // warning !!! will not contain all if the list is too large
  query.registerResultColumn('primaryKeyListString',
    new ResultColumn(new FunctionExpression('GROUP_CONCAT', new ParameterExpression('DISTINCT', new ColumnExpression('booking', 'id'))), 'primaryKeyListString')
  )

query.register(
  'count',
  new ResultColumn(new FunctionExpression('COUNT', new ParameterExpression('DISTINCT', new ColumnExpression('booking', 'id'))), 'count')
)

query
.register(
  'alertCount',
  new ResultColumn(new FunctionExpression('COUNT', new ParameterExpression('DISTINCT', new ColumnExpression('alert', 'id'))), 'alertCount')
)

//  register summary field
const nestedSummaryList = [] as NestedSummaryCondition[]

const summaryFieldList : SummaryField[]  = [
  {
    name: 'totalBooking',
    summaryType: 'count',
    expression: new ColumnExpression('booking', 'id')
  },
  {
    name: 'quantity',
    summaryType: 'sum',
    expression: new ColumnExpression('booking_popacking', 'quantity'),
    companion: ['table:booking_popacking']
  },

  {
    name: 'cbm',
    summaryType : 'sum',
    expression: new ColumnExpression('booking', 'cbm')
  },
  {
    name: 'teu',
    summaryType : 'sum',
    expression: new ColumnExpression('booking', 'teu')
  },
  {
    name: 'volumeWeight',
    summaryType : 'sum',
    expression: new ColumnExpression('booking', 'volumeWeight')
  },

  {
    name: 'grossWeight',
    summaryType : 'sum',
    expression: new ColumnExpression('booking', 'grossWeight')
  },

  {
    name: 'chargeableWeight',
    summaryType : 'sum',
    expression: new ColumnExpression('booking', 'chargeableWeight')
  },
  {
    name: 'container20',
    summaryType : 'sum',
    expression: new ColumnExpression('booking', 'container20')
  },
  {
    name: 'container40',
    summaryType : 'sum',
    expression: new ColumnExpression('booking', 'container40')
  },
  {
    name: 'containerHQ',
    summaryType : 'sum',
    expression: new ColumnExpression('booking', 'containerHQ')
  }
]

registerSummaryField(query, baseTableName, summaryFieldList, nestedSummaryList, jobDateExpression)

registerCheckboxField(query)



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
    name : 'alertCreatedAt',
    expression : alertCreatedAtExpression,
    companion : ['table:alert']
  },
  {
    name : 'alertUpdatedAt',
    expression : alertUpdatedAtExpression,
    companion : ['table:alert']
  },

] as ExpressionHelperInterface[]


registerAllDateField(query,'booking_date',dateList)

// ----------------- filter in main filter menu
query.register('containerNoLike', new Query({
  $where: new InExpression(
    new ColumnExpression('booking', 'id'),
    false,
    new Query({
      $select: [new ResultColumn('bookingId')],
      $from: new FromTable('booking_container'),
      $where: new RegexpExpression(new ColumnExpression('booking_container', 'containerNo'), false)
    })
  )
})).register('value', 0)
query.register('soNoLike', new Query({
  $where: new InExpression(
    new ColumnExpression('booking', 'id'),
    false,
    new Query({
      $select: [new ResultColumn('bookingId')],
      $from: new FromTable('booking_container'),
      $where: new RegexpExpression(new ColumnExpression('booking_container', 'soNo'), false)
    })
  )
})).register('value', 0)
query.register('sealNoLike', new Query({
  $where: new InExpression(
    new ColumnExpression('booking', 'id'),
    false,
    new Query({
      $select: [new ResultColumn('bookingId')],
      $from: new FromTable('booking_container'),
      $where: new RegexpExpression(new ColumnExpression('booking_container', 'sealNo'), false)
    })
  )
})).register('value', 0)
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
          new InExpression(
            new ColumnExpression('booking', 'id'),
            false,
            new Query({
              $select: [new ResultColumn('bookingId')],
              $from: new FromTable('booking_party'),
              $where: new OrExpressions({
                expressions: [
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
                ]
              })
            })
          ),
          new InExpression(
            new ColumnExpression('booking', 'id'),
            false,
            new Query({
              $select: [new ResultColumn('bookingId')],
              $from: new FromTable('booking_container'),
              $where: new OrExpressions({
                expressions: [
                  new RegexpExpression(new ColumnExpression('booking_container', 'containerNo'), false),
                  // new RegexpExpression(new ColumnExpression('booking_container', 'soNo'), false),
                  new RegexpExpression(new ColumnExpression('booking_container', 'sealNo'), false),
                ]
              })
            })
          ),
          new InExpression(
            new ColumnExpression('booking', 'id'),
            false,
            new Query({
              $select: [new ResultColumn('bookingId')],
              $from: new FromTable('booking_reference'),
              $where: new OrExpressions({
                expressions: [
                  new RegexpExpression(new ColumnExpression('booking_reference', 'refDescription'), false),
                ]
              })
            })
          ),

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

function addBookingCheck(query: Query) {
  if (!query.$where) {
    query.$where = new AndExpressions([])
  }
  const expr = query.$where as AndExpressions
  expr.expressions.push(
    new BinaryExpression(new ColumnExpression('sop_task', 'tableName'), '=', new Value('booking')),
    new BinaryExpression(new ColumnExpression('sop_task', 'primaryKey'), '=', new ColumnExpression('booking', 'id'))
  )
  return query
}

const shortcuts: IShortcut[] = [
  // field:isClosed
  {
    type: 'field',
    name: 'isClosed',
    expression: new IsNullExpression(new ColumnExpression('booking', 'sopScore'), true),
    registered: true
  },

  // field:noOfTasks
  {
    type: 'field',
    name: 'noOfTasks',
    queryArg: () => params => ({
      $select: new ResultColumn(
        new QueryExpression(
          addBookingCheck(sopQuery.apply({
            fields: ['count'],
            subqueries: {
              ...passSubquery(params, 'sop_user', 'user'),
              ...passSubquery(params, 'sop_partyGroupCode', 'partyGroupCode'),
              ...passSubquery(params, 'sop_team', 'team'),
              ...passSubquery(params, 'sop_today', 'today'),
              ...passSubquery(params, 'sop_date', 'date'),
              ...passSubquery(params, 'notDone'),
              ...passSubquery(params, 'notDeleted')
            }
          }))
        ),
        'noOfTasks'
      )
    })
  },

  // field:sopScore (0-100)
  {
    type: 'field',
    name: 'sopScore',
    expression: re => IfExpression(
      re['isClosed'],
      new ColumnExpression('booking', 'sopScore'),
      new FunctionExpression('GREATEST', new Value(0), new MathExpression(new Value(100), '-', IfNullExpression(
        new QueryExpression(
          addBookingCheck(sopQuery.apply({
            fields: ['deduct'],
            subqueries: { notDeleted: true }
          }))
        ),
        new Value(0)
      )))
    ),
    registered: true
  },

  // field:hasDueTasks
  {
    type: 'field',
    name: 'hasDueTasks',
    expression: new ExistsExpression(
      addBookingCheck(
        sopQuery.apply({
          fields: ['deduct'],
          subqueries: {
            notDeleted: true,
            notDone: true,
            isDue: true
          }
        })
      ),
      false
    ),
    registered: true
  },

  // field:hasDeadTasks
  {
    type: 'field',
    name: 'hasDeadTasks',
    expression: new ExistsExpression(
      addBookingCheck(
        sopQuery.apply({
          fields: ['deduct'],
          subqueries: {
            notDeleted: true,
            notDone: true,
            isDead: true
          }
        })
      ),
      false
    ),
    registered: true
  },

  // subquery:notClosed
  {
    type: 'subquery',
    name: 'notClosed',
    expression: re => new BinaryExpression(re['isClosed'], '<>', new Value(1))
  },

  // subquery:sopScore
  {
    type: 'subquery',
    name: 'sopScore',
    expression: re => new AndExpressions([
      new BinaryExpression(new Unknown(), '<', re['sopScore']),
      new BinaryExpression(re['sopScore'], '<', new Unknown())
    ]),
    unknowns: { fromTo: true }
  },

  // subquery:pic
  {
    type: 'subquery',
    name: 'pic',
    expression: new BinaryExpression(new ColumnExpression('booking', 'picEmail'), '=', new Unknown()),
    unknowns: true
  },

  // subquery:team
  {
    type: 'subquery',
    name: 'team',
    expression: new InExpression(new ColumnExpression('booking', 'team'), false, new Unknown()),
    unknowns: true
  },

  // subquery:myTasksOnly
  {
    type: 'subquery',
    name: 'myTasksOnly',
    subqueryArg: () => (value, params) => ({
      $where: new ExistsExpression(addBookingCheck(
        sopQuery.apply({
          distinct: true,
          fields: ['id'],
          subqueries: {
            ...passSubquery(params, 'sop_user', 'user'),
            ...passSubquery(params, 'sop_partyGroupCode', 'partyGroupCode'),
            ...passSubquery(params, 'sop_team', 'team'),
            ...passSubquery(params, 'sop_today', 'today'),
            ...passSubquery(params, 'sop_date', 'date'),
            ...passSubquery(params, 'notDone'),
            ...passSubquery(params, 'notDeleted'),
            notSubTask: true
          }
        })
      ), false)
    })
  },

  // subquery:hasDueTasks
  {
    type: 'subquery',
    name: 'hasDueTasks',
    expression: re => new BinaryExpression(re['hasDueTasks'], '=', new Value(1))
  },

  // subquery:noDueTasks
  {
    type: 'subquery',
    name: 'noDueTasks',
    expression: re => new BinaryExpression(re['hasDueTasks'], '=', new Value(0))
  },

  // subquery:hasDeadTasks
  {
    type: 'subquery',
    name: 'hasDeadTasks',
    expression: re => new BinaryExpression(re['hasDeadTasks'], '=', new Value(1))
  },

  // subquery:noDeadTasks
  {
    type: 'subquery',
    name: 'noDeadTasks',
    expression: re => new BinaryExpression(re['hasDeadTasks'], '=', new Value(0))
  }
]

export default query.useShortcuts(shortcuts)
