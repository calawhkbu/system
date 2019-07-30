import { QueryDef } from 'classes/query/QueryDef'
import { Query, FromTable, BinaryExpression, ColumnExpression, RegexpExpression, IsNullExpression, InExpression } from 'node-jql'

const query = new QueryDef(new Query({
  $distinct: true,
  $from: new FromTable('person', 'person',
    {
      operator: 'LEFT',
      table: new FromTable('invitation', 'invitation'),
      $on: [
        new BinaryExpression(new ColumnExpression('person', 'id'), '=', new ColumnExpression('invitation', 'personId'))
      ]
    },
    {
      operator: 'LEFT',
      table: new FromTable('parties_person', 'parties_person'),
      $on: [
        new BinaryExpression(new ColumnExpression('person', 'id'), '=', new ColumnExpression('parties_person', 'personId'))
      ]
    },
    {
      operator: 'LEFT',
      table: new FromTable('party', 'party'),
      $on: [
        new BinaryExpression(new ColumnExpression('party', 'id'), '=', new ColumnExpression('parties_person', 'partyId'))
      ]
    },
    {
      operator: 'LEFT',
      table: new FromTable('party_group', 'party_group'),
      $on: [
        new BinaryExpression(new ColumnExpression('party_group', 'code'), '=', new ColumnExpression('party', 'partyGroupCode'))
      ]
    },
    {
      operator: 'LEFT',
      table: new FromTable('person_role', 'person_role'),
      $on: new BinaryExpression(new ColumnExpression('person_role', 'personId'), '=', new ColumnExpression('person', 'id'))
    },
    {
      operator: 'LEFT',
      table: new FromTable('role', 'role'),
      $on: [
        new BinaryExpression(new ColumnExpression('role', 'id'), '=', new ColumnExpression('person_role', 'roleId'))
      ]
    },
    {
      operator: 'LEFT',
      table: new FromTable('person_contact', 'person_contact'),
      $on: [
        new BinaryExpression(new ColumnExpression('person', 'id'), '=', new ColumnExpression('person_contact', 'personId'))
      ]
    }
  ),
}))

query.register('invitationStatus', new Query({
  $where: new BinaryExpression(new ColumnExpression('invitation', 'status'), '=')
})).register('value', 0)

query.register('invitationStatuses', new Query({
  $where: new InExpression(new ColumnExpression('invitation', 'status'), false)
})).register('value', 0)

query.register('userName', new Query({
  $where: new RegexpExpression(new ColumnExpression('person', 'userName'), false)
})).register('value', 0)

query.register('firstName', new Query({
  $where: new RegexpExpression(new ColumnExpression('person', 'firstName'), false)
})).register('value', 0)

query.register('lastName', new Query({
  $where: new RegexpExpression(new ColumnExpression('person', 'lastName'), false)
})).register('value', 0)

query.register('displayName', new Query({
  $where: new RegexpExpression(new ColumnExpression('person', 'displayName'), false)
})).register('value', 0)

query.register('isActive', new Query({
  $where: [
    new IsNullExpression(new ColumnExpression('person', 'deletedAt'), false),
    new IsNullExpression(new ColumnExpression('person', 'deletedBy'), false),
    new IsNullExpression(new ColumnExpression('parties_person', 'deletedAt'), false),
    new IsNullExpression(new ColumnExpression('parties_person', 'deletedBy'), false),
    new IsNullExpression(new ColumnExpression('party', 'deletedAt'), false),
    new IsNullExpression(new ColumnExpression('party', 'deletedBy'), false),
    new IsNullExpression(new ColumnExpression('party_group', 'deletedAt'), false),
    new IsNullExpression(new ColumnExpression('party_group', 'deletedBy'), false),
    new IsNullExpression(new ColumnExpression('person_contact', 'deletedAt'), false),
    new IsNullExpression(new ColumnExpression('person_contact', 'deletedBy'), false),
    new IsNullExpression(new ColumnExpression('role', 'deletedAt'), false),
    new IsNullExpression(new ColumnExpression('role', 'deletedBy'), false),
  ]
}))

export default query
