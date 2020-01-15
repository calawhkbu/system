import { Query, FromTable } from 'node-jql'

const query = new Query({
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/api/query/api',
      columns: [
        { name: 'tableName', type: 'string' },
        { name: 'primaryKey', type: 'string' },
        { name: 'alertCategory', type: 'string' },
        { name: 'alertType', type: 'string' },
        { name: 'alertContent', type: 'string' },
        { name: 'severity', type: 'string' },
        { name: 'status', type: 'string' },
      ],
    },
    'alert'
  ),
})

export default query.toJson()
