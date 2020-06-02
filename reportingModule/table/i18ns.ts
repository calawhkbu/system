import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceQuery: ['i18n', 'i18n']
    }
  ],
  columns: [
    { key: 'id' },
    { key: 'partyGroupCode' },
    { key: 'version' },
    { key: 'category' },
    { key: 'key' },
    { key: 'value' },
    { key: 'canResetDefault' }
  ]
} as JqlDefinition

/* import { Query, FromTable, FunctionExpression, ColumnExpression, ResultColumn } from 'node-jql'

const query = new Query({
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/i18n/query/i18n',
      columns: [
        { name: 'id', type: 'number' },
        { name: 'partyGroupCode', type: 'string' },
        { name: 'version', type: 'number' },
        { name: 'category', type: 'string' },
        { name: 'key', type: 'string' },
        { name: 'value', type: 'string' },
        { name: 'canResetDefault', type: 'boolean' }
      ],
    },
    'i18n'
  ),
})

export default query.toJson() */
