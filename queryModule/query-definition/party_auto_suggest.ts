import { QueryDef } from 'classes/query/QueryDef'
import { Query, ResultColumn, FromTable, OrExpressions, LikeExpression, ColumnExpression, BinaryExpression, InExpression, IsNullExpression } from 'node-jql'

const query = new QueryDef(new Query({
  $distinct: true,
  $select: [
    new ResultColumn(new ColumnExpression('pa', 'id'), 'partyId'),
    new ResultColumn(new ColumnExpression('pa', 'name'), 'partyName'),
    new ResultColumn(new ColumnExpression('pa', 'erpCode'), 'partyCode'),
    new ResultColumn(new ColumnExpression('pa', 'phone'), 'partyPhone'),
    new ResultColumn(new ColumnExpression('pa', 'fax'), 'partyFax'),
    new ResultColumn(new ColumnExpression('pa', 'email'), 'partyEmail'),
    new ResultColumn(new ColumnExpression('pa', 'address'), 'partyAddress'),
    new ResultColumn(new ColumnExpression('pa', 'cityCode'), 'partyCityCode'),
    new ResultColumn(new ColumnExpression('pa', 'stateCode'), 'partyStateCode'),
    new ResultColumn(new ColumnExpression('pa', 'countryCode'), 'partyCountryCode'),
    new ResultColumn(new ColumnExpression('pa', 'zip'), 'partyZip'),
    new ResultColumn(new ColumnExpression('pe', 'id'), 'contactPersonId'),
    new ResultColumn(new ColumnExpression('pe', 'displayName'), 'contactPersonName'),
    // TODO new ResultColumn({ expression: 'TODO', $as: 'contactPersonPhone' }),
    new ResultColumn(new ColumnExpression('pe', 'userName'), 'contactPersonEmail')
  ],
  $from: new FromTable('party', 'pa',
    {
      operator: 'LEFT',
      table: new FromTable('party_type', 'pt'),
      $on: new BinaryExpression(new ColumnExpression('pa', 'id'), '=', new ColumnExpression('pt', 'partyId'))
    },
    {
      operator: 'LEFT',
      table: new FromTable('parties_person', 'pp'),
      $on: new BinaryExpression(new ColumnExpression('pa', 'id'), '=', new ColumnExpression('pp', 'partyId')),
    },
    {
      operator: 'LEFT',
      table: new FromTable('person', 'pe'),
      $on: new BinaryExpression(new ColumnExpression('pe', 'id'), '=', new ColumnExpression('pp', 'personId')),
    }
  ),
}))

query.register('id', new Query({
  $where: new BinaryExpression(new ColumnExpression('pa', 'id'), '=')
})).register('value', 0)

query.register('isBranch', new Query({
  $where: new BinaryExpression(new ColumnExpression('pa', 'isBranch'), '=')
})).register('value', 0)

query.register('name', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('pa', 'name'), operator: 'REGEXP' })
})).register('value', 0)

query.register('customCode', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('pa', 'erpCode'), operator: 'REGEXP' })
})).register('value', 0)

query.register('shortName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('pa', 'shortName'), operator: 'REGEXP' })
})).register('value', 0)

query.register('groupName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('pa', 'groupName'), operator: 'REGEXP' })
})).register('value', 0)

query.register('email', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('pa', 'email'), operator: 'REGEXP' })
})).register('value', 0)

query.register('isActive', new Query({
  $where: [
    new IsNullExpression(new ColumnExpression('pa', 'deletedAt')),
    new IsNullExpression(new ColumnExpression('pa', 'deletedBy')),
  ]
}))

query.register('partyTypes', new Query({
  $where: new InExpression(new ColumnExpression('pt', 'type'))
})).register('value', 0)

query.register('q', new Query({
  $where: new OrExpressions([
    new LikeExpression({ left: new ColumnExpression('pa', 'name'), operator: 'REGEXP' }),
    new LikeExpression({ left: new ColumnExpression('pa', 'shortName'), operator: 'REGEXP' }),
    new LikeExpression({ left: new ColumnExpression('pa', 'erpCode'), operator: 'REGEXP' })
  ])
})).register('value', 0).register('value', 1).register('value', 2)

export default query
