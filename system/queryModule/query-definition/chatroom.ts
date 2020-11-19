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
  registerField,
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

                   ],
                   $from: [new FromTable('chat', 'chat'),new FromTable('chatroom', 'chatroom')],
                   $where:[ new AndExpressions({
                expressions: [
                  new IsNullExpression(new ColumnExpression('chat', 'deletedAt'), false),
                  new IsNullExpression(new ColumnExpression('chat', 'deletedBy'), false),
                  new BinaryExpression(new ColumnExpression('chatroom','userName'),'=',user.username),
                  new BinaryExpression(new ColumnExpression('chat','chatroomId'),'=',new ColumnExpression('chatroom','id')),
                  //new BinaryExpression(new ColumnExpression('chatroom','readIndex'),'!=',new ColumnExpression('chat', 'id'))

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
 query.table('lastMessageIndex',(params:IQueryParams)=>{
  const user=params.constants.user
   return  new Query({
     $from : new FromTable({
       table : baseTableName,
       joinClauses : [
         {
           operator: 'LEFT',
           table: new FromTable({
             table: new Query({
               $select: [
                 new ResultColumn(new FunctionExpression('max',new ColumnExpression('chat', 'id'))),
 
                    ],
               $from: [new FromTable('chat', 'chat'),new FromTable('chatroom', 'chatroom')],
               $where:[ new AndExpressions({
                 expressions: [
                   new IsNullExpression(new ColumnExpression('chat', 'deletedAt'), false),
                   new IsNullExpression(new ColumnExpression('chat', 'deletedBy'), false),
                  new BinaryExpression(new ColumnExpression('chat','chatroomId'),'=',new ColumnExpression('chatroom','id')),
                  new BinaryExpression(new ColumnExpression('chatroom','userName'),'=',user.username)

                 ]
               }),
             ], 
             $limit:1,
             $group:new GroupBy(new ColumnExpression('chat','chatroomId')),
             $order:new OrderBy(new ColumnExpression('chat','id'),'DESC')
          
             }),
             
             $as: 'lastMessageIndex'
           }),
           $on: new BinaryExpression(new ColumnExpression('chat', 'chatroomId'), '=', new ColumnExpression('chatroom', 'id'))
         }
       ]
     })
   }) 
 })

//  registerField(query,'lastMessageIndex', lastMessageIndexExpresion,[],false)



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




//custom Expressions

// query.register('lastMessageIndex',new Query({
//   $where:    new BinaryExpression(new ColumnExpression('chat','chatroomId'),'=',new Unknown()),
//   $limit:1


// })).register('chatroomId',0)

// const lastMessageIndexExpression = new QueryExpression(new Query({
//   $select : [
//     new ResultColumn(new FunctionExpression('max',new ColumnExpression('chat','id')))
//   ],
//   $from: new FromTable({
//     table: baseTableName,
//     joinClauses : [{
//       operator: 'LEFT',
//       table: 'chat',
//       $on: [new BinaryExpression(new ColumnExpression('chatroom', 'id'), '=', new ColumnExpression('chat', 'chatroomId'))]
//     }]
//   }),
//   $where: [
//     new IsNullExpression(new ColumnExpression('chat', 'deletedAt'), false),
//     new IsNullExpression(new ColumnExpression('chat', 'deletedBy'), false),
//     new BinaryExpression(new ColumnExpression('chat','chatroomId'),'=',new ColumnExpression('chatroom','id')),

//   ],
//   $order: [
//     {
//       expression: new ColumnExpression('chat', 'id'),
//       order: 'DESC'

//     }
//   ],
//   //$limit: 1
// }))



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

  },
  {
    name:'createdBy',
    expression: new ColumnExpression('chat','createdBy'),
    companion:['table:chat']

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

  }

  
] as ExpressionHelperInterface[]

registerAll(query, baseTableName, fieldList)


export default query;
