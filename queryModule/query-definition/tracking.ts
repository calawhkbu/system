import { QueryDef } from "classes/query/QueryDef";
import { BinaryExpression, ColumnExpression, FromTable, InExpression, JoinClause, Query } from 'node-jql'

const query = new QueryDef(new Query({
  $from: new FromTable('tracking', 'tracking',
    new JoinClause('LEFT', new FromTable('tracking_reference', 'tracking_reference'), new BinaryExpression(
      new ColumnExpression('tracking', 'id'), '=', new ColumnExpression('tracking_reference', 'id')
    ))
  ),
}))

query.register('masterNo', new Query({
  $where: new InExpression(new ColumnExpression('tracking_reference', 'masterNo'), false)
})).register('value', 0)

export default query