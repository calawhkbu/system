import { Query, TableOrSubquery } from 'node-jql'

const query = new Query({
  $from: new TableOrSubquery({
    table: {
      method: 'POST',
      url: 'q/pdf-template',
      columns: [
        {
          name: 'id',
          type: 'number'
        }
			]
    },
    $as: 'pdf_template'
  })
})

export default query.toJson()