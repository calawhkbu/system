import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
  FromTable,
  RegexpExpression,
  ColumnExpression,
  InExpression,
  BinaryExpression,
  IsNullExpression,
  Unknown,
  AndExpressions,
  Value,
  FunctionExpression,
  OrExpressions,
  ExistsExpression,
  CaseExpression,
} from 'node-jql'
import { registerAll } from 'utils/jql-subqueries'

const query = new QueryDef(
  new Query({
    $from : new FromTable({
      table : 'role'
    }),

    // $where : new OrExpressions([

    //   new IsNullExpression(new ColumnExpression('role', 'partyGroupCode'), true),

    //   new AndExpressions([
    //     new IsNullExpression(new ColumnExpression('role', 'partyGroupCode'), false),
    //     new ExistsExpression(new Query({

    //       $from : new FromTable({
    //         table : 'role',
    //         $as : 'b'
    //       }),
    //       $where : [
    //         new BinaryExpression(new ColumnExpression('b', 'roleGroup'), '=', new ColumnExpression('role', 'roleGroup')),
    //         new BinaryExpression(new ColumnExpression('b', 'roleName'), '=', new ColumnExpression('role', 'roleName')),
    //         new IsNullExpression(new ColumnExpression('b', 'partyGroupCode'), true)
    //       ]

    //     }), true)

    //   ])
    // ])

  })
)

const canResetDefaultExpression = new FunctionExpression(
  'IF',
  new IsNullExpression(new ColumnExpression('role', 'partyGroupCode'), true),
  1, 0
)

const isActiveConditionExpression = new AndExpressions([
  new IsNullExpression(new ColumnExpression('role', 'deletedAt'), false),
  new IsNullExpression(new ColumnExpression('role', 'deletedBy'), false)
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

const baseTableName = 'role'

const fieldList = [

  'id',
  'partyGroupCode',
  'roleName',
  'roleGroup',
  'shareable',
  'hidden',
  'canMultiSelect',
  {
    name : 'canResetDefault',
    expression : canResetDefaultExpression
  },
  {
    name : 'activeStatus',
    expression : activeStatusExpression
  }

]

registerAll(query, baseTableName, fieldList)

// ----------------- filter stuff

// query
//   .register(
//     'name',
//     new Query({
//       $where: new RegexpExpression(new ColumnExpression('role', 'roleName'), false),
//     })
//   )
//   .register('value', 0)

// query
//   .register(
//     'group',
//     new Query({
//       $where: new InExpression(new ColumnExpression('role', 'roleGroup'), null),
//     })
//   )
//   .register('value', 0)

query.register(
  'q',
  new Query({
    $where: new OrExpressions([
      new RegexpExpression(new ColumnExpression('role', 'roleName'), false),
    ])
  })
)
  .register('value', 0)

export default query
