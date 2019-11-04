import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
  FromTable,
  BinaryExpression,
  ColumnExpression,
  RegexpExpression,
  IsNullExpression,
  InExpression,
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

query
  .register(
    'invitationStatus',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('invitation', 'status'), '='),
    })
  )
  .register('value', 0)

query
  .register(
    'invitationStatuses',
    new Query({
      $where: new InExpression(new ColumnExpression('invitation', 'status'), false),
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
