import { QueryDef, SubqueryArg } from 'classes/query/QueryDef'
import {
  BinaryExpression,
  ColumnExpression,
  Query,
  FunctionExpression,
  AndExpressions,
  IsNullExpression,
  FromTable,
  ResultColumn,
  OrExpressions,
  Value,
  Unknown,
  IExpression,
  InExpression,
  RegexpExpression,
  CaseExpression
} from 'node-jql'
import { IQueryParams } from 'classes/query'

const query = new QueryDef(new Query({
  $select : [
    new ResultColumn(new ColumnExpression('card_access', '*')),
    new ResultColumn(new ColumnExpression('card', 'reportingKey')),
    new ResultColumn(new ColumnExpression('card', 'category')),
    new ResultColumn(new ColumnExpression('card', 'name')),
    new ResultColumn(new ColumnExpression('card', 'description')),
    new ResultColumn(new ColumnExpression('card', 'component')),
    new ResultColumn(new ColumnExpression('card', 'jql')),
  ],
  $from : new FromTable('card_access', {
    operator: 'LEFT',
    table: 'card',
    $on: [
      new BinaryExpression(
        new ColumnExpression('card', 'uuid'),
        '=',
        new ColumnExpression('card_access', 'cardId')
      ),
    ],
  })
}))

  // all expression in here

  const canDeleteExpression = new FunctionExpression(
    'IF',
    new AndExpressions([
      new IsNullExpression(new ColumnExpression('card_access', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('card_access', 'deletedBy'), false),
    ]),
    1, 0
  )

  const canRestoreExpression = new FunctionExpression(
    'IF',
    new AndExpressions([
      new IsNullExpression(new ColumnExpression('card_access', 'deletedAt'), true),
      new IsNullExpression(new ColumnExpression('card_access', 'deletedBy'), true),
    ]),
    1, 0
  )

  const isActiveConditionExpression = new AndExpressions([
    new IsNullExpression(new ColumnExpression('card_access', 'deletedAt'), false),
    new IsNullExpression(new ColumnExpression('card_access', 'deletedBy'), false)
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

  //  ============================

  // finally register here

  const baseTableName = 'card_access'

  const fieldList = [
    'id',
    'partyGroupCode',
    {
      name : 'reportingKey',
      expression : new ColumnExpression('card', 'reportingKey')
    },

    {
      name : 'canDelete',
      expression : canDeleteExpression
    },
    {
      name : 'canRestore',
      expression : canRestoreExpression
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

export default query
