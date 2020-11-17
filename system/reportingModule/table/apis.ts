import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceQuery: ['api', 'api']
    }
  ],
  columns: [
    { key: 'id' },
    { key: 'name' },
    { key: 'refreshToken' },
    { key: 'updatedAt' },
  ],
} as JqlDefinition
