import { QueryDef } from 'classes/query/QueryDef'
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
} from 'node-jql'

const query = new QueryDef(
  new Query({
    $from: new FromTable(
      'person',
      {
        operator: 'LEFT',
        table: 'invitation',
        $on: [
          new BinaryExpression(
            new ColumnExpression('person', 'id'),
            '=',
            new ColumnExpression('invitation', 'personId')
          ),
        ],
      },
      {
        operator: 'LEFT',
        table: 'parties_person',
        $on: [
          new BinaryExpression(
            new ColumnExpression('person', 'id'),
            '=',
            new ColumnExpression('parties_person', 'personId')
          ),
        ],
      },
      {
        operator: 'LEFT',
        table: 'party',
        $on: [
          new BinaryExpression(
            new ColumnExpression('party', 'id'),
            '=',
            new ColumnExpression('parties_person', 'partyId')
          ),
        ],
      },
      {
        operator: 'LEFT',
        table: 'person_contact',
        $on: [
          new BinaryExpression(
            new ColumnExpression('person', 'id'),
            '=',
            new ColumnExpression('person_contact', 'personId')
          ),
        ],
      }
    ),
  })
)

query.register('can_resend', {
  expression: new FunctionExpression('IF',

  new InExpression(
    new FunctionExpression('IF',
      new AndExpressions([
        new IsNullExpression(new ColumnExpression('invitation', 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression('invitation', 'deletedBy'), false),
      ]),

      new ColumnExpression('invitation', 'status'),
      new Value('disabled')
    ),
    false,
    ['sent']
  ), 1, 0),

  $as: 'can_resend'
})

query.register('can_delete', {
  expression: new FunctionExpression('IF',

  new InExpression(
    new FunctionExpression('IF',
      new AndExpressions([
        new IsNullExpression(new ColumnExpression('invitation', 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression('invitation', 'deletedBy'), false),
      ]),

      new ColumnExpression('invitation', 'status'),
      new Value('disabled')
    ),
    false,
    ['sent', 'accepted']
  ), 1, 0),

  $as: 'can_delete'
})

query.register('can_restore', {
  expression: new FunctionExpression('IF',

  new InExpression(
    new FunctionExpression('IF',
      new AndExpressions([
        new IsNullExpression(new ColumnExpression('invitation', 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression('invitation', 'deletedBy'), false),
      ]),

      new ColumnExpression('invitation', 'status'),
      new Value('disabled')
    ),
    false,
    ['disabled']
  ), 1, 0),
  $as: 'can_restore'
})

query.register('invitationStatus', {
  expression: new FunctionExpression(
    new FunctionExpression('IF',
      new AndExpressions([
        new IsNullExpression(new ColumnExpression('invitation', 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression('invitation', 'deletedBy'), false),
      ]),

      new ColumnExpression('invitation', 'status'),
      new Value('disabled')
    )

  ),
  $as: 'invitationStatus'
})

// ---------------------------------

query
  .register(
    'invitationStatus',
    new Query({
      $where: new InExpression(
        new FunctionExpression(
          new FunctionExpression('IF',
            new AndExpressions([
              new IsNullExpression(new ColumnExpression('invitation', 'deletedAt'), false),
              new IsNullExpression(new ColumnExpression('invitation', 'deletedBy'), false),
            ]),

            new ColumnExpression('invitation', 'status'),
            new Value('disabled')
          ))
        , false),
    })
  )
  .register('value', 0)

query
  .register(
    'userName',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('person', 'userName'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'firstName',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('person', 'firstName'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'lastName',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('person', 'lastName'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'displayName',
    new Query({
      $where: new RegexpExpression(new ColumnExpression('person', 'displayName'), false),
    })
  )
  .register('value', 0)

query
  .register(
    'role',
    new Query({
      $where: new InExpression(
        new ColumnExpression('person', 'id'),
        false,
        new Query({
          $select: 'personId',
          $from: 'person_role',
          $where: [
            new BinaryExpression(
              new ColumnExpression('person', 'id'),
              '=',
              new ColumnExpression('person_role', 'personId')
            ),
            new InExpression(new ColumnExpression('roleId'), false),
          ],
        })
      ),
    })
  )
  .register('value', 0)

query.register(
  'isActive',
  new Query({
    $where: [
      new IsNullExpression(new ColumnExpression('person', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('person', 'deletedBy'), false),
      new IsNullExpression(new ColumnExpression('parties_person', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('parties_person', 'deletedBy'), false),
      new IsNullExpression(new ColumnExpression('party', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('party', 'deletedBy'), false),
      new IsNullExpression(new ColumnExpression('person_contact', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('person_contact', 'deletedBy'), false),
    ],
  })
)

export default query
