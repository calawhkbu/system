import { QueryDef } from 'classes/query/QueryDef'
import { Query, TableOrSubquery, JoinedTableOrSubquery, BinaryExpression, ColumnExpression, InExpression, LikeExpression, IsNullExpression } from 'node-jql'

const query = new QueryDef(new Query({
  $distinct: true,
  $from: new JoinedTableOrSubquery({
    table: 'invitation',
    $as: 'i',
    joinClauses: [
      {
        operator: 'LEFT',
        tableOrSubquery: new TableOrSubquery(['person', 'p']),
        $on: [
          new BinaryExpression({ left: new ColumnExpression(['p', 'id']), operator: '=', right: new ColumnExpression(['i', 'personId']) }),
          new IsNullExpression({ left: new ColumnExpression(['p', 'deletedAt']) }),
          new IsNullExpression({ left: new ColumnExpression(['p', 'deletedBy']) })
        ]
      },
      {
        operator: 'LEFT',
        tableOrSubquery: new TableOrSubquery(['token', 't']),
        $on: [
          new BinaryExpression({ left: new ColumnExpression(['t', 'id']), operator: '=', right: new ColumnExpression(['i', 'tokenId']) }),
          new IsNullExpression({ left: new ColumnExpression(['t', 'deletedAt']) }),
          new IsNullExpression({ left: new ColumnExpression(['t', 'deletedBy']) })
        ]
      }
    ]
  }),
}))

query.register('status', new Query({
  $where: new BinaryExpression({ left: new ColumnExpression(['i', 'status']), operator: '=' })
})).register('value', 0)

query.register('statuses', new Query({
  $where: new InExpression({ left: new ColumnExpression(['i', 'status']) })
})).register('value', 0)

query.register('userName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression(['p', 'userName']), operator: 'REGEXP' })
})).register('value', 0)

query.register('firstName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression(['p', 'firstName']), operator: 'REGEXP' })
})).register('value', 0)

query.register('lastName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression(['p', 'lastName']), operator: 'REGEXP' })
})).register('value', 0)

query.register('displayName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression(['p', 'displayName']), operator: 'REGEXP' })
})).register('value', 0)

query.register('isActive', new Query({
  $where: [
    new IsNullExpression({ left: new ColumnExpression(['i', 'deletedAt']) }),
    new IsNullExpression({ left: new ColumnExpression(['i', 'deletedBy']) }),
  ]
}))

export default query
