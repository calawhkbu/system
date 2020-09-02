import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
  ResultColumn,
  FromTable,
  RegexpExpression,
  ColumnExpression,
  BinaryExpression,
  IsNullExpression,
  FunctionExpression,
  ExistsExpression,
  ParameterExpression,
  QueryExpression,
  OrExpressions,
  Value,
  Unknown,
  GroupBy,
  AndExpressions,
  CaseExpression
} from 'node-jql'
import { registerAll, ExpressionHelperInterface } from 'utils/jql-subqueries'

const query = new QueryDef(
  new Query({
    $select: [
      new ResultColumn(new ColumnExpression('party', '*'))
    ],
    $from: new FromTable(

      {
        table : 'party',
      }

    ),
   // $where: new BinaryExpression(new ColumnExpression('party', 'isBranch'), '=', new Value(1))
  })
)
const baseTableName = 'party'
const fieldList = [
  'id',
  'partyGroupCode',
  'thirdPartyCode',
  'erpCode',
  'name',
  'shortName',
  'groupName',
  
] as ExpressionHelperInterface[]
registerAll(query, baseTableName, fieldList)

export default query
