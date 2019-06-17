import { QueryDef } from 'classes/query/QueryDef'
import { Query, BinaryExpression, ColumnExpression, TableOrSubquery, FunctionExpression, ParameterExpression, LikeExpression, InExpression } from 'node-jql'

const query = new QueryDef(new Query({
  $from: new TableOrSubquery(['booking', 'b'])
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

// query.register('moduleTypeCodes', new Query({
//   $where: new InExpression({ left: new ColumnExpression(['b', 'moduleTypeCode']) })
// })).register('value', 0)

query.register('boundTypeCode', new Query({
  $where: new BinaryExpression({ left: new ColumnExpression(['b', 'boundTypeCode']), operator: '=' })
})).register('value', 0)

// query.register('boundTypeCodes', new Query({
//   $where: new InExpression({ left: new ColumnExpression(['b', 'boundTypeCode']) })
// })).register('value', 0)

// query.register('shipperPartyName', new Query({
//   $where: new LikeExpression({ left: new ColumnExpression(['b', 'shipperPartyName']), operator: 'REGEXP' })
// })).register('value', 0)
//
// query.register('consigneePartyName', new Query({
//   $where: new LikeExpression({ left: new ColumnExpression(['b', 'consigneePartyName']), operator: 'REGEXP' })
// })).register('value', 0)
//
// query.register('forwarderPartyName', new Query({
//   $where: new LikeExpression({ left: new ColumnExpression(['b', 'forwarderPartyName']), operator: 'REGEXP' })
// })).register('value', 0)
//
// query.register('notifyPartyPartyName', new Query({
//   $where: new LikeExpression({ left: new ColumnExpression(['b', 'notifyPartyPartyName']), operator: 'REGEXP' })
// })).register('value', 0)
//
// query.register('agentPartyName', new Query({
//   $where: new LikeExpression({ left: new ColumnExpression(['b', 'agentPartyName']), operator: 'REGEXP' })
// })).register('value', 0)

export default query
