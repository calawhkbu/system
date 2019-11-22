import { Query, FromTable, FunctionExpression, ColumnExpression, ResultColumn } from 'node-jql'

const query = new Query({
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/cardAccess/query/card_access',
      columns: [

        { name: 'id', type: 'number' },
        { name: 'partyGroupCode', type: 'string' },
        { name:  'cardId', type: 'string' },
        { name: 'disabled', type: 'boolean' },
        { name: 'partyGroupSpecific', type: 'boolean' }
      ],
    },
    'card_access'
  ),
})

export default query.toJson()
