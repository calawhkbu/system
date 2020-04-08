import { QueryDef } from 'classes/query/QueryDef'
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
} from 'node-jql'

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

query.register('canResetDefault',
{
  expression : new FunctionExpression(
    'IF',
    new IsNullExpression(new ColumnExpression('code_master', 'partyGroupCode'), true),
    1, 0
  ),

  $as: 'canResetDefault'
})

// -------------- filter

query
  .register(
    'codeType',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('code_master', 'codeType'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'codeTypeLike',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('code_master', 'codeType'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'code',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('code_master', 'code'), '='),
    })
  )
  .register('value', 0)

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

  // isActive
  const isActiveConditionExpression = new AndExpressions([
    new IsNullExpression(new ColumnExpression('code_master', 'deletedAt'), false),
    new IsNullExpression(new ColumnExpression('code_master', 'deletedBy'), false)
  ])

  query.registerBoth('isActive', isActiveConditionExpression)

  query.registerQuery('isActive', new Query({

    $where : new OrExpressions([

      new AndExpressions([

        new BinaryExpression(new Value('active'), '=', new Unknown('string')),
        // active case
        isActiveConditionExpression
      ]),

      new AndExpressions([
        new BinaryExpression(new Value('deleted'), '=', new Unknown('string')),
        // deleted case
        new BinaryExpression(isActiveConditionExpression, '=', false)
      ])

    ])

  }))
  .register('value', 0)
  .register('value', 1)
export default query
