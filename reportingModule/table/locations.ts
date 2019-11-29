import { Query, FromTable, FunctionExpression, ColumnExpression, ResultColumn } from 'node-jql'

const query = new Query({
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/location/query/location',
      columns: [
        { name: 'id', type: 'number' },
        { name: 'countryCode', type: 'string' },
        { name: 'locationCode', type: 'string' },
        { name: 'portCode', type: 'string' },
        { name: 'moduleTypeCode', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'isActive', type: 'boolean' },
        { name: 'canDelete', type: 'boolean' },
        { name: 'canRestore', type: 'boolean' }
      ],
    },
    'location'
  ),
})

export default query.toJson()
