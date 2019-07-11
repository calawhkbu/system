import { QueryDef } from 'classes/query/QueryDef'
import { Query, ResultColumn, TableOrSubquery, OrExpressions, LikeExpression, ColumnExpression, JoinedTableOrSubquery, BinaryExpression, InExpression, IsNullExpression } from 'node-jql'

const query = new QueryDef(new Query({
  $distinct: true,
  $select: [
    new ResultColumn({ expression: new ColumnExpression('*') }),
  ],
  $from: new JoinedTableOrSubquery({
    table: 'party',
    $as: 'pa',
    joinClauses: [
      {
        operator: 'LEFT',
        tableOrSubquery: new TableOrSubquery(['party_type', 'pt']),
        $on: [
          new BinaryExpression({
            left: new ColumnExpression(['pa', 'id']),
            operator: '=',
            right: new ColumnExpression(['pt', 'partyId'])
          })
        ]
      },
      {
        operator: 'LEFT',
        tableOrSubquery: new TableOrSubquery(['parties_person', 'pp']),
        $on: [
          new BinaryExpression({ left: new ColumnExpression(['pa', 'id']),
          operator: '=',
          right: new ColumnExpression(['pp', 'partyId']) }),
        ]
      },
      {
        operator: 'LEFT',
        tableOrSubquery: new TableOrSubquery(['person', 'pe']),
        $on: [
          new BinaryExpression({
            left: new ColumnExpression(['pe', 'id']),
            operator: '=',
            right: new ColumnExpression(['pp', 'personId']),
          }),
        ]
      }
    ]
  }),
}))

query.register('id', new Query({
  $where: new BinaryExpression({ left: new ColumnExpression(['pa', 'id']), operator: '=' })
})).register('value', 0)

query.register('isBranch', new Query({
  $where: new BinaryExpression({ left: new ColumnExpression(['pa', 'isBranch']), operator: '=' })
})).register('value', 0)

query.register('name', new Query({
  $where: new LikeExpression({ left: new ColumnExpression(['pa', 'name']), operator: 'REGEXP' })
})).register('value', 0)

query.register('customCode', new Query({
  $where: new LikeExpression({ left: new ColumnExpression(['pa', 'erpCode']), operator: 'REGEXP' })
})).register('value', 0)

query.register('shortName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression(['pa', 'shortName']), operator: 'REGEXP' })
})).register('value', 0)

query.register('groupName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression(['pa', 'groupName']), operator: 'REGEXP' })
})).register('value', 0)

query.register('email', new Query({
  $where: new LikeExpression({ left: new ColumnExpression(['pa', 'email']), operator: 'REGEXP' })
})).register('value', 0)

query.register('isActive', new Query({
  $where: [
    new IsNullExpression({ left: new ColumnExpression(['pa', 'deletedAt']) }),
    new IsNullExpression({ left: new ColumnExpression(['pa', 'deletedBy']) }),
  ]
}))

query.register('partyTypes', new Query({
  $where: new InExpression({ left: new ColumnExpression(['pt', 'type']) })
})).register('value', 0)

export default query
