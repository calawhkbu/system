import { Query, FromTable, FunctionExpression, ColumnExpression, ResultColumn } from 'node-jql'

const query = new Query({
  $from: new FromTable(
    {
      method: 'GET',
      url: 'api/i18n',
      columns: [
        { name: 'id', type: 'number' },
        { name: 'partyGroupCode', type: 'string' },
        { name: 'version', type: 'number' },
        { name: 'category', type: 'string' },
        { name: 'key', type: 'string' },
        { name: 'value', type: 'string' }
      ],
    },
    'i18n'
  ),
})

export default query.toJson()
