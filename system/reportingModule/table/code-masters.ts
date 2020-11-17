import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceQuery: ['code', 'code_master']
    }
  ],
  columns: [
    { key: 'id' },
    { key: 'partyGroupCode' },
    { key: 'codeType' },
    { key: 'code' },
    { key: 'name' },
    { key: 'canResetDefault' },
  ]
} as JqlDefinition
