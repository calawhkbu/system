import { QueryDef } from 'classes/query/QueryDef'
import { Query, TableOrSubquery, LikeExpression, ColumnExpression, JoinedTableOrSubquery, BinaryExpression } from 'node-jql'

const query = new QueryDef(new Query({
  $distinct: true,
  $from: new JoinedTableOrSubquery({
    table: 'party',
    $as: 'pa',
    joinClauses: [
      {
        operator: 'LEFT',
        tableOrSubquery: new TableOrSubquery(['parties_person', 'pp']),
        $on: new BinaryExpression({
          left: new ColumnExpression(['pa', 'id']),
          operator: '=',
          right: new ColumnExpression(['pp', 'partyId'])
        })
      },
      {
        operator: 'LEFT',
        tableOrSubquery: new TableOrSubquery(['person', 'pe']),
        $on: new BinaryExpression({
          left: new ColumnExpression(['pe', 'id']),
          operator: '=',
          right: new ColumnExpression(['pp', 'personId'])
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
      }
    ]
  }),
}))

query.register('name', new Query({
  $where: new LikeExpression({ left: new ColumnExpression(['p', 'name']) })
})).register('value', 0)

export default query
