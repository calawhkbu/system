
import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
  FromTable,
  BinaryExpression,
  ColumnExpression,
  RegexpExpression,
  IsNullExpression,
  InExpression,
  ResultColumn,
  Unknown,
  Value,
  OrExpressions,
  AndExpressions,
  JoinClause,
  GroupBy,
  FunctionExpression
} from 'node-jql'

const baseTableName='person'

const query = new QueryDef(
  new Query({

    $select: [
      new ResultColumn(new ColumnExpression(baseTableName, 'userName')),
      new ResultColumn(new ColumnExpression(baseTableName, 'displayName')),
      new ResultColumn(new ColumnExpression(baseTableName, 'photoURL')),
      new ResultColumn(new FunctionExpression('CONCAT',new ColumnExpression(baseTableName,'firstName'), new FunctionExpression('SPACE',1),new ColumnExpression(baseTableName,'lastName')),'concatName'),
    ],
    $from: new FromTable(
      baseTableName
    ),
    
  
  })
)

query.register('search',new Query({
  $where: new BinaryExpression(new ColumnExpression(baseTableName,'userName'),'=',new Unknown()),
  $group: new GroupBy(new ColumnExpression(baseTableName,'userName'))
})).register('value',0)


export default query
