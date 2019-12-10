import { Query, FromTable, FunctionExpression, ColumnExpression, ResultColumn } from 'node-jql'

const query = new Query({
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/cardAccess/query/card_access',
      columns: [

        { name: 'id', type: 'number' },
        { name: 'name', type: 'string' },
        { name: 'partyGroupCode', type: 'string' },
        { name:  'cardId', type: 'string' },
        { name: 'disabled', type: 'boolean' },
        { name: 'partyGroupSpecific', type: 'boolean' },
        { name: 'isActive', type: 'number' },
        { name: 'canDelete', type: 'number' },
        { name: 'canRestore', type: 'number' }
      ],
    },
    'card_access'
  ),
})

export default query.toJson()
