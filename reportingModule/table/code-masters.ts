import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callAxios',
      injectParams: true,
      axiosConfig: {
        method: 'POST',
        url: 'api/code/query/code_master',
      },
    }
  ],
  columns: [
    { key: 'id' },
    { key: 'partyGroupCode' },
    { key: 'codeType' },
    { key: 'code' },
    { key: 'name' },
    { key: 'canResetDefault' },
  ]
} as JqlDefinition

/* import { Query, FromTable, FunctionExpression, ColumnExpression, ResultColumn } from 'node-jql'

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
        { name: 'name', type: 'string' },
        { name: 'canResetDefault', type: 'boolean' },
      ],
    },
    'code_master'
  ),
})

export default query.toJson() */
