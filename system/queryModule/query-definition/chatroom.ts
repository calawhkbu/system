import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
  FromTable,
  ResultColumn,
  GroupBy,
  BinaryExpression,
  BetweenExpression,
  RegexpExpression,
  ColumnExpression,
  FunctionExpression,
  ParameterExpression,
  InExpression,
  IsNullExpression,
  OrExpressions,
  AndExpressions,
  Value,
  IExpression,
  CaseExpression,
  Unknown,
  IConditionalExpression,
  ICase,
  MathExpression,
  QueryExpression,
  ExistsExpression,
} from 'node-jql'
import { IQueryParams } from 'classes/query'
import {
  convertToEndOfDate,
  convertToStartOfDate,
  addDateExpression,
  ExpressionHelperInterface,
  registerAll,
  registerSummaryField,
  NestedSummaryCondition,
  registerNestedSummaryFilter,
  SummaryField,
  registerAllDateField,
  registerCheckboxField,
  IfExpression,
  IfNullExpression,
  RegisterInterface,
} from 'utils/jql-subqueries'


const query = new QueryDef(
  new Query({

    // $distinct: true,

    $select: [
      new ResultColumn(new ColumnExpression('chatroom', '*'))
    ],
    $from: new FromTable(
      'chatroom'
    ),
  })
)

query.table('chat', new Query({
  $from : new FromTable({
    table : 'chatroom',
    joinClauses : [
      {
        operator: 'LEFT',
        table: new FromTable({
          table: new Query({
            $select: [
              new ResultColumn(new ColumnExpression('chat', '*')),
            ],
            $from: new FromTable('chat', 'chat'),
            $where: new AndExpressions({
              expressions: [
                new IsNullExpression(new ColumnExpression('chat', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('chat', 'deletedBy'), false),
              ]
            }),
          }),
          $as: 'chat'
        }),
        $on: new BinaryExpression(new ColumnExpression('chat', 'chatroomId'), '=', new ColumnExpression('chatroom', 'id'))
      }
    ]
  })

}))






const baseTableName='chatroom'
const fieldList = [
  'id',
  'chatroom',
  'tableName',
  'roomKey',
  'userName',
  'chatroomIndex',
  {
    name:'readIndex',
    expression:new ColumnExpression('chatroom','readIndex')
  },
  {
    name: 'chatroomId',
    expression: new ColumnExpression('chat','chatroomId'),
  },
  {
    name: 'message',
    expression: new ColumnExpression('chat','message'),
  },
  {

    name: 'messageWithoutTag',
    expression: new ColumnExpression('chat','messageWithoutTag'),
  },
  {
    name:'createdAt',
    expression: new ColumnExpression('chat','createdAt'),
    companion:['table:chat']

  }
  {
    name:'createdBy',
    expression: new ColumnExpression('chat','createdBy'),
    companion:['table:chat']

  }

  
] as ExpressionHelperInterface[]

registerAll(query, baseTableName, fieldList)


export default query;
