import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceQuery: ['i18n', 'i18n']
    }
  ],
  columns: [
    { key: 'id' },
    { key: 'partyGroupCode' },
    { key: 'version' },
    { key: 'category' },
    { key: 'key' },
    { key: 'value' },
    { key: 'canResetDefault' }
  ]
} as JqlDefinition
