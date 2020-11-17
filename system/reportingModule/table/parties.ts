import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceQuery: ['party', 'party']
    }
  ],
  columns: [
    { key: 'id' },
    { key: 'name' },
    { key: 'shortName' },
    { key: 'groupName' },
  ]
} as JqlDefinition
