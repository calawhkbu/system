import { Query, FromTable } from 'node-jql'

const query = new Query({
  $from: new FromTable({
    method: 'POST',
    url: 'api/party/query/party',
    columns: [
      {
        name: 'id',
        type: 'number'
      },
      {
        name: 'partyGroupCode',
        type: 'string'
      },
      {
        name: 'isBranch',
        type: 'boolean'
      },
      {
        name: 'name',
        type: 'string'
      },
      {
        name: 'shortName',
        type: 'string'
      },
      {
        name: 'groupName',
        type: 'string'
      },
      {
        name: 'email',
        type: 'string'
      },
      {
        name: 'phone',
        type: 'string'
      }
    ]
  }, 'party')
})

export default query.toJson()
