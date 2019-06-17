import { QueryDef } from 'classes/query/QueryDef'
import { Query, TableOrSubquery } from 'node-jql'

const query = new QueryDef(new Query({
  $from: new TableOrSubquery(['party', 'p'])
}))

export default query
