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
    { key: 'fullDisplayName' },
    { key: 'partiesName' },
    { key: 'firstName' },
    { key: 'lastName' },
    { key: 'displayName' },
    { key: 'invitationStatus' },
    { key: 'canResend' },
    { key: 'canDelete' },
    { key: 'canRestore' },
    { key: 'updatedAt' },


    // { key: 'rolesName' }
  ]
} as JqlDefinition
