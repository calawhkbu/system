import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
  FromTable,
  FunctionExpression,
  Unknown,
  BinaryExpression,
  ColumnExpression,
  OrExpressions,
  RegexpExpression,
  IsNullExpression,
  JoinClause,
  AndExpressions,
  ResultColumn,
  GroupBy,
} from 'node-jql'

const query = new QueryDef(
  new Query({

    // one more layer of select from to prevent overriding select code_master.*
    $from : new FromTable({

      $as : 'code_master',

      table : new Query({

        $select : [
          new ResultColumn(new ColumnExpression('code_master', '*'))
        ],
        $from : new FromTable({
          table : new Query({

            $select : [

              new ResultColumn(new ColumnExpression('code_master', 'codeType'), 'codeType'),
              new ResultColumn(new ColumnExpression('code_master', 'code'), 'code'),
              new ResultColumn(new FunctionExpression('MAX', new ColumnExpression('code_master', 'partyGroupCode')), 'partyGroupCode')

            ],

            $from: new FromTable('code_master'),
            $group : new GroupBy([
              'codeType', 'code'
            ]),

          }),
          $as : 'leftTable',
          joinClauses : [
            new JoinClause(
              'LEFT',
              new FromTable('code_master'),

              new AndExpressions([

                // code is same
                new BinaryExpression(
                  new BinaryExpression(
                    new ColumnExpression('leftTable', 'code'),
                    '=',
                    new ColumnExpression('code_master', 'code')
                  )
                ),

                // codeType is same

                new OrExpressions([

                  // codeType is not null case
                  new AndExpressions([

                    new IsNullExpression(new ColumnExpression('leftTable', 'codeType'), true),

                    new BinaryExpression(
                      new BinaryExpression(
                        new ColumnExpression('leftTable', 'codeType'),
                        '=',
                        new ColumnExpression('code_master', 'codeType')
                      )
                    )

                  ]),

                  // codeType is null case
                  new AndExpressions([

                    new IsNullExpression(new ColumnExpression('leftTable', 'codeType'), false),
                    new IsNullExpression(new ColumnExpression('code_master', 'codeType'), false)

                  ]),

                ]),

                // partyGroupCode is same

                new OrExpressions([

                  // partyGroupCode is not null case
                  new AndExpressions([

                    new IsNullExpression(new ColumnExpression('leftTable', 'partyGroupCode'), true),

                    new BinaryExpression(
                      new BinaryExpression(
                        new ColumnExpression('leftTable', 'partyGroupCode'),
                        '=',
                        new ColumnExpression('code_master', 'partyGroupCode')
                      )
                    )

                  ]),

                  // partyGroupCode is null case
                  new AndExpressions([

                    new IsNullExpression(new ColumnExpression('leftTable', 'partyGroupCode'), false),
                    new IsNullExpression(new ColumnExpression('code_master', 'partyGroupCode'), false)

                  ]),

                ])

              ])

            )
          ]
        })
      })

    })

  })
)

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

query.register(
  'isActive',
  new Query({
    $where: [
      new IsNullExpression(new ColumnExpression('code_master', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('code_master', 'deletedBy'), false),
      new IsNullExpression(new ColumnExpression('flex_data', 'deletedBy'), false),
      new IsNullExpression(new ColumnExpression('flex_data', 'deletedBy'), false),
    ],
  })
)

export default query
