import { QueryDef } from 'classes/query/QueryDef'
import {
  BinaryExpression,
  ColumnExpression,
  Query,
  AndExpressions,
  IsNullExpression,
  FromTable,
  Value,
  CaseExpression,
  IExpression,
  OrExpressions,
  ExpressionHelperInterface,
  FunctionExpression,
  RegexpExpression
} from 'node-jql'
import { registerAll } from 'utils/jql-subqueries'

const partyList = [
  {
    name: 'buyer',
  }
] as {
  name: string,
  partyNameExpression?: {
    companion: string[],
    expression: IExpression
  },
  partyIdExpression?: {
    companion: string[],
    expression: IExpression
  },
  partyCodeExpression?: {
    companion: string[],
    expression: IExpression
  },
  partyNameInReportExpression?: {
    companion: string[],
    expression: IExpression
  }
  partyShortNameInReportExpression?: {
    companion: string[],
    expression: IExpression
  }

}[]

// const partyExpressionList = partyList.reduce((accumulator: ExpressionHelperInterface[], party) => {

//   const partyFieldList = [
//     'PartyId',
//   ]

//   const partyTableName = party.name

//   const partyIdExpression = party.partyIdExpression  || { expression : new ColumnExpression('product_category', `${partyTableName}PartyId`), companion : ['table:product_category']}

//   const resultExpressionList = partyFieldList.map(partyField => {

//     const fieldName = `${partyTableName}${partyField}`

//     let finalExpressionInfo: { expression: IExpression, companion: string[]}

//     switch (partyField) {
//       case 'PartyId':
//         finalExpressionInfo = partyIdExpression
//         break
//     }

//     return {
//       name : fieldName,
//       ...finalExpressionInfo
//     } as ExpressionHelperInterface
//   })

//   return accumulator.concat(resultExpressionList)
//  }, [])

 const CONSTANTS = {
  tableName: 'product_category',
  fieldList: [
    'id',
    'productCategoryCode',
    'name',
    'description',
    'buyerPartyId'
  ]
}

const query = new QueryDef(new Query({
  $from: new FromTable(CONSTANTS.tableName, CONSTANTS.tableName)
}))

query.subquery(
  'q',
  new Query({
    $where: 
    new AndExpressions({
      expressions: [
        new ColumnExpression('product_category', 'buyerPartyId'),
        new OrExpressions({
          expressions: [
            new RegexpExpression(new ColumnExpression('product_category', 'name'), false),
            new RegexpExpression(new ColumnExpression('product_category', 'productCategoryCode'), false),
            new BinaryExpression(
              new Value('?'),
              '=',
              new Value('')
            )
          ]
        })
      ]
    })
  })
)
.register('buyerId', 0)
.register('value', 1)
.register('value', 2)
.register('value', 3)

registerAll(
  query,
  CONSTANTS.tableName,
  [
    ...CONSTANTS.fieldList,
    {
      name : 'activeStatus',
      expression : new CaseExpression({
        cases : [
          {
            $when : new BinaryExpression(
              new AndExpressions([
                new IsNullExpression(new ColumnExpression('product_category', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('product_category', 'deletedBy'), false)
              ]),
              '=',
              false
            ),
            $then : new Value('deleted')
          }
        ],
        $else : new Value('active')
      })
    }
  ]
)

export default query
