import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
  FromTable,
  BinaryExpression,
  ColumnExpression,
  RegexpExpression,
  IsNullExpression,
  FunctionExpression,
  AndExpressions,
  Value,
  OrExpressions,
  Unknown,
  CaseExpression,
  JoinClause,
} from 'node-jql'
import { registerAll } from 'utils/jql-subqueries'

const query = new QueryDef(new Query({

  $from : new FromTable({

    table : 'template',
    joinClauses : [
      new JoinClause({

        operator : 'LEFT',
        table : 'document',
        $on : [
          new BinaryExpression(new ColumnExpression('document', 'tableName'), '=', 'template'),
          new BinaryExpression(new ColumnExpression('template', 'id'), '=', new ColumnExpression('document', 'primaryKey'))
        ]
      })
    ]
  })
}))

// -------------- field stuff

const extensionExpression = new ColumnExpression('document', 'extension')

const canDeleteExpression = new FunctionExpression(
  'IF',
  new AndExpressions([
    new IsNullExpression(new ColumnExpression('template', 'deletedAt'), false),
    new IsNullExpression(new ColumnExpression('template', 'deletedBy'), false),
  ]),
  1, 0
)

const canRestoreExpression = new FunctionExpression(
  'IF',
  new AndExpressions([
    new IsNullExpression(new ColumnExpression('template', 'deletedAt'), true),
    new IsNullExpression(new ColumnExpression('template', 'deletedBy'), true),
  ]),
  1, 0
)

const isActiveConditionExpression = new AndExpressions([
  new IsNullExpression(new ColumnExpression('template', 'deletedAt'), false),
  new IsNullExpression(new ColumnExpression('template', 'deletedBy'), false)
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

const baseTableName = 'template'

const fieldList = [
  'id',
  'partyGroupCode',
  'templateName',
  'format',
  {
    name : 'extension',
    expression : extensionExpression
  },
  {
    name: 'canDelete',
    expression: canDeleteExpression
  },
  {
    name: 'canRestore',
    expression: canRestoreExpression
  },
  {
    name: 'activeStatus',
    expression: activeStatusExpression
  }

]

registerAll(query, baseTableName, fieldList)

export default query
