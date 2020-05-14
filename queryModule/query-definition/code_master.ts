import { QueryDef, SubqueryArg } from 'classes/query/QueryDef'
import {
  Query,
  FromTable,
  FunctionExpression,
  BinaryExpression,
  ColumnExpression,
  OrExpressions,
  RegexpExpression,
  IsNullExpression,
  AndExpressions,
  Unknown,
  Value,
  ExistsExpression,
  IExpression,
  CaseExpression,
  InExpression,
} from 'node-jql'
import { IQueryParams } from 'classes/query'

const query = new QueryDef(
  new Query({
    $from : new FromTable('code_master'),
    $where : new OrExpressions([
      new IsNullExpression(new ColumnExpression('code_master', 'partyGroupCode'), true),
      new AndExpressions([
        new IsNullExpression(new ColumnExpression('code_master', 'partyGroupCode'), false),
        new ExistsExpression(new Query({
          $from : new FromTable({
            table : 'code_master',
            $as : 'b'
          }),
          $where : [
            new BinaryExpression(new ColumnExpression('b', 'codeType'), '=', new ColumnExpression('code_master', 'codeType')),
            new BinaryExpression(new ColumnExpression('b', 'code'), '=', new ColumnExpression('code_master', 'code')),
            new IsNullExpression(new ColumnExpression('b', 'partyGroupCode'), true)
          ]
        }), true)
      ])
    ])
  })
)

const canResetDefaultExpression = new FunctionExpression(
  'IF',
  new IsNullExpression(new ColumnExpression('code_master', 'partyGroupCode'), true),
  1, 0
)

const isActiveConditionExpression = new AndExpressions([
  new IsNullExpression(new ColumnExpression('code_master', 'deletedAt'), false),
  new IsNullExpression(new ColumnExpression('code_master', 'deletedBy'), false)
])

query.registerBoth('isActive', isActiveConditionExpression)

const isActiveStatusExpression = new CaseExpression({
  cases : [
    {
      $when : new BinaryExpression(isActiveConditionExpression, '=', false),
      $then : new Value('deleted')
    }
  ],
  $else : new Value('active')
})

const baseTableName = 'code_master'

const fieldList = [

  'codeType',
  'code',
  {
    name : 'reportingKey',
    expression : new ColumnExpression('card', 'reportingKey')
  },
  {
    name : 'canResetDefault',
    expression : canResetDefaultExpression
  },
  {
    name : 'activeStatus',
    expression : isActiveStatusExpression
  }

] as {
  name: string
  expression: IExpression |  ((subqueryParam) => IExpression),
  companion?: string[]
}[]

function registerAll(query, fieldList)
{

  fieldList.map(field => {

    const name = (typeof field === 'string') ? field : field.name

    const expressionFn = (subqueryParam: IQueryParams) => {
      return (typeof field === 'string') ? new ColumnExpression(baseTableName, field) : typeof field.expression === 'function' ? field.expression(subqueryParam) : field.expression
    }

    const companion = (typeof field === 'string') ? [] : (field.companion && field.companion.length) ? field.companion : []

    const eqFilterQueryFn = ((value: any, param?: IQueryParams) => {
      const trueValue = value.value

      if (Array.isArray(trueValue))
      {
        throw new Error(`receive list value, value : ${JSON.stringify(trueValue)}`)
      }

      return new Query({
        $where: new BinaryExpression(expressionFn(param), '=', new Value(trueValue)),
      })
    }) as SubqueryArg

    const notEqFilterQueryFn = ((value: any, param?: IQueryParams) => {

      const trueValue = value.value

      if (Array.isArray(trueValue))
      {
        throw new Error(`receive list value, value : ${JSON.stringify(trueValue)}`)
      }

      return new Query({
        $where: new BinaryExpression(expressionFn(param), '!=', new Value(trueValue)),
      })
    }) as SubqueryArg

    const inFilterQueryFn = ((value: any, param?: IQueryParams) => {

      const valueList = value.value

      if (!Array.isArray(valueList))
      {
        throw new Error(`receive  non list value, valueList : ${JSON.stringify(valueList)}`)
      }

      return new Query({
        $where: new InExpression(expressionFn(param), false, valueList),
      })
    }) as SubqueryArg

    const notInFilterQueryFn = ((value: any, param?: IQueryParams) => {

      const valueList = value.value

      if (!Array.isArray(valueList))
      {
        throw new Error(`receive  non list value, valueList : ${JSON.stringify(valueList)}`)
      }

      return new Query({
        $where: new InExpression(expressionFn(param), true, valueList),
      })
    })

    const IsNotNullQueryFn = ((value: any, param?: IQueryParams) => {
      return new Query({
        $where: new IsNullExpression(expressionFn(param), true),
      })
    })

    const IsNullQueryFn = ((value: any, param?: IQueryParams) => {
      return new Query({
        $where: new IsNullExpression(expressionFn(param), false),
      })
    })

    const likeQueryFn = ((value: any, param?: IQueryParams) => {
      return new Query({
        $where: new RegexpExpression(expressionFn(param), false),
      })
    })

    const notLikeQueryFn = ((value: any, param?: IQueryParams) => {
      return new Query({
        $where: new RegexpExpression(expressionFn(param), false),
      })
    })

    // register for field and groupBy
    query.registerBoth(name, expressionFn, ...companion)

    // register as filter
    // warning : ${name} filter is default Eq !!
    query.subquery(`${name}`, eqFilterQueryFn, ...companion)
    query.subquery(`${name}Eq`, eqFilterQueryFn, ...companion)
    query.subquery(`${name}NotEq`, notEqFilterQueryFn, ...companion)
    query.subquery(`${name}In`, inFilterQueryFn, ...companion)
    query.subquery(`${name}NotIn`, notInFilterQueryFn, ...companion)
    query.subquery(`${name}IsNotNull`, IsNotNullQueryFn, ...companion)
    query.subquery(`${name}IsNull`, IsNullQueryFn, ...companion)
    query.subquery(`${name}Like`, likeQueryFn, ...companion)
    query.subquery(`${name}NotLike`, notLikeQueryFn, ...companion)

  })

}

registerAll(query, fieldList)

// -------------- filter

query
  .register(
    'q',
    new Query({
      $where: new OrExpressions([
        new RegexpExpression(new ColumnExpression('code_master', 'code'), false),
        new RegexpExpression(new ColumnExpression('code_master', 'name'), false),
      ]),
    })
  )
  .register('value', 0)
  .register('value', 1)

export default query
