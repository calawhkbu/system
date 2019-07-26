import { QueryDef } from 'classes/query/QueryDef'
import {
  Query, FromTable,
  BinaryExpression, ColumnExpression, FunctionExpression, ParameterExpression,
  LikeExpression, InExpression, IsNullExpression, OrExpressions, AndExpressions,
} from 'node-jql'

const query = new QueryDef(new Query({
  $distinct: true,
  $from: new FromTable('booking', 'booking',
    {
      operator: 'LEFT',
      table: new FromTable('flex_data', 'flex_data'),
      $on: [
        new BinaryExpression(new ColumnExpression('flex_data', 'tableName'), '=', 'booking'),
        new BinaryExpression(new ColumnExpression('booking', 'id'), '=', new ColumnExpression('flex_data', 'primaryKey'))
      ]
    },
    {
      operator: 'LEFT',
      table: new FromTable('booking_amount', 'booking_amount'),
      $on: new BinaryExpression(new ColumnExpression('booking', 'id'), '=', new ColumnExpression('booking_amount', 'bookingId'))
    },
    {
      operator: 'LEFT',
      table: new FromTable('flex_data', 'booking_amount_flex_data'),
      $on: [
        new BinaryExpression(new ColumnExpression('booking_amount_flex_data', 'tableName'), '=', 'booking_amount'),
        new BinaryExpression(new ColumnExpression('booking_amount', 'id'), '=', new ColumnExpression('booking_amount_flex_data', 'primaryKey'))
      ]
    },
    {
      operator: 'LEFT',
      table: new FromTable('booking_container', 'booking_container'),
      $on: new BinaryExpression(new ColumnExpression('booking', 'id'), '=', new ColumnExpression('booking_container', 'bookingId'))
    },
    {
      operator: 'LEFT',
      table: new FromTable('flex_data', 'booking_container_flex_data'),
      $on: [
        new BinaryExpression(new ColumnExpression('booking_container_flex_data', 'tableName'), '=', 'booking_container'),
        new BinaryExpression(new ColumnExpression('booking_container', 'id'), '=', new ColumnExpression('booking_container_flex_data', 'primaryKey'))
      ]
    },
    {
      operator: 'LEFT',
      table: new FromTable('booking_popacking', 'booking_popacking'),
      $on: new BinaryExpression(new ColumnExpression('booking', 'id'), '=', new ColumnExpression('booking_popacking', 'bookingId'))
    },
    {
      operator: 'LEFT',
      table: new FromTable('flex_data', 'booking_popacking_flex_data'),
      $on: [
        new BinaryExpression(new ColumnExpression('booking_popacking_flex_data', 'tableName'), '=', 'booking_popacking'),
        new BinaryExpression(new ColumnExpression('booking_popacking', 'id'), '=', new ColumnExpression('booking_popacking_flex_data', 'primaryKey'))
      ]
    },
    {
      operator: 'LEFT',
      table: new FromTable('booking_reference', 'booking_reference'),
      $on: new BinaryExpression(new ColumnExpression('booking', 'id'), '=', new ColumnExpression('booking_reference', 'bookingId'))
    },
    {
      operator: 'LEFT',
      table: new FromTable('flex_data', 'booking_reference_flex_data'),
      $on: [
        new BinaryExpression(new ColumnExpression('booking_reference_flex_data', 'tableName'), '=', 'booking_reference'),
        new BinaryExpression(new ColumnExpression('booking_reference', 'id'), '=', new ColumnExpression('booking_reference_flex_data', 'primaryKey'))
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
  $where: new BinaryExpression(new ColumnExpression('booking', 'partyGroupCode'), '=')
})).register('value', 0)

query.register('bookingNo', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('booking', 'bookingNo'), operator: 'REGEXP' })
})).register('value', 0)

query.register('moduleTypeCode', new Query({
  $where: new BinaryExpression(new ColumnExpression('booking', 'moduleTypeCode'), '=')
})).register('value', 0)

query.register('moduleTypeCodes', new Query({
  $where: new InExpression(new ColumnExpression('booking', 'moduleTypeCode'), false)
})).register('value', 0)

query.register('boundTypeCode', new Query({
  $where: new BinaryExpression(new ColumnExpression('booking', 'boundTypeCode'), '=')
})).register('value', 0)

query.register('boundTypeCodes', new Query({
  $where: new InExpression(new ColumnExpression('booking', 'boundTypeCode'), false)
})).register('value', 0)

query.register('shipperPartyName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('booking', 'shipperPartyName'), operator: 'REGEXP' })
})).register('value', 0)

query.register('consigneePartyName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('booking', 'consigneePartyName'), operator: 'REGEXP' })
})).register('value', 0)

query.register('forwarderPartyName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('booking', 'forwarderPartyName'), operator: 'REGEXP' })
})).register('value', 0)

query.register('notifyPartyPartyName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('booking', 'notifyPartyPartyName'), operator: 'REGEXP' })
})).register('value', 0)

query.register('agentPartyName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression('booking', 'agentPartyName'), operator: 'REGEXP' })
})).register('value', 0)

query.register('q', new Query({
  $where: new OrExpressions({
    expressions: [
      new LikeExpression({ left: new ColumnExpression('booking', 'bookingNo'), operator: 'REGEXP' }),
      new LikeExpression({ left: new ColumnExpression('booking', 'carrierCode'), operator: 'REGEXP' }),
      new LikeExpression({ left: new ColumnExpression('booking', 'vesselName'), operator: 'REGEXP' }),
      new LikeExpression({ left: new ColumnExpression('booking', 'voyageFlightNumber'), operator: 'REGEXP' }),
      new LikeExpression({ left: new ColumnExpression('booking', 'commodity'), operator: 'REGEXP' }),
      new LikeExpression({ left: new ColumnExpression('booking', 'polHSCode'), operator: 'REGEXP' }),
      new LikeExpression({ left: new ColumnExpression('booking', 'podHSCode'), operator: 'REGEXP' }),
      new LikeExpression({ left: new ColumnExpression('booking', 'placeOfReceiptCode'), operator: 'REGEXP' }),
      new LikeExpression({ left: new ColumnExpression('booking', 'portOfLoadingCode'), operator: 'REGEXP' }),
      new LikeExpression({ left: new ColumnExpression('booking', 'portOfDischargeCode'), operator: 'REGEXP' }),
      new LikeExpression({ left: new ColumnExpression('booking', 'placeOfDeliveryCode'), operator: 'REGEXP' }),
      new LikeExpression({ left: new ColumnExpression('booking', 'finalDestinationCode'), operator: 'REGEXP' }),
      new LikeExpression({ left: new ColumnExpression('booking', 'shipperPartyName'), operator: 'REGEXP' }),
      new LikeExpression({ left: new ColumnExpression('booking', 'shipperPartyContactName'), operator: 'REGEXP' }),
      new LikeExpression({ left: new ColumnExpression('booking', 'consigneePartyName'), operator: 'REGEXP' }),
      new LikeExpression({ left: new ColumnExpression('booking', 'consigneePartyContactName'), operator: 'REGEXP' }),
      new LikeExpression({ left: new ColumnExpression('booking', 'forwarderPartyName'), operator: 'REGEXP' }),
      new LikeExpression({ left: new ColumnExpression('booking', 'forwarderPartyContactName'), operator: 'REGEXP' }),
      new LikeExpression({ left: new ColumnExpression('booking', 'notifyPartyPartyName'), operator: 'REGEXP' }),
      new LikeExpression({ left: new ColumnExpression('booking', 'notifyPartyPartyContactName'), operator: 'REGEXP' }),
      new LikeExpression({ left: new ColumnExpression('booking', 'agentPartyName'), operator: 'REGEXP' }),
      new LikeExpression({ left: new ColumnExpression('booking', 'agentPartyContactName'), operator: 'REGEXP' }),
      new LikeExpression({ left: new ColumnExpression('booking_amount', 'amountName'), operator: 'REGEXP' }),
      new LikeExpression({ left: new ColumnExpression('booking_container', 'containerNo'), operator: 'REGEXP' }),
      new LikeExpression({ left: new ColumnExpression('booking_container', 'sealNo'), operator: 'REGEXP' }),
      new LikeExpression({ left: new ColumnExpression('booking_reference', 'refName'), operator: 'REGEXP' }),
      new LikeExpression({ left: new ColumnExpression('booking_reference', 'refDescription'), operator: 'REGEXP' })
    ]
  })
})).register('value', 0).register('value', 1).register('value', 2).register('value', 3).register('value', 4).register('value', 5)
.register('value', 6).register('value', 7).register('value', 8).register('value', 9).register('value', 10).register('value', 11)
.register('value', 12).register('value', 13).register('value', 14).register('value', 15).register('value', 16).register('value', 17)
.register('value', 18).register('value', 19).register('value', 20).register('value', 21).register('value', 22).register('value', 23)
.register('value', 24).register('value', 25).register('value', 26)

query.register('isActive', new Query({
  $where: new AndExpressions({
    expressions: [
      new IsNullExpression(new ColumnExpression('booking', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('booking', 'deletedBy'), false),
      new IsNullExpression(new ColumnExpression('flex_data', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('flex_data', 'deletedBy'), false),
      new IsNullExpression(new ColumnExpression('booking_amount', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('booking_amount', 'deletedBy'), false),
      new IsNullExpression(new ColumnExpression('booking_amount_flex_data', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('booking_amount_flex_data', 'deletedBy'), false),
      new IsNullExpression(new ColumnExpression('booking_container', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('booking_container', 'deletedBy'), false),
      new IsNullExpression(new ColumnExpression('booking_container_flex_data', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('booking_container_flex_data', 'deletedBy'), false),
      new IsNullExpression(new ColumnExpression('booking_popacking', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('booking_popacking', 'deletedBy'), false),
      new IsNullExpression(new ColumnExpression('booking_popacking_flex_data', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('booking_popacking_flex_data', 'deletedBy'), false),
      new IsNullExpression(new ColumnExpression('booking_reference', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('booking_reference', 'deletedBy'), false),
      new IsNullExpression(new ColumnExpression('booking_reference_flex_data', 'deletedAt'), false),
      new IsNullExpression(new ColumnExpression('booking_reference_flex_data', 'deletedBy'), false),
    ]
  })
}))

export default query
