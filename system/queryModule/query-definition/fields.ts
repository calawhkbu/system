import { QueryDef } from 'classes/query/QueryDef'
import { IQueryParams } from 'classes/query'
import {
  Query,ColumnExpression,
  FunctionExpression,
  BinaryExpression,
  Value,
 AndExpressions,
 FromTable,
 OrExpressions,
 ResultColumn,
 Unknown,
 IQuery,
 InsertJQL
} from 'node-jql'
import { RegisterInterface, registerAll } from 'utils/jql-subqueries';
const q=`
INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA='swivel360_ken'
AND
TABLE_NAME='booking'
LIMIT 100
`;
 const queryDef = new QueryDef(q);
console.log(queryDef);


export default queryDef;

