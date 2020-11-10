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
import { IShortcut } from 'classes/query/Shortcut'

const partyList = [
  {
    name: 'shipper',
  },
  {
    name: 'shipTo',
  },
  {
    name: 'factory'
  },
  {
    name: 'buyer',
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

const locationList = ['portOfLoading', 'portOfDischarge']



// const purchaseOrderItemsExpression = new QueryExpression(new Query({
//   $select : [

//   ]
// }))

const moduleTypeExpression = new FunctionExpression(
  'IFNULL',
  new ColumnExpression('moduleType', 'name'),
  new ColumnExpression('purchase_order', 'moduleTypeCode')
)

const incoTermsExpression = new FunctionExpression(
  'IFNULL',
  new ColumnExpression('incoTerms', 'name'),
  new ColumnExpression('purchase_order', 'incoTermsCode')
)

const freightTermsExpression = new FunctionExpression(
  'IFNULL',
  new ColumnExpression('freightTerms', 'name'),
  new ColumnExpression('purchase_order', 'freightTermsCode')
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

  const partyIdExpression = party.partyIdExpression || { expression: new ColumnExpression('purchase_order_party', `${partyTableName}PartyId`), companion: ['table:purchase_order_party'] }
  const partyNameExpression = party.partyNameExpression || { expression: new ColumnExpression('purchase_order_party', `${partyTableName}PartyName`), companion: ['table:purchase_order_party'] }
  const partyCodeExpression = party.partyCodeExpression || { expression: new ColumnExpression('purchase_order_party', `${partyTableName}PartyCode`), companion: ['table:purchase_order_party'] }
  const partyNameInReportExpression = party.partyNameInReportExpression || { expression: new ColumnExpression(party.name, `name`), companion: [`table:${party.name}`] }
  const partyShortNameInReportExpression = party.partyShortNameInReportExpression || { expression: new FunctionExpression('IFNULL', new ColumnExpression(party.name, `shortName`), partyNameInReportExpression.expression), companion: [`table:${party.name}`] }

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

      // PartyReportName will get from party join instead of purchase_order_party direct;y
      case 'PartyNameInReport':
        finalExpressionInfo = partyNameInReportExpression
        break

      case 'PartyShortNameInReport':
        finalExpressionInfo = partyShortNameInReportExpression
        break

      default:
        finalExpressionInfo = { expression: new ColumnExpression('purchase_order_party', fieldName) as IExpression, companion: ['table:purchase_order_party'] }
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
    expression: new ColumnExpression('purchase_order', `${location}Code`),
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

const query = new QueryDef(
  new Query({
    $select: [
      new ResultColumn(new ColumnExpression('purchase_order', "*")),
      new ResultColumn(new ColumnExpression('purchase_order', 'id'), 'purchaseOrderId'),
    ],
    $from: new FromTable(
      'purchase_order'
    ),
  })
)


query.table('purchase_order_item', new Query({

  $from : new FromTable({

    table : 'purchase_order',
    joinClauses : [
      {
        operator: 'LEFT',
        table: new FromTable({
          table: new Query({
            $select: [
            new ResultColumn(new ColumnExpression('purchase_order_item', '*')),
             //new ResultColumn( new FunctionExpression('SUM',new ColumnExpression('purchase_order_item','quantity')),'qty')


            ],
            $from: new FromTable('purchase_order_item', 'purchase_order_item'),
            $where: new AndExpressions({
              expressions: [
                new IsNullExpression(new ColumnExpression('purchase_order_item', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('purchase_order_item', 'deletedBy'), false),
                new IsNullExpression(new ColumnExpression('purchase_order_item','poId'),true)

              ]
            }),
            //$group: new GroupBy([new ColumnExpression('purchase_order_item', 'poId')]),

          }),
          $as: 'purchase_order_item'
        }),
        $on: new BinaryExpression(new ColumnExpression('purchase_order', 'id'), '=', new ColumnExpression('purchase_order_item', 'poId'))

      },
    ]
  })

}))


query.table('purchase_order_party', new Query({

  $from : new FromTable({

    table : 'purchase_order_party',
    joinClauses : [
      {
        operator: 'LEFT',
        table: new FromTable({
          table: new Query({
            $select: [
              new ResultColumn(new ColumnExpression('purchase_order_party', '*')),
            ],
            $from: new FromTable('purchase_order_party', 'purchase_order_party'),
            $where: new AndExpressions({
              expressions: [
                new IsNullExpression(new ColumnExpression('purchase_order_party', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('purchase_order_party', 'deletedBy'), false),
              ]
            }),
          }),
          $as: 'purchase_order_party'
        }),
        $on: new BinaryExpression(new ColumnExpression('purchase_order', 'id'), '=', new ColumnExpression('purchase_order_party', 'poId'))
      },
    ]
  })

}))

query.table('purchaseOrderDate', new Query({
  $from: new FromTable({
    table: 'purchase_order',
    joinClauses: [
      {
        operator: 'LEFT',
        table: new FromTable({
          table: new Query({
            $select: [
              new ResultColumn(new ColumnExpression('purchase_order_date', '*'))
            ],
            $from: new FromTable('purchase_order_date', 'purchase_order_date'),
            $where: new AndExpressions({
              expressions: [
                new IsNullExpression(new ColumnExpression('purchase_order_date', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('purchase_order_date', 'deletedBy'), false),
              ]
            })
          }),
          $as: 'purchase_order_date'
        }),
        $on: new BinaryExpression(
          new ColumnExpression('purchase_order', 'id'),
          '=',
          new ColumnExpression('purchase_order_date', 'poId')
        )
      }
    ]
  })
}))

query.table('incoTerms', new Query({

  $from: new FromTable({
    table: 'purchase_order',

    joinClauses: [
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
            new ColumnExpression('purchase_order', 'incoTermsCode'),
            '=',
            new ColumnExpression('incoTerms', 'code')
          ),
        ],
      },
    ]
  })
}))

query.table('freightTerms', new Query({

  $from: new FromTable({
    table: 'purchase_order',

    joinClauses: [
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
            new ColumnExpression('purchase_order', 'freightTermsCode'),
            '=',
            new ColumnExpression('freightTerms', 'code')
          ),
        ],
      },
    ]
  })
}))

query.table('moduleType', new Query({

  $from: new FromTable({
    table: 'purchase_order',

    joinClauses: [
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
            new ColumnExpression('purchase_order', 'moduleTypeCode'),
            '=',
            new ColumnExpression('moduleType', 'code')
          ),
        ],
      },
    ]
  })
}))

locationList.map(location => {

  const joinTableName = `${location}`
  const locationCode = `${location}Code`

  // location join (e.g. portOfLoadingJoin)
  query.table(joinTableName, new Query({

    $from: new FromTable({

      table: 'purchase_order',

      joinClauses: [{

        operator: 'LEFT',
        table: new FromTable({
          table: 'location',
          $as: `${location}`
        }),
        $on: [
          new BinaryExpression(new ColumnExpression(`${location}`, 'portCode'), '=', new ColumnExpression('purchase_order', locationCode)),
        ]
      }]
    }),

    $where: new IsNullExpression(new ColumnExpression('purchase_order', locationCode), true)

  })
  )

})

partyList.map(party => {

  const partyTableName = party.name

  const companion = (party.partyIdExpression && party.partyIdExpression.companion) ? party.partyIdExpression.companion : [`table:purchase_order_party`]
  const partyIdExpression = (party.partyIdExpression && party.partyIdExpression.expression) ? party.partyIdExpression.expression : new ColumnExpression('purchase_order_party', `${partyTableName}PartyId`)

  query.table(partyTableName, new Query({

    $from: new FromTable({

      table: 'purchase_order',
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

query.register('getPoItemById',
  new Query({
    $from: new FromTable('purchase_order_item', 'purchase_order_item'),
    $where: 
        new RegexpExpression(new ColumnExpression('purchase_order_item', 'poId'), false)
  })
)
.register('value', 0)


const isActiveConditionExpression = new AndExpressions([
  new IsNullExpression(new ColumnExpression('purchase_order', 'deletedAt'), false),
  new IsNullExpression(new ColumnExpression('purchase_order', 'deletedBy'), false)
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

//  register date field
const baseTableName='purchase_order'

const createdAtExpression = new ColumnExpression(baseTableName, 'createdAt')

const updatedAtExpression = new ColumnExpression(baseTableName, 'updatedAt')

const jobDateExpression = createdAtExpression

const jobYearExpression = new FunctionExpression('LPAD', new FunctionExpression('YEAR', jobDateExpression), 4, '0')

const jobMonthExpression = new FunctionExpression('CONCAT', new FunctionExpression('YEAR', jobDateExpression),
  '-',
  new FunctionExpression('LPAD', new FunctionExpression('MONTH', jobDateExpression), 2, '0'))

const jobWeekExpression = new FunctionExpression('LPAD', new FunctionExpression('WEEK', jobDateExpression), 2, '0')

// ============

const fieldList = [
  'id',
  'poNo',
  'partyGroupCode',

  //'purchaseOrderItems',
  //'purchaseOrderDate',
  //'purchaseOrderDateUtc',
  //'purchaseOrderParty',
  // {
  //   name: 'quantity',
  //   expression: new ColumnExpression("purchase_order_item",'quantity'),
  //   companion: ['table:purchase_order_item']
  // },

  'moduleTypeCode',
  {
    name: 'moduleType',
    expression: moduleTypeExpression,
    companion: ['table:moduleType']
  },

  'incoTermsCode',
  {
    name: 'incoTerms',
    expression: incoTermsExpression,
    companion: ['table:incoTerms']
  },

  'freightTermsCode',
  {
    name: 'freightTerms',
    expression: freightTermsExpression,
    companion: ['table:freightTerms']
  },

  // 'portOfLoadingCode',
  // 'portOfLoadingName',
  // 'portOfLoading',

  // 'portOfDischargeCode',
  // 'portOfDischargeName',
  // 'portOfDischarge?',

  'remark',
  'referenceNumber',
  'edi',
  'errors',

  'createdAt',
  'updatedAt',
  {
    name: 'jobMonth',
    expression: jobMonthExpression
  },
  ...partyExpressionList,
  ...locationExpressionList,
  {
    name : 'activeStatus',
    expression : activeStatusExpression
  }

] as ExpressionHelperInterface[]

registerAll(
  query,
  baseTableName,
  fieldList
)

const summaryFieldList : SummaryField[]  = [
  {
    name: 'totalpo',
    summaryType: 'count',
    expression: new ColumnExpression(baseTableName, 'id')
  },
  {
    name: 'quantity',
    summaryType: 'sum',
    expression: new ColumnExpression('purchase_order_item', 'quantity'),
    companion: ['table:purchase_order_item']
  },
  {
    name: 'weight',
    summaryType: 'sum',
    expression: new ColumnExpression('purchase_order_item', 'weight'),
    companion: ['table:purchase_order_item']
  }

];

const nestedSummaryList = [
  //tbc


] as NestedSummaryCondition[]



registerSummaryField(query, baseTableName, summaryFieldList, [], jobDateExpression)



export default query
