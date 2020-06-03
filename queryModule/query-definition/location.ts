import { QueryDef } from 'classes/query/QueryDef'
import {
  BinaryExpression,
  ColumnExpression,
  InExpression,
  Query,
  OrExpressions,
  RegexpExpression,
  FunctionExpression,
  AndExpressions,
  IsNullExpression,
  Value,
  Unknown,
  FromTable,
  CaseExpression,
} from 'node-jql'
import { registerAll, ExpressionHelperInterface } from 'utils/jql-subqueries'

const query = new QueryDef(new Query('location'))

// ------------- fields stuff

const canDeleteExpression = new FunctionExpression(
  'IF',
  new AndExpressions([
    new IsNullExpression(new ColumnExpression('location', 'deletedAt'), false),
    new IsNullExpression(new ColumnExpression('location', 'deletedBy'), false),
  ]),
  1, 0
)

const canRestoreExpression = new FunctionExpression(
  'IF',
  new AndExpressions([
    new IsNullExpression(new ColumnExpression('location', 'deletedAt'), true),
    new IsNullExpression(new ColumnExpression('location', 'deletedBy'), true),
  ]),
  1, 0
)

const isActiveConditionExpression = new AndExpressions([
  new IsNullExpression(new ColumnExpression('location', 'deletedAt'), false),
  new IsNullExpression(new ColumnExpression('location', 'deletedBy'), false)
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

const baseTableName = 'location'

const fieldList = [
  'id',
  'moduleTypeCode',
  'portCode',
  {
    name: 'name',
    expression: new ColumnExpression('location', 'name')
  },
  'countryCode',
  {
    name : 'canDelete',
    expression : canDeleteExpression
  },
  {
    name : 'canRestore',
    expression : canRestoreExpression
  },
  {
    name: 'activeStatus',
    expression: activeStatusExpression
  }

] as ExpressionHelperInterface[]

registerAll(query, baseTableName, fieldList)

// warning portCodes and ports are deleted

// -----------------------------------

query
  .register(
    'q',
    new Query({
      $where: new OrExpressions({
        expressions: [
          new RegexpExpression(new ColumnExpression('location', 'portCode'), false),
          new RegexpExpression(new ColumnExpression('location', 'name'), false),
        ],
      }),
    })
  )
  .register('value', 0)
  .register('value', 1)

query.table('party', new Query({
  $from: new FromTable({
    table: 'location',
    joinClauses: [
      {
        operator: 'LEFT',
        table: new FromTable({
          table: 'location_party'
        }),
        $on: new BinaryExpression(
          new ColumnExpression('location', 'id'),
          '=',
          new ColumnExpression('location_party', 'locationId')
        )
      },
      {
        operator: 'LEFT',
        table: new FromTable({
          table: 'party'
        }),
        $on: new BinaryExpression(
          new ColumnExpression('party', 'id'),
          '=',
          new ColumnExpression('location_party', 'partyId')
        )
      }
    ]
  })
}))

query.registerBoth('partyId', new ColumnExpression('party', 'id'), 'table:party')
query.registerBoth('partyName', new ColumnExpression('party', 'name'), 'table:party')
query.registerBoth('partyErpCode', new ColumnExpression('party', 'erpCode'), 'table:party')
query.registerBoth('partyPhone', new ColumnExpression('party', 'phone'), 'table:party')
query.registerBoth('partyFax', new ColumnExpression('party', 'fax'), 'table:party')
query.registerBoth('partyEmail', new ColumnExpression('party', 'email'), 'table:party')
query.registerBoth('partyAddress', new ColumnExpression('party', 'address'), 'table:party')
query.registerBoth('partyCityCode', new ColumnExpression('party', 'cityCode'), 'table:party')
query.registerBoth('partyStateCode', new ColumnExpression('party', 'stateCode'), 'table:party')
query.registerBoth('partyCountryCode', new ColumnExpression('party', 'countryCode'), 'table:party')
query.registerBoth('partyZip', new ColumnExpression('party', 'zip'), 'table:party')

export default query
