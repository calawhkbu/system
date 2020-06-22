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
  IsNullExpression,
  AndExpressions,
  FunctionExpression,
  Unknown,
  Value,
  CaseExpression,
  ExistsExpression,
  QueryExpression,
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

      // new ResultColumn(
      //   new FunctionExpression(
      //     'JSON_UNQUOTE',
      //     new FunctionExpression(
      //       'JSON_EXTRACT',
      //       new ColumnExpression('party', 'thirdPartyCode'),
      //       '$.erp'
      //     )
      //   ),
      //   'erpCode'
      // ),

      new ResultColumn(
        new FunctionExpression(
          'JSON_UNQUOTE',
          new FunctionExpression(
            'JSON_EXTRACT',
            new ColumnExpression('party', 'thirdPartyCode'),
            '$.old360'
          )
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
      new ResultColumn(new ColumnExpression('party', 'zip'), 'partyZip'),
    ],
    $from: new FromTable(
      'party',
      {
        operator: 'LEFT',
        table: 'party_type',
        $on: new BinaryExpression(
          new ColumnExpression('party', 'id'),
          '=',
          new ColumnExpression('party_type', 'partyId')
        ),
      },
      {
        operator: 'LEFT',
        table: 'party_group',
        $on: new BinaryExpression(
          new ColumnExpression('party_group', 'code'),
          '=',
          new ColumnExpression('party', 'partyGroupCode')
        ),
      }
    ),

    $where: new BinaryExpression(new ColumnExpression('party', 'isBranch'), '=', true),
  })
)

const old360IdExpression = new FunctionExpression(
  'JSON_UNQUOTE',
  new FunctionExpression(
    'JSON_EXTRACT',
    new ColumnExpression('party', 'thirdPartyCode'),
    '$.old360'
  )
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

const baseTableName = 'party'
const fieldList = [
  'id',
  'partyGroupCode',
  'erpCode',
  {
    name: 'old360Id',
    expression: old360IdExpression
  },
  {
    name: 'activeStatus',
    expression: activeStatusExpression
  }

] as ExpressionHelperInterface[]

// removed partyTypes

registerAll(query, baseTableName, fieldList)

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

        // new RegexpExpression(
        //   new FunctionExpression(
        //     'JSON_UNQUOTE',
        //     new FunctionExpression(
        //       'JSON_EXTRACT',
        //       new ColumnExpression('party', 'thirdPartyCode'),
        //       '$.erp'
        //     )
        //   ),
        //   false,
        //   new Unknown('string')
        // ),
      ]),
    })
  )
  .register('value', 0)
  .register('value', 1)
  .register('value', 2)

export default query
