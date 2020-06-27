import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
  FromTable,
  ColumnExpression,
  BinaryExpression,
  IsNullExpression,
  AndExpressions,
  Value,
  OrExpressions,
  RegexpExpression,
  CaseExpression
} from 'node-jql'
import { registerAll } from 'utils/jql-subqueries'

const func = (tableName: string, overrideTableName: string = undefined) => ((fieldName: string) => ({
  name: `${overrideTableName || tableName}${fieldName[0].toUpperCase()}${fieldName.substring(1)}`,
  expression: new ColumnExpression(tableName, fieldName)
}))

const CONSTANTS = {
  tableName: 'related_party',
  baseFields: [
    'partyAId',
    'partyBId',
    'partyType',
  ],
  extraFields: () => {
    const fieldNames = ['name', 'shortName', 'groupName', 'erpCode']
    return [
      {
        name : 'showDelete',
        expression : new Value(1)
      },
      ...fieldNames.map(func('party', 'partyA')),
      ...fieldNames.map(func('partyB')),
    ]
  }
}

const query = new QueryDef(new Query({
  $from: new FromTable(
    'related_party',
    {
      operator: 'LEFT',
      table: new FromTable('party', 'party'),
      $on: new AndExpressions([
        new IsNullExpression(new ColumnExpression('party', 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression('party', 'deletedBy'), false),
        new BinaryExpression(
          new ColumnExpression('related_party', 'partyAId'),
          '=',
          new ColumnExpression('party', 'id'),
        )
      ])
    },
    {
      operator: 'LEFT',
      table: new FromTable('party', 'partyB'),
      $on: new AndExpressions([
        new IsNullExpression(new ColumnExpression('partyB', 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression('partyB', 'deletedBy'), false),
        new BinaryExpression(
          new ColumnExpression('related_party', 'partyBId'),
          '=',
          new ColumnExpression('partyB', 'id'),
        )
      ])
    }
  )
}))

const isActiveConditionExpression = new AndExpressions([
  new IsNullExpression(new ColumnExpression('related_party', 'deletedAt'), false),
  new IsNullExpression(new ColumnExpression('related_party', 'deletedBy'), false)
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

registerAll(
  query,
  CONSTANTS.tableName,
  [
    ...CONSTANTS.baseFields,
    ...CONSTANTS.extraFields(),
    {
      name : 'activeStatus',
      expression : activeStatusExpression
    }
  ]
)

query
  .register(
    'q',
    new Query({
      $where: new OrExpressions({
        expressions: [

          new RegexpExpression(new ColumnExpression('partyB', 'name'), false),
          new RegexpExpression(new ColumnExpression('partyB', 'shortName'), false),
          new RegexpExpression(new ColumnExpression('partyB', 'groupName'), false),
        ],
      }),
    })
  )
  .register('value', 0)
  .register('value', 1)
  .register('value', 2)

export default query
