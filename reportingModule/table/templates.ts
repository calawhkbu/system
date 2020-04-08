import { Query, FromTable } from 'node-jql'

const query = new Query({
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/template/query/template',
      columns: [
        {
          name: 'id',
          type: 'number',
        },
        {
          name: 'templateName',
          type: 'string',
        },
        {
          name: 'extension',
          type: 'string',
        },

        {
          name: 'canDelete',
          type: 'number',
        },
        {
          name: 'canRestore',
          type: 'number',
        },
      ],
    },
    'template'
  ),
})

export default query.toJson()
