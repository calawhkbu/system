import { Query, FromTable } from 'node-jql'

const query = new Query({
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/template',
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
      ],
    },
    'template'
  ),
})

export default query.toJson()
