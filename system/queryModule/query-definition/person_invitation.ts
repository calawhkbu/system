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
  CaseExpression,
  GroupBy
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
          new BinaryExpression(new ColumnExpression('person', 'id'), '=', new ColumnExpression('invitation', 'personId')),
        ],
      }
    ),
  })
)

query.table('parties_table', new Query({
  $from: new FromTable({
    table: 'person',
    joinClauses: [
      {
        operator: 'LEFT',
        table: new FromTable({
          table: new Query({
            $select: [
              new ResultColumn(new ColumnExpression('parties_person', 'personId'), 'personId'),
              new ResultColumn(new FunctionExpression('GROUP_CONCAT', new ColumnExpression('party', 'name')), 'partiesName'),
            ],
            $from: new FromTable({
              table: 'parties_person',
              $as: 'parties_person',
              joinClauses: [
                {
                  operator: 'LEFT',
                  table: new FromTable('party'),
                  $on: new BinaryExpression(new ColumnExpression('parties_person', 'partyId'), '=', new ColumnExpression('party', 'id'))
                },
              ]
            }),
            $group: new GroupBy([
              new ColumnExpression('parties_person', 'personId')
            ])
          }),
          $as: 'parties_table',
        }),
        $on: new BinaryExpression(new ColumnExpression('person', 'id'), '=', new ColumnExpression('parties_table', 'personId'))
      },
    ]
  })
}))

const isActiveConditionExpression = new AndExpressions([
  new IsNullExpression(new ColumnExpression('person', 'deletedAt'), false),
  new IsNullExpression(new ColumnExpression('person', 'deletedBy'), false)
])


const baseTableName = 'invitation'

const fieldList = [
  { name: 'id', expression: new ColumnExpression('invitation', 'id') },
  { name: 'personId', expression: new ColumnExpression('person', 'id') },
  { name: 'userName', expression: new ColumnExpression('person', 'userName') },
  { name: 'firstName', expression: new ColumnExpression('person', 'firstName') },
  { name: 'lastName', expression: new ColumnExpression('person', 'lastName') },
  { name: 'displayName', expression: new ColumnExpression('person', 'displayName') },
  {
    name: 'fullDisplayName',
    expression: new FunctionExpression(
      'IFNULL',
      new ColumnExpression('person', 'displayName'),
      new FunctionExpression(
        'CONCAT',
        new ColumnExpression('person', 'firstName'),
        ' ',
        new ColumnExpression('person', 'lastName')
      )
    )
  },
  {
    name: 'canRestore', expression: new FunctionExpression(
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
  },
  {
    name: 'canResend', expression: new FunctionExpression(
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
  },
  {
    name: 'canDelete', expression: new FunctionExpression(
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
  },
  {
    name: 'activeStatus', expression: new CaseExpression({
      cases: [
        {
          $when: new BinaryExpression(isActiveConditionExpression, '=', false),
          $then: new Value('deleted')
        }
      ],
      $else: new Value('active')
    })
  },
  {
    name: 'invitationStatus', expression: new FunctionExpression(
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
  },
  { name: 'updatedAt', expression: new ColumnExpression('person', 'updatedAt') },
  { name: 'erpCode', expression: new ColumnExpression('person', 'erpCode') },
  { name: 'partiesName', expression: new ColumnExpression('parties_table', 'partiesName'), companion: ['table:parties_table'] }
]
registerAll(query, baseTableName, fieldList)

// ---------------------------------

query
  .subquery(
    'salesmanLike',
    new Query({
      $where: new OrExpressions([
        new RegexpExpression(new ColumnExpression('person', 'erpCode'), false),
        new RegexpExpression(new ColumnExpression('person', 'firstName'), false),
        new RegexpExpression(new ColumnExpression('person', 'lastName'), false),
        new RegexpExpression(new ColumnExpression('person', 'displayName'), false)
      ])
    })
  )
  .register('value', 0)
  .register('value', 1)
  .register('value', 2)
  .register('value', 3)
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
query
  .register(
    'parties',
    new Query({
      $where: new InExpression(
        new ColumnExpression('person', 'id'),
        false,
        new Query({
          $select: 'personId',
          $from: 'parties_person',
          $where: [
            new BinaryExpression(
              new ColumnExpression('person', 'id'),
              '=',
              new ColumnExpression('parties_person', 'personId')
            ),
            new InExpression(new ColumnExpression('partyId'), false),
          ],
        })
      ),
    })
  )
  .register('value', 0)
export default query
