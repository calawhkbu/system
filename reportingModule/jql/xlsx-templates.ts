import { Query, TableOrSubquery } from 'node-jql'

const query = new Query({
  $from: new TableOrSubquery({
    table: {
      method: 'POST',
      url: 'q/excel-templates',
      columns: [
        {
          name: 'id',
          type: 'number'
        }
			]
    },
    $as: 'xlsx_template'
  })
})

export default query.toJson()