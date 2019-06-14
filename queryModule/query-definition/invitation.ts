import { QueryDef } from 'classes/query/QueryDef'
import { Query, TableOrSubquery } from 'node-jql'

const query = new QueryDef(new Query({
  $from: new TableOrSubquery(['invitation', 'i'])
}))

export default query
