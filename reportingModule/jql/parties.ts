import { Query, TableOrSubquery } from 'node-jql'

const query = new Query({
  $from: new TableOrSubquery({
    table: {
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
          name: 'erpCode',
          type: 'string'
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
    },
    $as: 'party'
  })
})

export default query.toJson()
