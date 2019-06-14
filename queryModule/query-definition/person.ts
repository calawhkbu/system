import { QueryDef } from 'classes/query/QueryDef'
import { Query, TableOrSubquery, JoinedTableOrSubquery, BinaryExpression, ColumnExpression, LikeExpression } from 'node-jql'

const query = new QueryDef(new Query({
  $distinct: true,
  $from: new JoinedTableOrSubquery({
    table: 'person',
    $as: 'pe',
    joinClauses: [
      {
        operator: 'LEFT',
        tableOrSubquery: new TableOrSubquery(['parties_person', 'pp']),
        $on: new BinaryExpression({
          left: new ColumnExpression(['pe', 'id']),
          operator: '=',
          right: new ColumnExpression(['pp', 'personId'])
        })
      },
      {
        operator: 'LEFT',
        tableOrSubquery: new TableOrSubquery(['party', 'pa']),
        $on: new BinaryExpression({
          left: new ColumnExpression(['pa', 'id']),
          operator: '=',
          right: new ColumnExpression(['pp', 'partyId'])
        })
      },
      {
        operator: 'LEFT',
        tableOrSubquery: new TableOrSubquery(['party_group', 'pg']),
        $on: new BinaryExpression({
          left: new ColumnExpression(['pg', 'code']),
          operator: '=',
          right: new ColumnExpression(['pa', 'partyGroupCode'])
        })
      },
      {
        operator: 'LEFT',
        tableOrSubquery: new TableOrSubquery(['person_role', 'pr']),
        $on: new BinaryExpression({
          left: new ColumnExpression(['pr', 'personId']),
          operator: '=',
          right: new ColumnExpression(['pe', 'id'])
        })
      },
      {
        operator: 'LEFT',
        tableOrSubquery: new TableOrSubquery(['role', 'r']),
        $on: new BinaryExpression({
          left: new ColumnExpression(['r', 'id']),
          operator: '=',
          right: new ColumnExpression(['pr', 'roleId'])
        })
      },
      {
        operator: 'LEFT',
        tableOrSubquery: new TableOrSubquery(['person_contact', 'pc']),
        $on: new BinaryExpression({
          left: new ColumnExpression(['pe', 'id']),
          operator: '=',
          right: new ColumnExpression(['pc', 'personId'])
        })
      }
    ]
  }),
}))

query.register('userName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression(['pe', 'userName']), operator: 'REGEXP' })
})).register('value', 0)

query.register('firstName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression(['pe', 'firstName']), operator: 'REGEXP' })
})).register('value', 0)

query.register('lastName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression(['pe', 'lastName']), operator: 'REGEXP' })
})).register('value', 0)

query.register('displayName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression(['pe', 'displayName']), operator: 'REGEXP' })
})).register('value', 0)



export default query
