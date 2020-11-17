import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceQuery: ['role', 'role']
    }
  ],
  columns: [
    { key: 'id' },
    { key: 'roleName' },
    { key: 'roleGroup' },
    { key: 'roleDescription' },
    { key: 'filter' },
    { key: 'canResetDefault' },
  ]
} as JqlDefinition
