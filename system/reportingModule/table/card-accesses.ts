import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceQuery: ['cardAccess', 'card_access']
    }
  ],
  columns: [
    { key: 'id' },
    { key: 'name' },
    { key: 'partyGroupCode' },
    { key: 'disabled' },
    { key: 'partyGroupSpecific' },
    { key: 'canDelete' },
    { key: 'canRestore' }
  ]
} as JqlDefinition
