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
