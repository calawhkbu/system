import { QueryDef } from 'classes/query/QueryDef'
import {
  BinaryExpression,
  ColumnExpression,
  Query,
  AndExpressions,
  IsNullExpression,
  FromTable,
  OrExpressions,
  Value,
  Unknown,
  CaseExpression,
  ResultColumn
} from 'node-jql'
import { registerAll } from 'utils/jql-subqueries'

const query = new QueryDef(new Query({
  $from: new FromTable('schedule', 'schedule', {
    operator: 'LEFT',
    table: new FromTable('code_master', 'carrier'),
    $on: [
      new BinaryExpression(
        new ColumnExpression('carrier', 'codeType'),
        '=',
        'CARRIER'
      ),
      new BinaryExpression(
        new ColumnExpression('carrier', 'code'),
        '=',
        new ColumnExpression('schedule', 'carrierCode')
      ),
    ],
  }, {
    operator: 'LEFT',
    table: new FromTable('location', 'portOfLoading'),
    $on: [
      new BinaryExpression(
        new ColumnExpression('portOfLoading', 'portCode'),
        '=',
        new ColumnExpression('schedule', 'portOfLoadingCode')
      ),
    ],
  }, {
    operator: 'LEFT',
    table: new FromTable('location', 'portOfDischarge'),
    $on: [
      new BinaryExpression(
        new ColumnExpression('portOfDischarge', 'portCode'),
        '=',
        new ColumnExpression('schedule', 'portOfDischargeCode')
      ),
    ],
  })
}))

query.register('carrier', {
  expression: new ColumnExpression('carrier', 'name'),
  $as: 'carrier',
})
query.register('portOfLoading', {
  expression: new ColumnExpression('portOfLoading', 'name'),
  $as: 'portOfLoading',
})
query.register('portOfDischarge', {
  expression: new ColumnExpression('portOfDischarge', 'name'),
  $as: 'portOfDischarge',
})

const carrierNameExpression = new ColumnExpression('carrier', 'name')
const portOfLoadingNameExpression = new ColumnExpression('portOfLoading', 'name')
const portOfDischargeNameExpression = new ColumnExpression('portOfDischarge', 'name')

const isActiveConditionExpression = new AndExpressions([
  new IsNullExpression(new ColumnExpression('schedule', 'deletedAt'), false),
  new IsNullExpression(new ColumnExpression('schedule', 'deletedBy'), false)
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

const baseTableName = ''

const fieldList = [

  {
    name: 'id',
    expression: new ColumnExpression('schedule', 'id')
  },
  'partyGroupCode',
  'carrierCode',
  'routeCode',
  {
    name : 'carrierName',
    expression : carrierNameExpression
  },
  {
    name : 'portOfLoadingName',
    expression : portOfLoadingNameExpression
  },
  {
    name : 'portOfDischargeName',
    expression : portOfDischargeNameExpression
  },
  {
    name : 'activeStatus',
    expression : activeStatusExpression
  },

]

registerAll(query, baseTableName, fieldList)

export default query
