import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
  ResultColumn,
  FromTable,
  RegexpExpression,
  ColumnExpression,
  BinaryExpression,
  IsNullExpression,
  FunctionExpression,
  ExistsExpression,
  ParameterExpression,
  QueryExpression,
  OrExpressions,
  Value,
  Unknown,
  GroupBy,
  AndExpressions,
  CaseExpression
} from 'node-jql'

const query = new QueryDef(
  new Query({
    $select: [
      new ResultColumn(new ColumnExpression('party', '*')),
      new ResultColumn(new ColumnExpression('partyTypes')),
    ],
    $from: new FromTable('party', {
      operator: 'LEFT',
      table: new FromTable(
        new Query({
          $select: [
            new ResultColumn('partyId'),
            new ResultColumn(new FunctionExpression('GROUP_CONCAT', new ParameterExpression('DISTINCT', new ColumnExpression('party_type', 'type'), 'SEPARATOR \', \'')), 'partyTypes'),
          ],
          $from: 'party_type',
          $group: 'partyId',
        }),
        'party_type_concat'
      ),
      $on: new BinaryExpression(
        new ColumnExpression('party', 'id'),
        '=',
        new ColumnExpression('party_type_concat', 'partyId')
      ),
    }, {
      operator: 'LEFT',
      table: 'party_type',
      $on: new BinaryExpression(
        new ColumnExpression('party', 'id'),
        '=',
        new ColumnExpression('party_type', 'partyId')
      ),
    })
  })
)

const partyTypesExpression = new ColumnExpression('party_type_concat', 'id')

const contactsExpression = new QueryExpression(
  new Query({
    $select: [
      new ResultColumn(new FunctionExpression('COUNT', new ParameterExpression('DISTINCT', new ColumnExpression('related_person', 'email'))))
    ],
    $from: 'related_person',
    $where: [
      new BinaryExpression(
        new ColumnExpression('party', 'id'),
        '=',
        new ColumnExpression('related_person', 'partyId')
      ),
    ]
  })
)

const partiesExpression = new QueryExpression(
  new Query({
    $select: [
      new ResultColumn(new FunctionExpression('COUNT', new ParameterExpression('DISTINCT', new ColumnExpression('related_party', 'partyBId'))))
    ],
    $from: 'related_party',
    $where: [
      new BinaryExpression(
        new ColumnExpression('party', 'id'),
        '=',
        new ColumnExpression('related_party', 'partyAId')
      ),
    ]
  })
)

const showInfoExpression = new Value(1)

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

const fields = [
  'id',
  'erpCode',
  'name',
  'shortName',
  'groupName',
  {
    name : 'showInfo',
    expression : showInfoExpression,
  },
  {
    name : 'activeStatus',
    expression : activeStatusExpression
  },
  {
    name : 'partyTypes',
    expression : partyTypesExpression
  },

  {
    name : 'parties',
    expression : partiesExpression
  },

  {
    name : 'contacts',
    expression : contactsExpression
  },
]

// name => nameLike

// query.register('partyTypes', {
//   expression: new ColumnExpression('party_type_concat', 'id'),
//   $as: 'partyTypes',
// })

// query.register('parties', {
//   expression: new QueryExpression(
//     new Query({
//       $select: [
//         new ResultColumn(new FunctionExpression('COUNT', new ParameterExpression('DISTINCT', new ColumnExpression('related_party', 'partyBId'))))
//       ],
//       $from: 'related_party',
//       $where: [
//         new BinaryExpression(
//           new ColumnExpression('party', 'id'),
//           '=',
//           new ColumnExpression('related_party', 'partyAId')
//         ),
//       ]
//     })
//   ),
//   $as: 'parties',
// })

// query.register('contacts', {
//   expression: new QueryExpression(
//     new Query({
//       $select: [
//         new ResultColumn(new FunctionExpression('COUNT', new ParameterExpression('DISTINCT', new ColumnExpression('related_person', 'email'))))
//       ],
//       $from: 'related_person',
//       $where: [
//         new BinaryExpression(
//           new ColumnExpression('party', 'id'),
//           '=',
//           new ColumnExpression('related_person', 'partyId')
//         ),
//       ]
//     })
//   ),
//   $as: 'contacts',
// })

// query
//   .register(
//     'name',
//     new Query({
//       $where: new RegexpExpression(new ColumnExpression('party', 'name'), false),
//     })
//   )
//   .register('value', 0)

// query
//   .register(
//     'customCode',
//     new Query({
//       $where: new RegexpExpression(new ColumnExpression('party', 'erpCode'), false),
//     })
//   )
//   .register('value', 0)

// query
//   .register(
//     'shortName',
//     new Query({
//       $where: new RegexpExpression(new ColumnExpression('party', 'shortName'), false),
//     })
//   )
//   .register('value', 0)

// query
//   .register(
//     'groupName',
//     new Query({
//       $where: new RegexpExpression(new ColumnExpression('party', 'groupName'), false),
//     })
//   )
//   .register('value', 0)

query.register('relatedTo', new Query({
  $where: new ExistsExpression(new Query({
    $from: 'related_party',
    $where: [
      new BinaryExpression(new ColumnExpression('related_party', 'partyAId'), '=', new Unknown()),
      new BinaryExpression(new ColumnExpression('related_party', 'partyBId'), '=', new ColumnExpression('party', 'id'))
    ]
  }), false)
}))
  .register('value', 0)

query.register('unrelatedTo', new Query({
  $where: new ExistsExpression(new Query({
    $from: 'related_party',
    $where: [
      new BinaryExpression(new ColumnExpression('related_party', 'partyAId'), '=', new Unknown()),
      new BinaryExpression(new ColumnExpression('related_party', 'partyBId'), '=', new ColumnExpression('party', 'id'))
    ]
  }), true)
}))
  .register('value', 0)

query.register('q', new Query({
  $where: new OrExpressions([
    new RegexpExpression(new ColumnExpression('party', 'name'), false),
    new RegexpExpression(new ColumnExpression('party', 'shortName'), false),
    new RegexpExpression(new ColumnExpression('party', 'groupName'), false),
  ])
}))
  .register('value', 0)
  .register('value', 1)
  .register('value', 2)
  .register('value', 3)
  .register('value', 4)

query.register('type', new Query({
  $where: new ExistsExpression(new Query({
    $from: 'related_party',
    $where: [
      new BinaryExpression(new ColumnExpression('related_party', 'type'), '=', new Unknown())
    ]
  }), true)
}))
  .register('value', 0)

export default query
