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
  ColumnsExpression,
  LikeExpression,
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
import { TableHints } from 'sequelize/types'

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

 
  // select messageWithoutTag from chat where 
query.table('chat',(params:IQueryParams)=>{
 const user=params.constants.user
 const tableName=params.subqueries.tableName && params.subqueries.tableName.value||null
  return   new Query({
    $from : new FromTable({
      table : baseTableName,
      joinClauses : [
        {
          operator: 'LEFT',
          table: new FromTable({
            table: new Query({
              $select: [
                new ResultColumn(new ColumnExpression('chat', 'chatroomId')),
                new ResultColumn(new ColumnExpression('chat', 'createdAt')),
                new ResultColumn(new FunctionExpression('max',new ColumnExpression('chat', 'id')),'lastMessageIndex'),
                 new ResultColumn(new QueryExpression(new Query({
                    $select:[
                      new ResultColumn(new ColumnExpression('chat','messageWithoutTag'))
                    ],
                    $from:'chat',
                    $where :[
                      new BinaryExpression(new ColumnExpression('chat','chatroomId'),'=',new FunctionExpression('max',new ColumnExpression('chatroom','id')))

                    ],
                    $order:new OrderBy(new ColumnExpression('chat','id'),"DESC"),
                    $limit:1

                 })),'lastMessage'),

                 new ResultColumn(new QueryExpression(new Query({
                    $select:[
                      new ResultColumn(new ColumnExpression('chat','message'))
                    ],
                    $from:'chat',
                    $where :[
                      new BinaryExpression(new ColumnExpression('chat','chatroomId'),'=',new FunctionExpression('max',new ColumnExpression('chatroom','id')))

                    ],
                    $order:new OrderBy(new ColumnExpression('chat','id'),"DESC"),
                    $limit:1

                 })),'message'),
   
                new ResultColumn(new FunctionExpression('max',new ColumnExpression('chat', 'createdAt')),'createdAtLast'),
                new ResultColumn(new QueryExpression(new Query({
                  $select:[
                    new ResultColumn(new ColumnExpression('chat','createdBy'))
                  ],
                  $from:'chat',
                  $where :[
                    new BinaryExpression(new ColumnExpression('chat','chatroomId'),'=',new FunctionExpression('max',new ColumnExpression('chatroom','id')))

                  ],
                  $order:new OrderBy(new ColumnExpression('chat','id'),"DESC"),
                  $limit:1

               })),'createdByLast'),
               
               new ResultColumn(new QueryExpression(new Query({
                $select:[
                  new ResultColumn(new ColumnExpression('chat','nameList'))
                ],
                $from:'chat',
                $where :[
                  new BinaryExpression(new ColumnExpression('chat','chatroomId'),'=',new FunctionExpression('max',new ColumnExpression('chatroom','id')))

                ],
                $order:new OrderBy(new ColumnExpression('chat','id'),"DESC"),
                $limit:1

             })),'mentions'),




                   ],
                   $from: [new FromTable('chat', 'chat'),new FromTable('chatroom', 'chatroom')],
                   $where:[ new AndExpressions({
                expressions: [
                  new IsNullExpression(new ColumnExpression('chat', 'deletedAt'), false),
                  new IsNullExpression(new ColumnExpression('chat', 'deletedBy'), false),
                  new BinaryExpression(new ColumnExpression('chatroom','userName'),'=',user.username),
                  new BinaryExpression(new ColumnExpression('chat','chatroomId'),'=',new ColumnExpression('chatroom','id')),
                  //new InExpression(new ColumnExpression('person','userName'),false,new ColumnExpression('chat','nameList'))

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


query.table('person',(params:IQueryParams)=>{
  const user=params.constants.user
  const tableName=params.subqueries.tableName && params.subqueries.tableName.value||null
   return   new Query({
     $from : new FromTable({
       table : baseTableName,
       joinClauses : [
         {
           operator: 'LEFT',
           table: new FromTable({
             table: new Query({
               $select: [ new ResultColumn(new ColumnExpression('person', '*')),
              
                    ],
                    $from: [new FromTable('person', 'person'),],
                    $where:[ new AndExpressions({
                 expressions: [
                   new IsNullExpression(new ColumnExpression('person', 'deletedAt'), false),
                   new IsNullExpression(new ColumnExpression('person', 'deletedBy'), false),
 
                 ]
               }),
             ], 
             
             }),
             $as: 'person'
           }),
           $on: new BinaryExpression(new ColumnExpression('person', 'partyGroupCode'), '=', user.partyGroupCode)
         }
       ]
     })
   }) 
 })


 


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
    name:'lastMessage',
    expression: new ColumnExpression('chat','lastMessage'),
    companion:['table:chat']
  },
  {
    name:'message',
    expression: new ColumnExpression('chat','message'),
    companion:['table:chat']
  },
  {
    name:'mentions',
    expression: new ColumnExpression('chat','mentions'),
    companion:['table:chat']

  },
 
  


  
] as ExpressionHelperInterface[]

registerAll(query, baseTableName, fieldList)
// search chatroom for card speicic Free-text search 
query.register('chatroomSearch', (value: any, params?: IQueryParams) => {
  const q = params.subqueries.chatroomSearch.value || ''
  const chatroomExpression = new ColumnExpression('chatroom','chatroom')

  return new Query({
    $where: new LikeExpression(chatroomExpression, false, `%${q}%`),
  })
})

query.register('refNo', (value: any, params?: IQueryParams) => {
  const q = params.subqueries.refNo.value || ''
  const bookingNoExpression = new ColumnExpression('booking','bookingNo')
  const HouseNoExpression = new ColumnExpression('shipment','houseNo')

  return new Query({
    $where: new OrExpressions({
      expressions: [
        new LikeExpression(bookingNoExpression, false, `%${q}%`),
        new LikeExpression(HouseNoExpression, false, `%${q}%`),
      ]})
  })
})

query.register('messageSearch', (value: any, params?: IQueryParams) => {
  const q = params.subqueries.messageSearch.value || ''
  let keywords = []
  let keywordsExpression = []
  const messageExpression = new ColumnExpression('chat','message')

  if(q){
    keywords=q.split(' ')
  }else{
    keywords.push(q)
  }

  keywords.forEach(el => {
    keywordsExpression.push(new LikeExpression(messageExpression, false, `%${el}%`))
  });


  return new Query({
    $where: new AndExpressions({
      expressions: keywordsExpression
    })
  })
})





export default query;
