import { QueryDef, QueryFn } from 'classes/query/QueryDef'
import {
  Query,
  FromTable,
  BinaryExpression,
  ColumnExpression,
  RegexpExpression,
  IsNullExpression,
  InExpression,
  ResultColumn,
  Value,
  FunctionExpression,
  AndExpressions,
  OrExpressions,
  Unknown,
  JoinClause,
  IExpression,
  LikeExpression
} from 'node-jql'

const tableName = 'task_manager'

const query = new QueryDef(
  new Query({
    $from: new FromTable(
      tableName
    ),
  })
)

const fieldList = [
  'id',
  'active',
  'taskName',

  'workerHandlerName',
  'taskLimit',

  'createdAt',
  'updatedAt',
  'deletedAt',

  'createBy',
  'updatedBy',
  'deletedBy',
] as (string | {
  name: string
  expression: IExpression |  ((subqueryParam) => IExpression)
})[]

fieldList.forEach(field => {

  const expression = (typeof field === 'string') ? new ColumnExpression(tableName, field) : field.expression
  const name = (typeof field === 'string') ? field : field.name

  const expressionFn = (subqueryParam) => {
    return typeof expression === 'function' ? expression(subqueryParam) : expression
  }

  // register field
  query.registerBoth(name, expressionFn)

  const inFilterQueryFn = ((subqueryParam) => {

    const valueList = subqueryParam['value']

    return new Query({
      $where: new InExpression(expressionFn(subqueryParam), false, valueList),
    })
  }) as QueryFn

  const equalFilterQueryFn = ((subqueryParam) => {

    const value = subqueryParam['value']

    return new Query({
      $where: new BinaryExpression(expression, '=', value),
    })
  }) as QueryFn

  const equalOrInFilterQueryFn = ((subqueryParam) => {

    const value = subqueryParam['value']

    console.log(Array.isArray(value))
    return (Array.isArray(value)) ? inFilterQueryFn(subqueryParam) : equalFilterQueryFn(subqueryParam)

  }) as QueryFn

  const LikeQueryFn = ((subqueryParam) => {

    const value = subqueryParam['value']

    return new Query({
      $where: new LikeExpression(expressionFn(subqueryParam), false, value),
    })
  }) as QueryFn

  const IsNotNullQueryFn = ((subqueryParam) => {
    return new Query({
      $where: new IsNullExpression(expressionFn(subqueryParam), true),
    })
  }) as QueryFn

  const IsNullQueryFn = ((subqueryParam) => {
    return new Query({
      $where: new IsNullExpression(expressionFn(subqueryParam), false),
    })
  }) as QueryFn

  query.registerQuery(`${name}`, equalOrInFilterQueryFn)
  query.registerQuery(`${name}In`, inFilterQueryFn)
  query.registerQuery(`${name}Equal`, equalFilterQueryFn)
  query.registerQuery(`${name}Like`, LikeQueryFn)

  query.registerQuery(`${name}IsNotNull`, IsNotNullQueryFn)
  query.registerQuery(`${name}IsNull`, IsNullQueryFn)

})

export default query
