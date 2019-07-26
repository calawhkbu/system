import { Query, FromTable } from 'node-jql'

const query = new Query({
  $from: new FromTable({
    method: 'POST',
    url: 'api/alery/query/alert',
    columns: [
      {
        name: 'entityId'
      }
    ]
  }, 'alert')
})

export default query.toJson()
