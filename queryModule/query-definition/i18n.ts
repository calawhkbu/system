import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
  ResultColumn,
  FromTable,
  OrExpressions,
  RegexpExpression,
  ColumnExpression,
  BinaryExpression,
  InExpression,
  IsNullExpression,
  AndExpressions,
  FunctionExpression,
  Unknown,
  Value,
  JoinClause,
  GroupBy,
} from 'node-jql'

const query = new QueryDef(

  new Query({

    // one more layer of select from to prevent overriding select i18n.*
    $from: new FromTable({

      $as: 'i18n',
      table: new Query({

        $select: [
          new ResultColumn(new ColumnExpression('i18n', '*'))
        ],
        $from: new FromTable({
          table: new Query({

            $select: [

              new ResultColumn(new ColumnExpression('i18n', 'category'), 'category'),
              new ResultColumn(new ColumnExpression('i18n', 'key'), 'key'),
              new ResultColumn(new FunctionExpression('MAX', new ColumnExpression('i18n', 'partyGroupCode')), 'partyGroupCode')

            ],

            $from: new FromTable('i18n'),
            // warning !!! : deletedBy must be Null!!!!!!
            // warning !!! : deletedBy must be Null!!!!!!
            // warning !!! : deletedBy must be Null!!!!!!
            // warning !!! : deletedBy must be Null!!!!!!
            // warning !!! : deletedBy must be Null!!!!!!
            // warning !!! : deletedBy must be Null!!!!!!
            $where: [
              new IsNullExpression(new ColumnExpression('i18n', 'deletedBy'), false),
              new IsNullExpression(new ColumnExpression('i18n', 'deletedAt'), false)
            ],

            $group: new GroupBy([
              'category', 'key'
            ]),

          }),
          $as: 'leftTable',
          joinClauses: [
            new JoinClause(
              'LEFT',
              new FromTable('i18n'),

              new AndExpressions([

                // key is same
                new BinaryExpression(
                  new BinaryExpression(
                    new ColumnExpression('leftTable', 'key'),
                    '=',
                    new ColumnExpression('i18n', 'key')
                  )
                ),

                // category is same

                new OrExpressions([

                  // category is not null case
                  new AndExpressions([

                    new IsNullExpression(new ColumnExpression('leftTable', 'category'), true),

                    new BinaryExpression(
                      new BinaryExpression(
                        new ColumnExpression('leftTable', 'category'),
                        '=',
                        new ColumnExpression('i18n', 'category')
                      )
                    )

                  ]),

                  // category is null case
                  new AndExpressions([

                    new IsNullExpression(new ColumnExpression('leftTable', 'category'), false),
                    new IsNullExpression(new ColumnExpression('i18n', 'category'), false)

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
                        new ColumnExpression('i18n', 'partyGroupCode')
                      )
                    )

                  ]),

                  // partyGroupCode is null case
                  new AndExpressions([

                    new IsNullExpression(new ColumnExpression('leftTable', 'partyGroupCode'), false),
                    new IsNullExpression(new ColumnExpression('i18n', 'partyGroupCode'), false)

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

query.register('canResetDefault',
  {
    expression: new FunctionExpression(
      'IF',
      new IsNullExpression(new ColumnExpression('i18n', 'partyGroupCode'), true),
      1, 0
    ),

    $as: 'canResetDefault'
  })

// ------------------- filter

query
  .register(
    'id',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('i18n', 'id'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'partyGroupCode',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('i18n', 'partyGroupCode'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'categoryLike',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('i18n', 'category'), false, new Unknown('string')),
    })
  )
  .register('value', 0)

export default query
