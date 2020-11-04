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
  ResultColumn,
  GroupBy,
  AndExpressions,
  JoinClause,
  MathExpression,
} from 'node-jql'

const query = new QueryDef(
  new Query({

        // one more layer of select from to prevent overriding select code_master.*
        $from : new FromTable({

          $as : 'code_master',

          table : new Query({

            $select : [
              new ResultColumn(new ColumnExpression('code_master', '*')),
              new ResultColumn(new ColumnExpression('flex_data', 'data'))
            ],
            $from : new FromTable({
              table : new Query({

                $select : [

                  new ResultColumn(new ColumnExpression('code_master', 'codeType'), 'codeType'),
                  new ResultColumn(new ColumnExpression('code_master', 'code'), 'code'),
                  new ResultColumn(new FunctionExpression('MAX', new ColumnExpression('code_master', 'partyGroupCode')), 'partyGroupCode')

                ],

                // warning !!! : deletedBy must be Null!!!!!!
                // warning !!! : deletedBy must be Null!!!!!!
                // warning !!! : deletedBy must be Null!!!!!!
                // warning !!! : deletedBy must be Null!!!!!!
                // warning !!! : deletedBy must be Null!!!!!!
                // warning !!! : deletedBy must be Null!!!!!!
                $where: [
                  new IsNullExpression(new ColumnExpression('code_master', 'deletedBy'), false),
                  new IsNullExpression(new ColumnExpression('code_master', 'deletedAt'), false)
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

                ),

                // join flexData
                new JoinClause(
                  {
                  operator: 'LEFT',
                  table: 'flex_data',
                  $on: [
                    new BinaryExpression(new ColumnExpression('flex_data', 'tableName'), '=', 'code_master'),
                    new BinaryExpression(
                      new ColumnExpression('code_master', 'id'),
                      '=',
                      new ColumnExpression('flex_data', 'primaryKey')
                    ),
                  ],
                }

                )
              ]
            })
          })

        })

    // $from: new FromTable('code_master', {
    //   operator: 'LEFT',
    //   table: 'flex_data',
    //   $on: [
    //     new BinaryExpression(new ColumnExpression('flex_data', 'tableName'), '=', 'code_master'),
    //     new BinaryExpression(
    //       new ColumnExpression('code_master', 'id'),
    //       '=',
    //       new ColumnExpression('flex_data', 'primaryKey')
    //     ),
    //   ],
    // }),

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
    'code',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('code_master', 'code'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'flexDataData',
    new Query({
      $where: new BinaryExpression(
        new MathExpression(
          new ColumnExpression('flex_data', 'data'),
          '->>',
          new Unknown('string')
        ),
        '='
      ),
    })
  )
  .register('flexDataKey', 0)
  .register('value', 1)

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
