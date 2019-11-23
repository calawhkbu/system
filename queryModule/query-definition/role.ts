import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
  FromTable,
  RegexpExpression,
  ColumnExpression,
  InExpression,
  BinaryExpression,
  IsNullExpression,
  ResultColumn,
  JoinClause,
  AndExpressions,
  GroupBy,
  FunctionExpression,
  OrExpressions,
} from 'node-jql'

const query = new QueryDef(
  new Query({

            // one more layer of select from to prevent overriding select role.*
            $from : new FromTable({

              $as : 'role',

              table : new Query({

                $select : [
                  new ResultColumn(new ColumnExpression('role', '*')),
                  new ResultColumn(new ColumnExpression('flex_data', 'data'))
                ],
                $from : new FromTable({
                  table : new Query({

                    $select : [
                      new ResultColumn(new ColumnExpression('role', 'roleName'), 'roleName'),
                      new ResultColumn(new FunctionExpression('MAX', new ColumnExpression('role', 'partyGroupCode')), 'partyGroupCode')

                    ],

                    $from: new FromTable('role'),
                    $group : new GroupBy([
                      'roleName'
                    ]),

                  }),
                  $as : 'leftTable',
                  joinClauses : [
                    new JoinClause(
                      'LEFT',
                      new FromTable('role'),

                      new AndExpressions([

                        // roleName is same
                        new BinaryExpression(
                          new BinaryExpression(
                            new ColumnExpression('leftTable', 'roleName'),
                            '=',
                            new ColumnExpression('role', 'roleName')
                          )
                        ),

                        // partyGroupCode is same
                        new OrExpressions([

                          // partyGroupCode is not null case
                          new AndExpressions([

                            new IsNullExpression(new ColumnExpression('leftTable', 'partyGroupCode'), true),

                            new BinaryExpression(
                              new BinaryExpression(
                                new ColumnExpression('leftTable', 'partyGroupCode'),
                                '=',
                                new ColumnExpression('role', 'partyGroupCode')
                              )
                            )

                          ]),

                          // partyGroupCode is null case
                          new AndExpressions([

                            new IsNullExpression(new ColumnExpression('leftTable', 'partyGroupCode'), false),
                            new IsNullExpression(new ColumnExpression('role', 'partyGroupCode'), false)

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
                        new BinaryExpression(new ColumnExpression('flex_data', 'tableName'), '=', 'role'),
                        new BinaryExpression(
                          new ColumnExpression('role', 'id'),
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

  //   $select : [

  //     new ResultColumn(new ColumnExpression('role', '*')),
  //     new ResultColumn(new ColumnExpression('flex_data', 'data')),

  //   ],
  //   $from: new FromTable('role', {
  //     operator: 'LEFT',
  //     table: 'flex_data',
  //     $on: [
  //       new BinaryExpression(new ColumnExpression('flex_data', 'tableName'), '=', 'role'),
  //       new BinaryExpression(
  //         new ColumnExpression('role', 'id'),
  //         '=',
  //         new ColumnExpression('flex_data', 'primaryKey')
  //       ),
  //     ],
  //   }),

  })
)

// ----------------- filter stuff
query
  .register(
    'id',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('role', 'id'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'partyGroupCode',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('role', 'partyGroupCode'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'name',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('role', 'roleName'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'group',
    new Query({
      $where: new InExpression(new ColumnExpression('role', 'roleGroup'), null),
    })
  )
  .register('value', 0)

query
  .register(
    'shareable',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('role', 'shareable'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'hidden',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('role', 'hidden'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'canMultiSelect',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('role', 'canMultiSelect'), '='),
    })
  )
  .register('value', 0)

query.register(
  'isActive',
  new Query({
    $where: [
      new IsNullExpression(new ColumnExpression('role', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('role', 'deletedBy'), false),
      new IsNullExpression(new ColumnExpression('flex_data', 'deletedBy'), false),
      new IsNullExpression(new ColumnExpression('flex_data', 'deletedBy'), false),
    ],
  })
)

export default query
