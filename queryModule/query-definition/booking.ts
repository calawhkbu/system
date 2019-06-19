import { QueryDef } from 'classes/query/QueryDef'
import { Query, JoinedTableOrSubquery,
  BinaryExpression, ColumnExpression, TableOrSubquery, FunctionExpression, ParameterExpression, LikeExpression, InExpression, IsNullExpression
} from 'node-jql'

const query = new QueryDef(new Query({
  $distinct: true,
  $from: new JoinedTableOrSubquery({
    table: 'booking',
    $as: 'b',
    joinClauses: [
      {
        operator: 'LEFT',
        tableOrSubquery: new TableOrSubquery(['booking_amount', 'ba']),
        $on: [
          new BinaryExpression({ left: new ColumnExpression(['b', 'id']), operator: '=', right: new ColumnExpression(['ba', 'bookingId']) }),
          new IsNullExpression({ left: new ColumnExpression(['ba', 'deletedAt']) }),
          new IsNullExpression({ left: new ColumnExpression(['ba', 'deletedBy']) })
        ]
      },
      {
        operator: 'LEFT',
        tableOrSubquery: new TableOrSubquery(['booking_container', 'bc']),
        $on: [
          new BinaryExpression({ left: new ColumnExpression(['b', 'id']), operator: '=', right: new ColumnExpression(['bc', 'bookingId']) }),
          new IsNullExpression({ left: new ColumnExpression(['bc', 'deletedAt']) }),
          new IsNullExpression({ left: new ColumnExpression(['bc', 'deletedBy']) })
        ]
      },
      {
        operator: 'LEFT',
        tableOrSubquery: new TableOrSubquery(['booking_reference', 'br']),
        $on: [
          new BinaryExpression({ left: new ColumnExpression(['b', 'id']), operator: '=', right: new ColumnExpression(['br', 'bookingId']) }),
          new IsNullExpression({ left: new ColumnExpression(['br', 'deletedAt']) }),
          new IsNullExpression({ left: new ColumnExpression(['br', 'deletedBy']) })
        ]
      }
    ]
  }),
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
  $where: new BinaryExpression({ left: new ColumnExpression(['b', 'partyGroupCode']), operator: '=' })
})).register('value', 0)

query.register('bookingNo', new Query({
  $where: new LikeExpression({ left: new ColumnExpression(['b', 'bookingNo']), operator: 'REGEXP' })
})).register('value', 0)

query.register('moduleTypeCode', new Query({
  $where: new BinaryExpression({ left: new ColumnExpression(['b', 'moduleTypeCode']), operator: '=' })
})).register('value', 0)

query.register('moduleTypeCodes', new Query({
  $where: new InExpression({ left: new ColumnExpression(['b', 'moduleTypeCode']) })
})).register('value', 0)

query.register('boundTypeCode', new Query({
  $where: new BinaryExpression({ left: new ColumnExpression(['b', 'boundTypeCode']), operator: '=' })
})).register('value', 0)

query.register('boundTypeCodes', new Query({
  $where: new InExpression({ left: new ColumnExpression(['b', 'boundTypeCode']) })
})).register('value', 0)

query.register('shipperPartyName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression(['b', 'shipperPartyName']), operator: 'REGEXP' })
})).register('value', 0)

query.register('consigneePartyName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression(['b', 'consigneePartyName']), operator: 'REGEXP' })
})).register('value', 0)

query.register('forwarderPartyName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression(['b', 'forwarderPartyName']), operator: 'REGEXP' })
})).register('value', 0)

query.register('notifyPartyPartyName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression(['b', 'notifyPartyPartyName']), operator: 'REGEXP' })
})).register('value', 0)

query.register('agentPartyName', new Query({
  $where: new LikeExpression({ left: new ColumnExpression(['b', 'agentPartyName']), operator: 'REGEXP' })
})).register('value', 0)

query.register('isActive', new Query({
  $where: [
    new IsNullExpression({ left: new ColumnExpression(['b', 'deletedAt']) }),
    new IsNullExpression({ left: new ColumnExpression(['b', 'deletedBy']) }),
  ]
}))

export default query
