import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceType: 'count',
      dataServiceQuery: ['person', 'person_invitation']
    }
  ],
  columns: [
    { key: 'count' }
  ]
} as JqlDefinition
