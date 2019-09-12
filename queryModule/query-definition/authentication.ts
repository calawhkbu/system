import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
} from 'node-jql'

const query = new QueryDef(new Query('authentication'))

export default query
