import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
  ResultColumn,
  FromTable,
  OrExpressions,
  RegexpExpression,
  ColumnExpression,
  BinaryExpression,
  InExpression,
  ExistsExpression,
  IsNullExpression,
  AndExpressions,
  FunctionExpression,
  Unknown,
  Value,
  CaseExpression,
  QueryExpression,
  MathExpression,
} from 'node-jql'
import { ExpressionHelperInterface, registerAll } from 'utils/jql-subqueries'

const query = new QueryDef(
  new Query({
    $distinct: true,
    $select: [
      new ResultColumn(new ColumnExpression('party', 'id'), 'id'),
      new ResultColumn(new ColumnExpression('party', 'name'), 'name'),
      new ResultColumn(new ColumnExpression('party', 'shortName'), 'shortName'),
      new ResultColumn(new ColumnExpression('party', 'id'), 'partyId'),
      new ResultColumn(new ColumnExpression('party', 'name'), 'partyName'),
      new ResultColumn(new ColumnExpression('party', 'erpCode'), 'erpCode'),

      new ResultColumn(
        new MathExpression(
          new ColumnExpression('party', 'thirdPartyCode'),
          '->>',
          '$.old360'
        ),
        'old360Id'
      ),

      new ResultColumn(new ColumnExpression('party', 'phone'), 'partyPhone'),
      new ResultColumn(new ColumnExpression('party', 'fax'), 'partyFax'),
      new ResultColumn(new ColumnExpression('party', 'email'), 'partyEmail'),
      new ResultColumn(new ColumnExpression('party', 'address'), 'partyAddress'),
      new ResultColumn(new ColumnExpression('party', 'cityCode'), 'partyCityCode'),
      new ResultColumn(new ColumnExpression('party', 'stateCode'), 'partyStateCode'),
      new ResultColumn(new ColumnExpression('party', 'countryCode'), 'partyCountryCode'),
      new ResultColumn(new ColumnExpression('party', 'zip'), 'partyZip')
    ],
    $from: new FromTable(
      'party',
      {
        operator: 'LEFT',
        table: 'party_group',
        $on: new BinaryExpression(
          new ColumnExpression('party_group', 'code'),
          '=',
          new ColumnExpression('party', 'partyGroupCode')
        ),
      },
    ),
  })
)

const old360IdExpression = new MathExpression(
  new ColumnExpression('party', 'thirdPartyCode'),
  '->>',
  '$.old360'
)

const isActiveConditionExpression = new AndExpressions([
  new IsNullExpression(new ColumnExpression('party', 'deletedAt'), false),
  new IsNullExpression(new ColumnExpression('party', 'deletedBy'), false)
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

const fullNameExpression = new ColumnExpression('party', 'name')

const displayNameExpression = new FunctionExpression(
  'IFNULL',
  new ColumnExpression('party', 'shortName'),
  new ColumnExpression('party', 'name')
)

const baseTableName = 'party'

const fieldList = [
  'id',
  'erpCode',
  'isBranch',
  {
    name: 'partyFullName',
    expression: fullNameExpression
  },
  {
    name : 'old360Id',
    expression : old360IdExpression
  },
  {
    name : 'activeStatus',
    expression : activeStatusExpression
  },
  {
    name: 'displayName',
    expression: displayNameExpression
  }
] as ExpressionHelperInterface[]

registerAll(query, baseTableName, fieldList)

// warning removed partyTypes

// partyTypeIn and partyType is seperated as special cases

// will be true even 1 type is matched in the value list
query
  .register(
    'partyTypeIn',
    new Query({
      $where: new ExistsExpression(new QueryExpression(new Query({
        $from: 'party_type',
        $where: [
          new BinaryExpression(new ColumnExpression('party_type', 'partyId'), '=', new ColumnExpression('party', 'id')),
          new InExpression(new ColumnExpression('party_type', 'type'), false, new Unknown())
        ]
      })), false)
    })
  )
  .register('value', 0)

query
  .register(
    'partyType',
    new Query({
      $where: new ExistsExpression(new Query({
        $from: 'party_type',
        $where: [
          new BinaryExpression(new ColumnExpression('party_type', 'partyId'), '=', new ColumnExpression('party', 'id')),
          new BinaryExpression(new ColumnExpression('party_type', 'type'), '=')
        ]
      }), false)
    })
  )
  .register('value', 0)

query
  .register(
    'q',
    new Query({
      $where: new OrExpressions([
        new RegexpExpression(new ColumnExpression('party', 'name'), false, new Unknown('string')),
        new RegexpExpression(new ColumnExpression('party', 'shortName'), false, new Unknown('string')),
        new RegexpExpression(new ColumnExpression('party', 'erpCode'), false, new Unknown('string')),
      ]),
    })
  )
  .register('value', 0)
  .register('value', 1)
  .register('value', 2)

// for checking if user has po function in creating Booking in frontend
const checkBuyerConditionExpression = new CaseExpression({
  cases: [{
      $when: new QueryExpression(new Query({
        $select: new Value(1),
        $from: new FromTable('party_type', 'party_type_buyer_check'),
        $where: [
          new BinaryExpression(
            new ColumnExpression('party', 'id'),
            '=',
            new ColumnExpression('party_type_buyer_check', 'partyId')
          ),
          new BinaryExpression(
            new ColumnExpression('party_type_buyer_check', 'type'),
            '=',
            new Value('buyer')
          )
        ],
        $limit: 1
    })),
    $then: new Value(true)
  }],
  $else: new Value(false)
})

query
  .register(
    'checkBuyer',
    new Query({
      $select: new ResultColumn(
        checkBuyerConditionExpression,
        'isBuyer'
      )
    })
  )

export default query
