import { Query, FromTable, FunctionExpression, ColumnExpression, ResultColumn } from 'node-jql'

const query = new Query({
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/code/query/code_master',
      columns: [
        { name: 'id', type: 'number' },
        { name: 'partyGroupCode', type: 'string' },
        { name: 'codeType', type: 'string' },
        { name: 'code', type: 'string' },
        { name: 'name', type: 'string' }
      ],
    },
    'code_master'
  ),
})

export default query.toJson()
