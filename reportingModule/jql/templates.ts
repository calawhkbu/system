import { Query, TableOrSubquery } from 'node-jql'

const query = new Query({
  $from: new TableOrSubquery({
    table: {
      method: 'POST',
      url: 'q/template',
      columns: [
        {
          name: 'id',
          type: 'number'
        },
        {
          name: 'templateName',
          type: 'string'
        },
        {
          name: 'fileType',
          type: 'string'
        },
        {
          name: 'extension',
          type: 'string'
        },
        {
          name: 'format',
          type: 'string'
        }
      ]
    },
    $as: 'template'
  })
})

export default query.toJson()
