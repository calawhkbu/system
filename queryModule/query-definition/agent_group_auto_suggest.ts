import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
  ResultColumn,
  OrExpressions,
  RegexpExpression,
  ColumnExpression,
  BinaryExpression,
  IsNullExpression,
  AndExpressions,
  Unknown,
  Value,
  FromTable,
} from 'node-jql'

const query = new QueryDef(
  new Query({
    $distinct: true,
    $select: [
      new ResultColumn('groupName')
    ],
    $from: new FromTable('party', {
      operator: 'LEFT',
      table: 'party_type',
      $on: new BinaryExpression(
        new ColumnExpression('party', 'id'),
        '=',
        new ColumnExpression('party_type', 'partyId')
      ),
    })
  })
)

query
  .register(
    'q',
    new Query({
      $where: new RegexpExpression(
        new ColumnExpression('party', 'groupName'), false, new Unknown('string'),
      ),
    })
  )
  .register('value', 0)

query
  .register(
    'value',
    new Query({
      $where: new BinaryExpression(
        new ColumnExpression('party', 'groupName'), '=', new Unknown('string'),
      ),
    })
  )
  .register('value', 0)

    // will have 2 options, active and deleted
  // isActive
  const isActiveConditionExpression = new AndExpressions([
    new IsNullExpression(new ColumnExpression('party', 'deletedAt'), false),
    new IsNullExpression(new ColumnExpression('party', 'deletedBy'), false)
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
