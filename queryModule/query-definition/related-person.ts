import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
  ResultColumn,
  FromTable,
  ColumnExpression,
  BinaryExpression,
  IsNullExpression,
  FunctionExpression,
  MathExpression,
  ParameterExpression,
  QueryExpression,
  Value,
  GroupBy
} from 'node-jql'

const query = new QueryDef(
  new Query({
    $from: new FromTable(new Query({
      $select: [
        new ResultColumn(new ColumnExpression('related_person', 'id')),
        new ResultColumn(new ColumnExpression('related_person', 'partyId')),
        new ResultColumn(new ColumnExpression('related_person', 'personId')),
        new ResultColumn(new FunctionExpression('IFNULL',
          new ColumnExpression('person', 'userName'),
          new ColumnExpression('related_person', 'email'))
        , 'email'),
        new ResultColumn(new FunctionExpression('IFNULL',
          new MathExpression(new ColumnExpression('person', 'firstName'), '+', new ColumnExpression('person', 'lastName')),
          new ColumnExpression('related_person', 'name'))
        , 'name'),
        new ResultColumn(new FunctionExpression('IFNULL',
          new QueryExpression(new Query({
            $select: new ResultColumn(new FunctionExpression('GROUP_CONCAT', new ParameterExpression('DISTINCT', new ColumnExpression('person_contact', 'content'), 'SEPARATOR \', \'')), 'phone'),
            $from: 'person_contact',
            $where: [
              new BinaryExpression(new ColumnExpression('person', 'id'), '=', new ColumnExpression('person_contact', 'personId')),
              new BinaryExpression(new ColumnExpression('person_contact', 'contactType'), '=', new Value('phone')),
              new IsNullExpression(new ColumnExpression('person_contact', 'deletedAt'), false),
              new IsNullExpression(new ColumnExpression('person_contact', 'deletedBy'), false),
            ],
            $group: new GroupBy(new ColumnExpression('person_contact', 'personId'))
          })),
          new ColumnExpression('related_person', 'phone'))
        , 'phone'),
        new ResultColumn(new ColumnExpression('related_person', 'deletedAt')),
        new ResultColumn(new ColumnExpression('related_person', 'deletedBy'))
      ],
      $from: new FromTable(
        'related_person',
        {
          operator: 'LEFT',
          table: 'person',
          $on: new BinaryExpression(new ColumnExpression('related_person', 'personId'), '=', new ColumnExpression('person', 'id')),
        },
      ),
      $where: [
        new IsNullExpression(new ColumnExpression('person', 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression('person', 'deletedBy'), false),
      ]
    }), 'related_person', {
      operator: 'LEFT',
      table: 'party',
      $on: new BinaryExpression(new ColumnExpression('related_person', 'partyId'), '=', new ColumnExpression('party', 'id'))
    }),
    $where: [
      new IsNullExpression(new ColumnExpression('related_person', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('related_person', 'deletedBy'), false),
    ],
  })
)

query.register(
  'id',
  new Query({
    $where: new BinaryExpression(new ColumnExpression('related_person', 'id'), '='),
  })
).register('value', 0)

query.register(
  'partyId',
  new Query({
    $where: new BinaryExpression(new ColumnExpression('related_person', 'partyId'), '='),
  })
).register('value', 0)

query.register('showDelete', {
  expression: new Value(1),
  $as: 'showDelete'
})

query.register('showResend', {
  expression: new Value(1),
  $as: 'showResend'
})

export default query
