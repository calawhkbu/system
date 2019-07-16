import { QueryDef } from 'classes/query/QueryDef'
import { Query, FromTable } from 'node-jql'

const query = new QueryDef(new Query({
  $from: new FromTable('purchase-order', 'po')
}))

export default query
