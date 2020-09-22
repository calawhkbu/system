import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceQuery: ['person', 'person_invitation']
    }
  ],
  columns: [
    { key: 'id' },
    { key: 'userName' },
    { key: 'firstName' },
    { key: 'lastName' },
    { key: 'displayName' },
    { key: 'invitationStatus' },
    { key: 'canResend' },
    { key: 'canDelete' },
    { key: 'canRestore' },
    { key: 'updatedAt' },
  ]
} as JqlDefinition

/* import { Query, FromTable } from 'node-jql'

const query = new Query({
  $distinct: true,
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/person/query/person_invitation',
      columns: [
        {
          name: 'id',
          type: 'number',
        },
        {
          name: 'userName',
          type: 'string',
        },
        {
          name: 'firstName',
          type: 'string',
        },
        {
          name: 'lastName',
          type: 'string',
        },
        {
          name: 'displayName',
          type: 'string',
        },
        {
          name: 'invitationStatus',
          type: 'string',
        },

        {
          name: 'canResend',
          type: 'number',
        },
        {
          name: 'canDelete',
          type: 'number',
        },
        {
          name: 'canRestore',
          type: 'number',
        },
        {
          name: 'updatedAt',
          type: 'string',
        },
      ],
    },
    'user'
  ),
})

export default query.toJson() */
