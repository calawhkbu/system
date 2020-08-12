import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
  FromTable,
  BinaryExpression,
  ColumnExpression,
  RegexpExpression,
  IsNullExpression,
  InExpression,
  ResultColumn,
  Value,
  FunctionExpression,
  AndExpressions,
  OrExpressions,
  Unknown,
  JoinClause,
  CaseExpression
} from 'node-jql'
import { registerAll } from 'utils/jql-subqueries'

const query = new QueryDef(
  new Query({
    $from: new FromTable(
      'person',
      {
        operator: 'LEFT',
        table: 'invitation',
        $on: [
          new BinaryExpression(
            new ColumnExpression('person', 'id'),
            '=',
            new ColumnExpression('invitation', 'personId')
          ),
        ],
      }
    ),
  })
)

// const partyTableExpression = new Query({

//   $select : [

//     new ResultColumn(new ColumnExpression('parties_person', 'personId'), 'personId'),
//     new ResultColumn(new ColumnExpression('party', 'isBranch'), 'isBranch'),
//     new ResultColumn(new ColumnExpression('party', 'thirdPartyCode'), 'thirdPartyCode'),
//     new ResultColumn(new ColumnExpression('party', 'name'), 'name'),
//     new ResultColumn(new ColumnExpression('party', 'shortName'), 'shortName'),
//     new ResultColumn(new ColumnExpression('party', 'groupName'), 'groupName')
//   ],

//   $from : new FromTable({

//     table : 'parties_person',
//     $as : 'parties_person',

//     joinClauses : [
//       {
//         operator : 'LEFT',
//         table : new FromTable('party'),
//         $on : new BinaryExpression(new ColumnExpression('parties_person', 'partyId'), '=', new ColumnExpression('party', 'id'))
//       },
//     ]
//   })
// })

// const partyJoinExpression = new Query({

//   $from : new FromTable('person', {

//     operator : 'LEFT',
//     table: new FromTable({

//       table: partyTableExpression,
//       $as: 'party',

//     }),

//     $on: new BinaryExpression(new ColumnExpression('invitation', 'personId'), '=', new ColumnExpression('party', 'personId'))

//   })
// })

// const personContactTableExpression = new Query({

//   $select : [
//     new ResultColumn(new ColumnExpression('person_contact', 'personId'), 'personId'),
//     new ResultColumn(new ColumnExpression('person_contact', 'contactType'), 'contactType'),
//     new ResultColumn(new ColumnExpression('person_contact', 'content'), 'content'),
//   ],
//   $from : new FromTable('person_contact')

// })

// const personContactJoinExpression = new Query({

//   $from : new FromTable('person', {

//     operator : 'LEFT',
//     table : new FromTable({

//       table: personContactTableExpression,
//       $as: 'personContact',

//     }),

//     $on : new BinaryExpression(new ColumnExpression('person', 'id'), '=', new ColumnExpression('personContact', 'personId'))
//   })
// })

// query.registerQuery('partyJoin', partyJoinExpression)

// query.registerQuery('personContactJoin', personContactJoinExpression)

const idExpression = new ColumnExpression('invitation', 'id')

const personIdExpression = new ColumnExpression('person', 'id')
const updatedAtExpression = new ColumnExpression('person', 'updatedAt')
const firstNameExpression = new ColumnExpression('person', 'firstName')
const userNameExpression = new ColumnExpression('person', 'userName')
const lastNameExpression = new ColumnExpression('person', 'lastName')
const displayNameExpression = new ColumnExpression('person', 'displayName')

const canDeleteExpression = new FunctionExpression(
  'IF',

  new InExpression(
    new FunctionExpression(
      'IF',
      new AndExpressions([
        new IsNullExpression(new ColumnExpression('invitation', 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression('invitation', 'deletedBy'), false),
      ]),

      new ColumnExpression('invitation', 'status'),
      new Value('disabled')
    ),
    false,
    ['sent', 'accepted']
  ),
  1,
  0
)

const canResendExpression = new FunctionExpression(
  'IF',
  new InExpression(
    new FunctionExpression(
      'IF',
      new AndExpressions([
        new IsNullExpression(new ColumnExpression('invitation', 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression('invitation', 'deletedBy'), false),
      ]),

      new ColumnExpression('invitation', 'status'),
      new Value('disabled')
    ),
    false,
    ['sent']
  ),
  1,
  0
)

const canRestoreExpression = new FunctionExpression(
  'IF',

  new InExpression(
    new FunctionExpression(
      'IF',
      new AndExpressions([
        new IsNullExpression(new ColumnExpression('invitation', 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression('invitation', 'deletedBy'), false),
      ]),

      new ColumnExpression('invitation', 'status'),
      new Value('disabled')
    ),
    false,
    ['disabled']
  ),
  1,
  0
)

const isActiveConditionExpression = new AndExpressions([
  new IsNullExpression(new ColumnExpression('person', 'deletedAt'), false),
  new IsNullExpression(new ColumnExpression('person', 'deletedBy'), false)
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

const invitationStatusExpression = new FunctionExpression(
  new FunctionExpression(
    'IF',
    new AndExpressions([
      new IsNullExpression(new ColumnExpression('invitation', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('invitation', 'deletedBy'), false),
    ]),

    new ColumnExpression('invitation', 'status'),
    new Value('disabled')
  )
)

const baseTableName = 'invitation'

const fieldList = [

  {
    name : 'id',
    expression : idExpression
  },
  {
    name: 'personId',
    expression: personIdExpression
  },
  {
    name : 'userName',
    expression : userNameExpression
  },
  {
    name : 'firstName',
    expression : firstNameExpression
  },
  {
    name : 'lastName',
    expression : lastNameExpression
  },

  {
    name : 'displayName',
    expression : displayNameExpression
  },
  {
    name: 'canRestore',
    expression: canRestoreExpression
  },
  {
    name: 'canResend',
    expression: canResendExpression
  },
  {
    name: 'canDelete',
    expression: canDeleteExpression
  },
  {
    name : 'activeStatus',
    expression : activeStatusExpression
  },
  {
    name: 'invitationStatus',
    expression: invitationStatusExpression
  },
  {
    name : 'updatedAt',
    expression : updatedAtExpression
  }

]

registerAll(query, baseTableName, fieldList)

// ---------------------------------

query
  .subquery(
    'nameLike',
    new Query({
      $where: new OrExpressions([
        new RegexpExpression(new ColumnExpression('person', 'firstName'), false),
        new RegexpExpression(new ColumnExpression('person', 'lastName'), false),
        new RegexpExpression(new ColumnExpression('person', 'displayName'), false)
      ])
    })
  )
  .register('value', 0)
  .register('value', 1)
  .register('value', 2)

query
  .register(
    'role',
    new Query({
      $where: new InExpression(
        new ColumnExpression('person', 'id'),
        false,
        new Query({
          $select: 'personId',
          $from: 'person_role',
          $where: [
            new BinaryExpression(
              new ColumnExpression('person', 'id'),
              '=',
              new ColumnExpression('person_role', 'personId')
            ),
            new InExpression(new ColumnExpression('roleId'), false),
          ],
        })
      ),
    })
  )
  .register('value', 0)

export default query
