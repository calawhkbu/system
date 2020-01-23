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
  AndExpressions
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
        'party_type'
      ),
      $on: new BinaryExpression(
        new ColumnExpression('party', 'id'),
        '=',
        new ColumnExpression('party_type', 'partyId')
      ),
    }, {
      operator: 'LEFT',
      table: new FromTable(new Query({
        $select: [
          new ResultColumn(new ColumnExpression('related_person', 'partyId'), 'partyId'),
          new ResultColumn({
            expression: new FunctionExpression({
              name: 'COUNT',
              parameters: new ParameterExpression({
                prefix: 'DISTINCT',
                expression: new ColumnExpression('related_person', 'email'),
              }),
            }),
            $as: 'count'
          })
        ],
        $from: 'related_person',
        $group: new GroupBy({
          expressions: new ColumnExpression('related_person', 'partyId')
        })
      }), 'related_person_count'),
      $on: new BinaryExpression(
        new ColumnExpression('party', 'id'),
        '=',
        new ColumnExpression('related_person_count', 'partyId')
      ),
    }, {
      operator: 'LEFT',
      table: new FromTable(new Query({
        $select: [
          new ResultColumn(new ColumnExpression('related_party', 'partyBId'), 'partyBId'),
          new ResultColumn({
            expression: new FunctionExpression({
              name: 'COUNT',
              parameters: new ParameterExpression({
                prefix: 'DISTINCT',
                expression: new ColumnExpression('related_party', 'partyBId'),
              }),
            }),
            $as: 'count'
          })
        ],
        $from: 'related_party',
        $group: new GroupBy({
          expressions: new ColumnExpression('related_party', 'partyBId')
        })
      }), 'related_party_count'),
      $on: new BinaryExpression(
        new ColumnExpression('party', 'id'),
        '=',
        new ColumnExpression('related_party_count', 'partyBId')
      ),
    })
  })
)

query.register('erpCode', {
  expression: new FunctionExpression(
    'JSON_UNQUOTE',
    new FunctionExpression('JSON_EXTRACT', new ColumnExpression('party', 'thirdPartyCode'), '$.erp')
  ),
  $as: 'erpCode',
})

query.register('showInfo', {
  expression: new Value(1),
  $as: 'showInfo'
})

query.register('parties', {
  expression: new QueryExpression(
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
  ),
  $as: 'parties',
})

query.register('contacts', {
  expression: new QueryExpression(
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
  ),
  $as: 'contacts',
})

query
  .register(
    'id',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('party', 'id'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'isBranch',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('party', 'isBranch'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'name',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('party', 'name'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'customCode',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('party', 'erpCode'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'shortName',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('party', 'shortName'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'groupName',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('party', 'groupName'), false),
    })
  )
  .register('value', 0)

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

  query.register('isActive', new Query({
    $where: new OrExpressions([
      new AndExpressions([
        new BinaryExpression(new Value('active'), '=', new Unknown('string')),
        // active case
        new IsNullExpression(new ColumnExpression('party', 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression('party', 'deletedBy'), false)
      ]),
      new AndExpressions([
        new BinaryExpression(new Value('deleted'), '=', new Unknown('string')),
        // deleted case
        new IsNullExpression(new ColumnExpression('party', 'deletedAt'), true),
        new IsNullExpression(new ColumnExpression('party', 'deletedBy'), true)
      ])
    ])
  })).register('value', 0).register('value', 1)

export default query
