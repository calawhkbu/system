import { QueryDef } from 'classes/query/QueryDef'
import { Query, TableOrSubquery, LikeExpression, ColumnExpression, JoinedTableOrSubquery, BinaryExpression, InExpression, IsNullExpression } from 'node-jql'

const query = new QueryDef(new Query({
  $distinct: true,
  $from: new JoinedTableOrSubquery({
    table: 'party',
    $as: 'pa',
    joinClauses: [
      {
        operator: 'LEFT',
        tableOrSubquery: new TableOrSubquery(['parties_person', 'pp']),
        $on: [
          new BinaryExpression({ left: new ColumnExpression(['pa', 'id']), operator: '=', right: new ColumnExpression(['pp', 'partyId']) }),
          new IsNullExpression({ left: new ColumnExpression(['pp', 'deletedAt']) }),
          new IsNullExpression({ left: new ColumnExpression(['pp', 'deletedBy']) })
        ]
      },
      {
        operator: 'LEFT',
        tableOrSubquery: new TableOrSubquery(['person', 'pe']),
        $on: [
          new BinaryExpression({ left: new ColumnExpression(['pe', 'id']), operator: '=', right: new ColumnExpression(['pp', 'personId']) }),
          new IsNullExpression({ left: new ColumnExpression(['pe', 'deletedAt']) }),
          new IsNullExpression({ left: new ColumnExpression(['pe', 'deletedBy']) })
        ]
      }
    ]
  }),
}))

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

query.register('moduleTypeCodes', new Query({
  $where: new InExpression({ left: new ColumnExpression(['b', 'moduleTypeCode']) })
})).register('value', 0)

query.register('isActive', new Query({
  $where: [
    new IsNullExpression({ left: new ColumnExpression(['pa', 'deletedAt']) }),
    new IsNullExpression({ left: new ColumnExpression(['pa', 'deletedBy']) }),
  ]
}))

export default query
