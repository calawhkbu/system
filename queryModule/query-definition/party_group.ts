import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
} from 'node-jql'

const query = new QueryDef(new Query('party_group'))

export default query
