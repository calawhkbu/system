import { QueryDef } from 'classes/query/QueryDef'
import {
  BinaryExpression,
  ColumnExpression,
  Query
} from 'node-jql'

const query = new QueryDef(new Query('card_access'))

query
  .register(
    'partyGroupCode',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('partyGroupCode'), '='),
    })
  )
  .register('value', 0)

export default query
