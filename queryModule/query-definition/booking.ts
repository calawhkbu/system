import { QueryDef } from 'classes/query/QueryDef'
import { Query, FromTable, BinaryExpression, ColumnExpression, FunctionExpression, ParameterExpression, LikeExpression, InExpression, IsNullExpression } from 'node-jql'

const query = new QueryDef(new Query({
  $distinct: true,
  $from: new FromTable('booking', 'b',
    {
      operator: 'LEFT',
      table: new FromTable('flex_data', 'fd'),
      $on: [
        new BinaryExpression(new ColumnExpression('fd', 'tableName'), '=', 'booking'),
        new BinaryExpression(new ColumnExpression('b', 'id'), '=', new ColumnExpression('fd', 'primaryKey'))
      ]
    },
    {
      operator: 'LEFT',
      table: new FromTable('booking_amount', 'ba'),
      $on: new BinaryExpression(new ColumnExpression('b', 'id'), '=', new ColumnExpression('ba', 'bookingId'))
    },
    {
      operator: 'LEFT',
      table: new FromTable('flex_data', 'bafd'),
      $on: [
        new BinaryExpression(new ColumnExpression('bafd', 'tableName'), '=', 'booking_amount'),
        new BinaryExpression(new ColumnExpression('ba', 'id'), '=', new ColumnExpression('bafd', 'primaryKey'))
      ]
    },
    {
      operator: 'LEFT',
      table: new FromTable('booking_container', 'bc'),
      $on: new BinaryExpression(new ColumnExpression('b', 'id'), '=', new ColumnExpression('bc', 'bookingId'))
    },
    {
      operator: 'LEFT',
      table: new FromTable('flex_data', 'bcfd'),
      $on: [
        new BinaryExpression(new ColumnExpression('bcfd', 'tableName'), '=', 'booking_container'),
        new BinaryExpression(new ColumnExpression('bc', 'id'), '=', new ColumnExpression('bcfd', 'primaryKey'))
      ]
    },
    {
      operator: 'LEFT',
      table: new FromTable('booking_popacking', 'bpp'),
      $on: new BinaryExpression(new ColumnExpression('b', 'id'), '=', new ColumnExpression('bpp', 'bookingId'))
    },
    {
      operator: 'LEFT',
      table: new FromTable('flex_data', 'bppfd'),
      $on: [
        new BinaryExpression(new ColumnExpression('bppfd', 'tableName'), '=', 'booking_popacking'),
        new BinaryExpression(new ColumnExpression('bpp', 'id'), '=', new ColumnExpression('bppfd', 'primaryKey'))
      ]
    },
    {
      operator: 'LEFT',
      table: new FromTable('booking_reference', 'br'),
      $on: new BinaryExpression(new ColumnExpression('b', 'id'), '=', new ColumnExpression('br', 'bookingId'))
    },
    {
      operator: 'LEFT',
      table: new FromTable('flex_data', 'brfd'),
      $on: [
        new BinaryExpression(new ColumnExpression('brfd', 'tableName'), '=', 'booking_reference'),
        new BinaryExpression(new ColumnExpression('br', 'id'), '=', new ColumnExpression('brfd', 'primaryKey'))
      ]
    }
  ),
}))

query.register('noOfBookings', {
  expression: new FunctionExpression({
    name: 'COUNT',
    parameters: new ParameterExpression({
      prefix: 'DISTINCT',
      expression: new ColumnExpression('*')
    })
  }),
  $as: 'noOfBookings'
})

query.register('partyGroupCode', new Query({
  $where: new BinaryExpression(new ColumnExpression('b', 'partyGroupCode'), '=')
})).register('value', 0)

query.register('bookingNo', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('b', 'bookingNo'), operator: 'REGEXP' })
})).register('value', 0)

query.register('moduleTypeCode', new Query({
  $where: new BinaryExpression(new ColumnExpression('b', 'moduleTypeCode'), '=')
})).register('value', 0)

query.register('moduleTypeCodes', new Query({
  $where: new InExpression(new ColumnExpression('b', 'moduleTypeCode'))
})).register('value', 0)

query.register('boundTypeCode', new Query({
  $where: new BinaryExpression(new ColumnExpression('b', 'boundTypeCode'), '=')
})).register('value', 0)

query.register('boundTypeCodes', new Query({
  $where: new InExpression(new ColumnExpression('b', 'boundTypeCode'))
})).register('value', 0)

query.register('shipperPartyName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('b', 'shipperPartyName'), operator: 'REGEXP' })
})).register('value', 0)

query.register('consigneePartyName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('b', 'consigneePartyName'), operator: 'REGEXP' })
})).register('value', 0)

query.register('forwarderPartyName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('b', 'forwarderPartyName'), operator: 'REGEXP' })
})).register('value', 0)

query.register('notifyPartyPartyName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('b', 'notifyPartyPartyName'), operator: 'REGEXP' })
})).register('value', 0)

query.register('agentPartyName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('b', 'agentPartyName'), operator: 'REGEXP' })
})).register('value', 0)

query.register('isActive', new Query({
  $where: [
    new IsNullExpression(new ColumnExpression('b', 'deletedAt')),
    new IsNullExpression(new ColumnExpression('b', 'deletedBy')),
    new IsNullExpression(new ColumnExpression('fd', 'deletedAt')),
    new IsNullExpression(new ColumnExpression('fd', 'deletedBy')),
    new IsNullExpression(new ColumnExpression('ba', 'deletedAt')),
    new IsNullExpression(new ColumnExpression('ba', 'deletedBy')),
    new IsNullExpression(new ColumnExpression('bafd', 'deletedAt')),
    new IsNullExpression(new ColumnExpression('bafd', 'deletedBy')),
    new IsNullExpression(new ColumnExpression('bc', 'deletedAt')),
    new IsNullExpression(new ColumnExpression('bc', 'deletedBy')),
    new IsNullExpression(new ColumnExpression('bcfd', 'deletedAt')),
    new IsNullExpression(new ColumnExpression('bcfd', 'deletedBy')),
    new IsNullExpression(new ColumnExpression('bpp', 'deletedAt')),
    new IsNullExpression(new ColumnExpression('bppfd', 'deletedBy')),
    new IsNullExpression(new ColumnExpression('br', 'deletedAt')),
    new IsNullExpression(new ColumnExpression('br', 'deletedBy')),
    new IsNullExpression(new ColumnExpression('brfd', 'deletedAt')),
    new IsNullExpression(new ColumnExpression('brfd', 'deletedBy')),
  ]
}))

export default query
