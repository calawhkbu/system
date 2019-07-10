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
        tableOrSubquery: new TableOrSubquery(['flex_data', 'fd']),
        $on: [
          new BinaryExpression({
            left: new ColumnExpression(['fd', 'tableName']),
            operator: '=',
            right: 'booking'
          }),
          new BinaryExpression({
            left: new ColumnExpression(['b', 'id']),
            operator: '=',
            right: new ColumnExpression(['fd', 'primaryKey'])
          })
        ]
      },
      {
        operator: 'LEFT',
        tableOrSubquery: new TableOrSubquery(['booking_amount', 'ba']),
        $on: [
          new BinaryExpression({
            left: new ColumnExpression(['b', 'id']),
            operator: '=',
            right: new ColumnExpression(['ba', 'bookingId'])
          })
        ]
      },
      {
        operator: 'LEFT',
        tableOrSubquery: new TableOrSubquery(['flex_data', 'bafd']),
        $on: [
          new BinaryExpression({
            left: new ColumnExpression(['bafd', 'tableName']),
            operator: '=',
            right: 'booking_amount'
          }),
          new BinaryExpression({
            left: new ColumnExpression(['ba', 'id']),
            operator: '=',
            right: new ColumnExpression(['bafd', 'primaryKey'])
          })
        ]
      },
      {
        operator: 'LEFT',
        tableOrSubquery: new TableOrSubquery(['booking_container', 'bc']),
        $on: [
          new BinaryExpression({
            left: new ColumnExpression(['b', 'id']),
            operator: '=',
            right: new ColumnExpression(['bc', 'bookingId'])
          })
        ]
      },
      {
        operator: 'LEFT',
        tableOrSubquery: new TableOrSubquery(['flex_data', 'bcfd']),
        $on: [
          new BinaryExpression({
            left: new ColumnExpression(['bcfd', 'tableName']),
            operator: '=',
            right: 'booking_container'
          }),
          new BinaryExpression({
            left: new ColumnExpression(['bc', 'id']),
            operator: '=',
            right: new ColumnExpression(['bcfd', 'primaryKey'])
          })
        ]
      },
      {
        operator: 'LEFT',
        tableOrSubquery: new TableOrSubquery(['booking_popacking', 'bpp']),
        $on: [
          new BinaryExpression({
            left: new ColumnExpression(['b', 'id']),
            operator: '=',
            right: new ColumnExpression(['bpp', 'bookingId'])
          })
        ]
      },
      {
        operator: 'LEFT',
        tableOrSubquery: new TableOrSubquery(['flex_data', 'bppfd']),
        $on: [
          new BinaryExpression({
            left: new ColumnExpression(['bppfd', 'tableName']),
            operator: '=',
            right: 'booking_popacking'
          }),
          new BinaryExpression({
            left: new ColumnExpression(['bpp', 'id']),
            operator: '=',
            right: new ColumnExpression(['bppfd', 'primaryKey'])
          })
        ]
      },
      {
        operator: 'LEFT',
        tableOrSubquery: new TableOrSubquery(['booking_reference', 'br']),
        $on: [
          new BinaryExpression({
            left: new ColumnExpression(['b', 'id']),
            operator: '=',
            right: new ColumnExpression(['br', 'bookingId'])
          })
        ]
      },
      {
        operator: 'LEFT',
        tableOrSubquery: new TableOrSubquery(['flex_data', 'brfd']),
        $on: [
          new BinaryExpression({
            left: new ColumnExpression(['brfd', 'tableName']),
            operator: '=',
            right: 'booking_reference'
          }),
          new BinaryExpression({
            left: new ColumnExpression(['br', 'id']),
            operator: '=',
            right: new ColumnExpression(['brfd', 'primaryKey'])
          })
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
    new IsNullExpression({ left: new ColumnExpression(['fd', 'deletedAt']) }),
    new IsNullExpression({ left: new ColumnExpression(['fd', 'deletedBy']) }),
    new IsNullExpression({ left: new ColumnExpression(['ba', 'deletedAt']) }),
    new IsNullExpression({ left: new ColumnExpression(['ba', 'deletedBy']) }),
    new IsNullExpression({ left: new ColumnExpression(['bafd', 'deletedAt']) }),
    new IsNullExpression({ left: new ColumnExpression(['bafd', 'deletedBy']) }),
    new IsNullExpression({ left: new ColumnExpression(['bc', 'deletedAt']) }),
    new IsNullExpression({ left: new ColumnExpression(['bc', 'deletedBy']) }),
    new IsNullExpression({ left: new ColumnExpression(['bcfd', 'deletedAt']) }),
    new IsNullExpression({ left: new ColumnExpression(['bcfd', 'deletedBy']) }),
    new IsNullExpression({ left: new ColumnExpression(['bpp', 'deletedAt']) }),
    new IsNullExpression({ left: new ColumnExpression(['bppfd', 'deletedBy']) }),
    new IsNullExpression({ left: new ColumnExpression(['br', 'deletedAt']) }),
    new IsNullExpression({ left: new ColumnExpression(['br', 'deletedBy']) }),
    new IsNullExpression({ left: new ColumnExpression(['brfd', 'deletedAt']) }),
    new IsNullExpression({ left: new ColumnExpression(['brfd', 'deletedBy']) }),
  ]
}))

export default query
