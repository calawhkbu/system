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
          new ResultColumn(new ColumnExpression('right_code_master', '*'))
        ],
        $from : new FromTable({
          table : new Query({
            $select : [
              new ResultColumn(new ColumnExpression('calc_code_master', 'codeType'), 'codeType'),
              new ResultColumn(new ColumnExpression('calc_code_master', 'code'), 'code'),
              new ResultColumn(new FunctionExpression('MAX', new ColumnExpression('calc_code_master', 'partyGroupCode')), 'partyGroupCode')
            ],
            $from: new FromTable('code_master', 'calc_code_master'),
            // warning !!! : deletedBy must be Null!!!!!!
            // warning !!! : deletedBy must be Null!!!!!!
            // warning !!! : deletedBy must be Null!!!!!!
            // warning !!! : deletedBy must be Null!!!!!!
            // warning !!! : deletedBy must be Null!!!!!!
            // warning !!! : deletedBy must be Null!!!!!!
            $where: [
              new IsNullExpression(new ColumnExpression('calc_code_master', 'deletedBy'), false),
              new IsNullExpression(new ColumnExpression('calc_code_master', 'deletedAt'), false)
            ],
            $group : new GroupBy([
              new ColumnExpression('calc_code_master', 'codeType'),
              new ColumnExpression('calc_code_master', 'code')
            ]),
          }),
          $as : 'leftTable',
          joinClauses : [
            new JoinClause(
              'LEFT',
              new FromTable('code_master', 'right_code_master'),
              new AndExpressions([
                // code is same
                new BinaryExpression(
                  new BinaryExpression(
                    new ColumnExpression('leftTable', 'code'),
                    '=',
                    new ColumnExpression('right_code_master', 'code')
                  )
                ),
                // codeType is same
                new OrExpressions([
                  // codeType is not null case
                  new AndExpressions([
                    new IsNullExpression(
                      new ColumnExpression('leftTable', 'codeType'),
                      true
                    ),
                    new BinaryExpression(
                      new BinaryExpression(
                        new ColumnExpression('leftTable', 'codeType'),
                        '=',
                        new ColumnExpression('right_code_master', 'codeType')
                      )
                    )
                  ]),
                  // codeType is null case
                  new AndExpressions([
                    new IsNullExpression(
                      new ColumnExpression('leftTable', 'codeType'),
                      false
                    ),
                    new IsNullExpression(
                      new ColumnExpression('right_code_master', 'codeType'),
                      false
                    )
                  ]),
                ]),
                // partyGroupCode is same
                new OrExpressions([
                  // partyGroupCode is not null case
                  new AndExpressions([
                    new IsNullExpression(
                      new ColumnExpression('leftTable', 'partyGroupCode'),
                      true
                    ),
                    new BinaryExpression(
                      new BinaryExpression(
                        new ColumnExpression('leftTable', 'partyGroupCode'),
                        '=',
                        new ColumnExpression('right_code_master', 'partyGroupCode')
                      )
                    )
                  ]),
                  // partyGroupCode is null case
                  new AndExpressions([
                    new IsNullExpression(
                      new ColumnExpression('leftTable', 'partyGroupCode'),
                      false
                    ),
                    new IsNullExpression(
                      new ColumnExpression('right_code_master', 'partyGroupCode'),
                      false
                    )
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

query.register('flex_data_join', new Query({
  $from: new FromTable({
    table: 'code_master',
    joinClauses : [
      new JoinClause({
        operator: 'LEFT',
        table: 'flex_data',
        $on: [
          new BinaryExpression(
            new ColumnExpression('flex_data', 'tableName'),
            '=',
            'code_master'
          ),
          new BinaryExpression(
            new ColumnExpression('code_master', 'id'),
            '=',
            new ColumnExpression('flex_data', 'primaryKey')
          ),
        ],
      })
    ],
  })
}))

query.register('isActive', {
  expression : new FunctionExpression(
    'IF',
    new AndExpressions([
      new IsNullExpression(new ColumnExpression('code_master', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('code_master', 'deletedBy'), false),
    ]),
    1, 0
  ),

  $as: 'isActive'
})

query.register('can_delete',
{

  expression : new FunctionExpression(
    'IF',
    new AndExpressions([
      new IsNullExpression(new ColumnExpression('code_master', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('code_master', 'deletedBy'), false),
    ]),
    1, 0
  ),

  $as: 'can_delete'
})

query.register('can_restore',
{

  expression : new FunctionExpression(
    'IF',
    new AndExpressions([
      new IsNullExpression(new ColumnExpression('code_master', 'deletedAt'), true),
      new IsNullExpression(new ColumnExpression('code_master', 'deletedBy'), true),
    ]),
    1, 0
  ),

  $as: 'can_restore'
})

query.register('isDefault',
{
  expression : new FunctionExpression(
    'IF',
    new IsNullExpression(new ColumnExpression('code_master', 'partyGroupCode'), false),
    1, 0
  ),

  $as: 'isDefault'
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

export default query
