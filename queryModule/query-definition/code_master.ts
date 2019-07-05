import { QueryDef } from 'classes/query/QueryDef'
import { Query, JoinedTableOrSubquery, FunctionExpression, Unknown,
  TableOrSubquery, BinaryExpression, ColumnExpression, OrExpressions, LikeExpression } from 'node-jql'

const query = new QueryDef(new Query({
  $distinct: true,
  $from: new JoinedTableOrSubquery({
    table: 'code_master',
    $as: 'c',
    joinClauses: [
      {
        operator: 'LEFT',
        tableOrSubquery: new TableOrSubquery(['flex_data', 'fd']),
        $on: [
          new BinaryExpression({
            left: new ColumnExpression(['fd', 'tableName']),
            operator: '=',
            right: 'code_master'
          }),
          new BinaryExpression({
            left: new ColumnExpression(['c', 'id']),
            operator: '=',
            right: new ColumnExpression(['fd', 'primaryKey'])
          })
        ]
      }
    ]
  })
}))

query.register('codeType', new Query({
  $where: new BinaryExpression({ left: new ColumnExpression(['c', 'codeType']), operator: '=' })
}))
  .register('value', 0)

query.register('code', new Query({
  $where: new BinaryExpression({ left: new ColumnExpression(['c', 'code']), operator: '=' })
}))
  .register('value', 0)

query.register('flexDataData', new Query({
  $where: new BinaryExpression({
    left: new FunctionExpression({
      name: 'JSON_UNQUOTE',
      parameters: [
        new FunctionExpression({
          name: 'JSON_EXTRACT',
          parameters: [
            new ColumnExpression(['fd', 'data']),
            new Unknown(String)
          ]
        })
      ]
    }),
    operator: '='
  })
}))
  .register('flexDataKey', 0)
  .register('value', 1)

query.register('q', new Query({
  $where: new OrExpressions({
    expressions: [
      new LikeExpression({ left: new ColumnExpression(['c', 'code']), operator: 'REGEXP' }),
      new LikeExpression({ left: new ColumnExpression(['c', 'name']), operator: 'REGEXP' })
    ]
  })
}))
  .register('value', 0)
  .register('value', 1)

export default query
