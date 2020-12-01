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
  OrderBy,
  Expression,
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

const baseTableName='chatroom'

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

query.table('person',(params:IQueryParams)=>{
  const user=params.constants.user
   return   new Query({
     $from : new FromTable({
       table : 'person',
       joinClauses : [
         {
           operator: 'LEFT',
           table: new FromTable({
             table: new Query({
               $select: [
                 new ResultColumn(new ColumnExpression('person', 'photoURL')),
    
 
 
 
                    ],
                    $from: [new FromTable('person', 'person')],
                    $where:[ new AndExpressions({
                 expressions: [
                   new IsNullExpression(new ColumnExpression('person', 'deletedAt'), false),
                   new IsNullExpression(new ColumnExpression('person', 'deletedBy'), false),
                   new BinaryExpression(new ColumnExpression('person','id'),'=',user.id), 
 
                 ]
               }),
             ], 
             }),
             $as: 'person'
           }),
           $on: new BinaryExpression(new ColumnExpression('chatroom', 'userName'), '=', user.username)
         }
       ]
     })
   }) 
 })
 
  
query.table('chat',(params:IQueryParams)=>{
 const user=params.constants.user
  return   new Query({
    $from : new FromTable({
      table : baseTableName,
      joinClauses : [
        {
          operator: 'LEFT',
          table: new FromTable({
            table: new Query({
              $select: [
                new ResultColumn(new ColumnExpression('chat', '*')),
                new ResultColumn(new FunctionExpression('max',new ColumnExpression('chat', 'id')),'lastMessageIndex'),
                new ResultColumn(new FunctionExpression('max',new ColumnExpression('chat', 'messageWithoutTag')),'lastMessage'),
                new ResultColumn(new FunctionExpression('max',new ColumnExpression('chat', 'createdAt')),'createdAtLast'),
                new ResultColumn(new FunctionExpression('max',new ColumnExpression('chat', 'createdBy')),'createdByLast'),



                   ],
                   $from: [new FromTable('chat', 'chat'),new FromTable('chatroom', 'chatroom')],
                   $where:[ new AndExpressions({
                expressions: [
                  new IsNullExpression(new ColumnExpression('chat', 'deletedAt'), false),
                  new IsNullExpression(new ColumnExpression('chat', 'deletedBy'), false),
                  new BinaryExpression(new ColumnExpression('chatroom','userName'),'=',user.username),
                  new BinaryExpression(new ColumnExpression('chat','chatroomId'),'=',new ColumnExpression('chatroom','id')),


                ]
              }),
            ], 
            $group:new GroupBy(new ColumnExpression('chat','chatroomId')),
            $order:new OrderBy(new ColumnExpression('chat','id'), 'DESC'),
            }),
            $as: 'chat'
          }),
          $on: new BinaryExpression(new ColumnExpression('chat', 'chatroomId'), '=', new ColumnExpression('chatroom', 'id'))
        }
      ]
    })
  }) 
})

query.table('booking', new Query({
  $from : new FromTable({
    table : baseTableName,
    joinClauses : [
      {
        operator: 'LEFT',
        table: new FromTable({
          table: new Query({
            $select: [
              new ResultColumn(new ColumnExpression('booking', '*')),
            ],
            $from: new FromTable('booking', 'booking'),
            $where: new AndExpressions({
              expressions: [
                new IsNullExpression(new ColumnExpression('booking', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('booking', 'deletedBy'), false),
              ]
            }),
          }),
          $as: 'booking'
        }),
        $on: new BinaryExpression(new ColumnExpression('chatroom', 'roomKey'), '=', new ColumnExpression('booking', 'id'))
      }
    ]
  })

}))

query.table('shipment', new Query({
  $from : new FromTable({
    table : baseTableName,
    joinClauses : [
      {
        operator: 'LEFT',
        table: new FromTable({
          table: new Query({
            $select: [
              new ResultColumn(new ColumnExpression('shipment', '*')),
            ],
            $from: new FromTable('shipment', 'shipment'),
            $where: new AndExpressions({
              expressions: [
                new IsNullExpression(new ColumnExpression('shipment', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('shipment', 'deletedBy'), false),
              ]
            }),
          }),
          $as: 'shipment'
        }),
        $on: new BinaryExpression(new ColumnExpression('chatroom', 'roomKey'), '=', new ColumnExpression('shipment', 'id'))
      }
    ]
  })

}))


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
    name:'lastMessageIndex',
    expression: new ColumnExpression('chat','lastMessageIndex'),
     companion:['table:chat']
  
  },
  {
    name: 'chatroomId',
    expression: new ColumnExpression('chat','chatroomId'),
  },
  {
    name:'bookingNo',
    expression: new ColumnExpression('booking','bookingNo'),
    companion:['table:booking']

  },
  {
    name:'houseNo',
    expression: new ColumnExpression('shipment','houseNo'),
    companion:['table:shipment']

  },
  {
    name:'photoURL',
    expression: new ColumnExpression('person','photoURL'),
    companion:['table:person']

  }

  
] as ExpressionHelperInterface[]

registerAll(query, baseTableName, fieldList)


export default query;
