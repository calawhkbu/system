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
  ParameterExpression,
  QueryExpression,
  Value
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

query
  .register(
    'email',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('party', 'email'), false),
    })
  )
  .register('value', 0)

query.register(
  'isActive',
  new Query({
    $where: [
      new IsNullExpression(new ColumnExpression('party', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('party', 'deletedBy'), false),
    ],
  })
)

export default query
